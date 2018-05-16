const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const isUtf8 = require('is-utf8')
const loader = require('./utils/loader')
const mod = loader.require('modules')
const {print} = require('./utils/print')

module.exports = () => {

  const GlMem = {
    memory: new Set(),
    fileHashLog: new Map(),
    fileQueue: [],
    lineQueue: [],
    binQueue: []
  }
  let currentTree, targetTree

  return {
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
    return difference({handle})
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function save({head, mdata}){
    const hash = mod.hashOps.diskCache.bind(null, GlMem)
    const handle = async diff => {
      const po = mod.pointerOps
      if(diff.nothingChanged && !head){
        print(chalk.yellow('Warning: no changes detected. Save cancelled.'))
      } else {
        _writeToDisk()
        const [head, version] = [po.head, po.version]
        await mod.metaOps.update(head, version, mdata)
        fs.outputJsonSync(mod.muOps.path('history', head, 'v' + version + '.json'), diff.currentTree)
        await po.incrementVersion()
        print(chalk.green(`${head} v${version} successfully saved!`))
      }
    }
    _preCache()
    return difference({head, handle, hash})
  }

  function checkout({head, version, filterPattern}){
    const handle = async diff => {
      const p1 = Promise.all(diff.modified.map(mod.fileOps.unmodify))
      const p2 = Promise.all(diff.added.map(mod.fileOps.unadd))
      const p3 = Promise.all(diff.deleted.map(mod.fileOps.undelete))
      await Promise.all([p1, p2, p3])
    }
    return difference({head, version, handle, filterPattern})
  }

  /**
  * @description collects all added, modfied, and deleted files and passes them to handle fxn
  */
  async function difference({head, version, handle, filterPattern, hash=mod.hashOps.hashIt}) {
    targetTree = await mod.treeOps.getSavedData(head, version)
    // currentTree implicity populates GlMem.fileHashLog
    currentTree = currentTree || await mod.treeOps.treeify(_forEachFile(hash))
    const fileHashLog = new Map(GlMem.fileHashLog) //shallow clone
    const targetFileHashes = Object.keys(targetTree.dat)

    const modified = [], deleted = []

    let targetHashsum; while (targetHashsum = targetFileHashes.pop()) {
      const data = targetTree.dat[targetHashsum]
      const [isutf8, size, files] = data
      const filepaths = Object.keys(files)
      let fp; while (fp = filepaths.pop()) {
        const equivFiles = currentHashsum = fileHashLog.get(fp)
        const equivHashes = (currentHashsum === targetHashsum)

        fileHashLog.delete(fp)

        if (!filterPattern || filterPattern.test(fp)) {
          const mtime = files[fp]
          const fileDiff = {fp, currentHashsum, targetHashsum, isutf8, mtime}
          if (equivFiles && !equivHashes) {
            modified.push(fileDiff)
          } else if (!equivFiles){
            deleted.push(fileDiff)
          }
        }
      }
    }

    let added = []
    fileHashLog.forEach((hash, fp) => {
      if(!filterPattern || filterPattern.test(fp)){
        added.push({'fp': fp})
      }
    })

    const nothingChanged = !added.length && !deleted.length && !modified.length

    // added, modified, & deleted collected
    return handle({
      currentTree,
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
    return (currentTree, {relpath, status}) => {
      const inode = status.ino
      const onfile = mod.treeOps.getOnFileData(targetTree, inode, relpath)
      const data = {
        size: status.size,
        mtime: fs._toUnixTimestamp(status.mtime),
        isutf8: onfile.isutf8
      }

      let hashsum = mod.treeOps.getHashByInode(targetTree, inode)
      if(!onfile.exists ||
        onfile.size !== data.size ||
        onfile.mtime !== data.mtime) {
        const buffer = fs.readFileSync(relpath) //don't include encoding
        data.isutf8 = isUtf8(buffer) ? 1 : 0
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
    const lp = mod.muOps.to.lines
    const fp = mod.muOps.to.files
    fs.ensureDirSync(lp)
    fs.ensureDirSync(fp)

    fs.readdirSync(lp).forEach(d => {
      const linesDirPath = path.join(lp, d)
      if(fs.statSync(linesDirPath).isDirectory()){
        fs.readdirSync(linesDirPath).forEach(f => {
          GlMem.memory.add('' + d + f)
        })
      }
    })
    fs.readdirSync(fp).forEach(d => {
      const filesDirPath = path.join(fp, d)
      if(fs.statSync(filesDirPath).isDirectory()){
        fs.readdirSync(filesDirPath).forEach(f => {
          GlMem.memory.add('' + d + f)
        })
      }
    })
  }

  function _writeToDisk(){
    let outputFile; while (outputFile = GlMem.fileQueue.pop()) {
      fs.outputJsonSync(outputFile[0], outputFile[1], {encoding: 'utf8'})
    }
    let outputLine; while (outputLine = GlMem.lineQueue.pop()) {
      fs.outputFileSync(outputLine[0], outputLine[1], {encoding: 'utf8'})
    }
    let outputBinary; while (outputBinary = GlMem.binQueue.pop()) {
      fs.outputFileSync(outputBinary[0], outputBinary[1], {encoding: null})
    }
  }

}
