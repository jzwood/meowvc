const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const isUtf8 = require('is-utf8')
const loader = require('./utils/loader')
const mod = loader.require('modules')
const gl = require('./constant')

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

  function isUnchanged() {
    return difference(null, null, diff => diff.nothingChanged)
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function save(head, mdata){
    const hash = mod.hashOps.diskCache.bind(null, GlMem)
    const handle = diff => {
      const po = mod.pointerOps()
      if(diff.nothingChanged && !head){
        console.info(chalk.yellow('Warning: no changes detected. Save cancelled.'))
      }else{
        _writeToDisk()
        const [head, version] = [po.head, po.version]
        mod.metaOps(head).update(version, mdata)
        fs.outputJsonSync(mod.muOps.path('history', head, 'v' + version + '.json'), diff.currentTree)
        po.update()
        console.info(chalk.green(`${head} v${version} successfully saved!`))
      }
    }
    _preCache()
    difference(head, null, handle, null, hash)
  }

  function checkout(head, version, filterPattern=null){
    const handle = diff => {
      let data
      while(data = diff.modified.pop()) {
        mod.fileOps.unmodify(data)
      }
      while(data = diff.added.pop()) {
        mod.fileOps.unadd(data)
      }
      while(data = diff.deleted.pop()) {
        mod.fileOps.undelete(data)
      }
    }
    difference(head, version, handle, filterPattern)
  }

  /**
  * @description collects all added, modfied, and deleted files and passes them to handle fxn
  */
  function difference(head, version, handle, filterPattern, hash=mod.hashOps.hashIt) {
    targetTree = mod.treeOps.getSavedData(head, version)
    // currentTree implicity populates GlMem.fileHashLog
    currentTree = currentTree || mod.treeOps.treeify(_forEachFile(hash))
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

    // let added = Array.from(fileHashLog).reduce((accum, hash0fp1) =>
    //   filterPattern.test(hash0fp1[1]) ? accum.concat({'fp': hash0fp1[0]}) : accum, [])

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
    return (currentTree, childpath, relpath, status) => {
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
