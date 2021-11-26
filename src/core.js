const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const isUtf8 = require('is-utf8')
const loader = require('./utils/loader')
const mod = loader.require('modules')
const simpleSet = require('./utils/simpleSet')
const { print } = require('./utils/print')

const GlMem = {
  memory: simpleSet(),
  fileHashLog: new Map(),
  binQueue: []
}

const trees = {}

module.exports = {
  save,
  checkout,
  difference,
  isUnchanged
}

/**
 * @returns promise
 */
function isUnchanged() {
  const handle = diff => diff.nothingChanged
  return difference({
    handle
  })
}

/**
 * @description stores every hash on disk into RAM
 */
async function save({ head, mdata }) {
  const hash = mod.hashOps.diskCache.bind(null, GlMem)
  const handle = async diff => {
    const po = mod.pointerOps
    if (diff.nothingChanged && !head) {
      print(chalk.yellow('Warning: no changes detected. Save cancelled.'))
    } else {
      await _writeToDisk()
      const [head, version] = [po.head, po.version]
      await mod.metaOps.update(head, version, mdata)
      await fs.outputJson(mod.muOps.path('history', head, 'v' + version + '.json'), diff.currentTree)
      await po.incrementVersion()
      print(chalk.green(`${head} v${version} successfully saved!`))
    }
  }
  await _preCache()
  return difference({
    head,
    handle,
    hash
  })
}

function checkout({ head, version, filterPattern }) {
  const handle = async diff => {
    const p1 = Promise.all(diff.modified.map(mod.fileOps.unmodify))
    const p2 = Promise.all(diff.added.map(mod.fileOps.unadd))
    const p3 = Promise.all(diff.deleted.map(mod.fileOps.undelete))
    await Promise.all([p1, p2, p3])
  }
  return difference({ head, version, handle, filterPattern })
}

/**
 * @description collects all added, modfied, and deleted files and passes them to handle fxn
 */
async function difference({ head, version, handle, filterPattern, hash = mod.hashOps.hashIt }) {
  trees.target = await mod.treeOps.getSavedData(head, version)
  // currentTree implicity populates GlMem.fileHashLog
  trees.current = trees.current || await mod.treeOps.treeify(_forEachFile(hash))
  const fileHashLog = new Map(GlMem.fileHashLog) //shallow clone
  const targetFileHashes = Object.keys(trees.target.dat)

  const modified = []
  const deleted = []

  let targetHashsum
  while (targetHashsum = targetFileHashes.pop()) {
    const data = trees.target.dat[targetHashsum]
    const [isutf8, size, files] = data
    const filepaths = Object.keys(files)
    let fp
    while (fp = filepaths.pop()) {
      const equivFiles = currentHashsum = fileHashLog.get(fp)
      const equivHashes = (currentHashsum === targetHashsum)

      fileHashLog.delete(fp)

      if (!filterPattern || filterPattern.test(fp)) {
        const mtime = files[fp]
        const fileDiff = {
          fp,
          currentHashsum,
          targetHashsum,
          isutf8,
          mtime
        }
        if (equivFiles && !equivHashes) {
          modified.push(fileDiff)
        } else if (!equivFiles) {
          deleted.push(fileDiff)
        }
      }
    }
  }

  let added = []
  fileHashLog.forEach((hash, fp) => {
    if (!filterPattern || filterPattern.test(fp)) {
      added.push({
        'fp': fp
      })
    }
  })

  const nothingChanged = !added.length && !deleted.length && !modified.length

  // added, modified, & deleted collected
  return handle({
    currentTree: trees.current,
    nothingChanged,
    added,
    deleted,
    modified
  })
}


/**
 * @description saves each file to disk and updates fs tree
 */
function _forEachFile(cacheFxn) {
  return async (currentTree, { relpath, status }) => {
    const inode = status.ino
    const onfile = mod.treeOps.getOnFileData(trees.target, inode, relpath)
    const data = {
      size: status.size,
      mtime: fs._toUnixTimestamp(status.mtime),
      isutf8: onfile.isutf8
    }

    let hashsum = mod.treeOps.getHashByInode(trees.target, inode)
    if (!onfile.exists ||
      onfile.size !== data.size ||
      onfile.mtime !== data.mtime) {
      const buffer = await fs.readFile(relpath) //don't include encoding
      data.isutf8 = isUtf8(buffer) >> 0 //super fast integer casting
      hashsum = cacheFxn(buffer, data.isutf8)
    }

    GlMem.fileHashLog.set(relpath, hashsum)
    mod.treeOps.setHashByInode(currentTree, inode, hashsum)
    mod.treeOps.setTreeData(currentTree, hashsum, relpath, data)
  }
}

/**
 * @description stores every hash on disk into RAM
 */
function _preCache() {

  async function cacheIt(cPath) {
    await fs.ensureDir(cPath)
    return Promise.all((await fs.readdir(cPath))
      .map(d => fs.readdir(path.join(cPath, d))
        .then(dirs => dirs.map(f => GlMem.memory.add('' + d + f)))
        .catch(e => {
          if (e.code !== 'ENOTDIR') throw e
        })
      )
    )
  }

  return cacheIt(mod.muOps.to.bin)
}

async function _writeToDisk() {
  const streamWrite = async (fpath, data) => {
    await fs.ensureDir(path.dirname(fpath))
    const writeStream = fs.createWriteStream(fpath)
    await writeStream.write(data)
    writeStream.end()
  }

  async function writeFiles(dataArr, incr){
    const head= dataArr.slice(0,incr)
    const tail = dataArr.slice(incr)
    await Promise.all(head.map(([fpath, data]) => streamWrite(fpath, data)))
    return tail.length ? writeFiles(tail, incr) : true
  }

  const NUM_PARALLEL_WRITES = 10
  return writeFiles(GlMem.binQueue, NUM_PARALLEL_WRITES)
}
