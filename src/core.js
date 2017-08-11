const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const isUtf8 = require('is-utf8')
const loader = require('./utils/loader')
const mod = loader.require('modules')
const gl = require('./constant')

module.exports = () => {

  const GlTemp = {}
  const GlMem = {
    memory: new Set(),
    fileHashLog: new Map(),
    fileQueue: [],
    lineQueue: [],
    binQueue: []
  }
  let lastSave

  return {
    save,
    checkout,
    state: difference,
    undo: difference.bind(undefined, null, null)
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function save(head, version){
    const forEach = _forEachFile(mod.hashing.diskCache.bind(null, GlMem))
    const handle = diff => {
      const dest = (head, version) => gl.dest('history', head, 'v' + version + '.json')
      const po = mod.pointerOps()
      const noChange = diff.nothingChanged
      if(noChange && !head){
        console.info(chalk.yellow('Warning: no changes detected. Save aborted.'))
      }else if(noChange && head){
        fs.copySync(dest(head, Math.max(0, po.branch[head] - 1)), dest(po.head, po.version))
        onComplete.success(po)
        po.update()
      }else{ //implicity noChange = false, ie something changed
        let outputFile; while (outputFile = GlMem.fileQueue.pop()) {
          fs.outputJsonSync(outputFile[0], outputFile[1], outputFile[2])
        }
        let outputLine; while (outputLine = GlMem.lineQueue.pop()) {
          fs.outputFileSync(outputLine[0], outputLine[1])
        }
        fs.outputJsonSync(dest(po.head, po.version), diff.tree) // write tree
        po.update()
      }
    }
    _preCache()
    difference(head, version, forEach, handle)
  }

  function checkout(head, version){
    difference(head, version, /./)
  }

  /**
  * @description collects all added, modfied, and deleted files and passes them to handle fxn
  */
  function difference(head, version, forEach, handle, filterPattern) {
    lastSave = mod.fst.getSavedData(head, version)
    // tree implicity populates GlMem.fileHashLog
    // mod.fst.treeify(_forEachFile(mod.hashing.hashOnly))
    const tree = mod.fst.treeify(forEach)
    // previousFileHashes = previous recorded Hashes
    const previousFileHashes = Object.keys(lastSave.dat)

    const modified = [], deleted = []

    let hashsum; while (hashsum = previousFileHashes.pop()) {
      const data = lastSave.dat[hashsum]
      const [isutf8, size, files] = data
      const filepaths = Object.keys(files)
      let fp; while (fp = filepaths.pop()) {
        const equivFiles = hash = GlMem.fileHashLog.get(fp)
        const equivHashes = (hash === hashsum)

        GlMem.fileHashLog.delete(fp)

        if (!filterPattern || filterPattern.test(fp)) {
          const mtime = files[fp]
          if (equivFiles && !equivHashes) {
            modified.push([fp, hashsum, isutf8, mtime])
          } else if (!equivFiles){
            deleted.push([fp, hashsum, isutf8, mtime])
          }
        }
      }
    }
    let added = Array.from(GlMem.fileHashLog)
    if(!filter){
      added = added.filter(hash0fp1 => filterPattern.test(hash0fp1[1]))
    }

    const nothingChanged = !added.length && !deleted.length && !modified.length

    // added, modified, & deleted collected
    handle({
      tree,
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
    return (tree, childpath, relpath, status) => {
      const inode = status.ino
      const onfile = mod.fst.getOnFileData(lastSave, inode, relpath)
      const data = {
        size: status.size,
        mtime: fs._toUnixTimestamp(status.mtime),
        isutf8: onfile.isutf8
      }

      let hashsum = mod.fst.getHashByInode(lastSave, inode)
      if(!onfile.exists ||
        onfile.size !== data.size ||
        onfile.mtime !== data.mtime) {
        const buffer = fs.readFileSync(relpath) //don't include encoding
        data.isutf8 = isUtf8(buffer) ? 1 : 0
        hashsum = cacheFxn(buffer, data.isutf8)
      }

      GlMem.fileHashLog.set(relpath, hashsum)
      mod.fst.setHashByInode(tree, inode, hashsum)
      mod.fst.setTreeData(tree, hashsum, relpath, data)
    }
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function _preCache() {
    const lp = gl.linesPath,
      fp = gl.filesPath
    fs.ensureDirSync(lp)
    fs.ensureDirSync(fp)

    fs.readdirSync(lp).forEach(d => {
      fs.readdirSync(path.join(lp, d)).forEach(f => {
        GlMem.memory.add('' + d + f)
      })
    })
    fs.readdirSync(fp).forEach(d => {
      fs.readdirSync(path.join(fp, d)).forEach(f => {
        GlMem.memory.add('' + d + f)
      })
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
