const fs = require('fs-extra')
const path = require('path')
const isBinaryFile = require('isbinaryfile')

const loader = require('./utils/loader')
const mod = loader.require('modules')
const gl = require('./constant')

module.exports = () => {

  const GlTemp = {}
  const GlData = {
    memory: new Set(),
    recordedFileHash: new Map(),
    outputFileQueue: [],
    outputLineQueue: []
  }

  return {
    save,
    checkout,
    state: difference,
    undo: difference.bind(undefined, null, null)
  }

  function checkout(head, version){
    difference(head, version, /./)
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function save(onComplete, srcHead) {
    _preCache()
    GlTemp.lastSave = mod.fst.getSavedData()
    const tree = mod.fst.treeify(_forEachFile(mod.hashing.diskCache.bind(null, GlData)))
    const dest = (head, version) => gl.dest('history', head, 'v' + version + '.json')
    const po = mod.pointerOps()
    const saveit = () => {
      let outputFile, outputLine
      while (outputFile = GlData.outputFileQueue.pop()) {
        fs.outputJsonSync(outputFile[0], outputFile[1], outputFile[2])
      }
      while (outputLine = GlData.outputLineQueue.pop()) {
        fs.outputFileSync(outputLine[0], outputLine[1])
      }
      fs.outputJsonSync(dest(po.head, po.version), tree) // write tree
      po.update()
    }

    if (GlData.outputFileQueue.length) {
      saveit()
      onComplete.success(po)
      return true
    } else if (srcHead) {
      fs.copySync(dest(srcHead, Math.max(0, po.branch[srcHead] - 1)), dest(po.head, po.version))
      onComplete.success(po)
      po.update()
      return true
    } else {
      mod.prompt(saveit, onComplete)
      return false
    }
  }

  /**
  * @description can show difference to last save, undo differences and switch branches
  */
  function difference(head, version, pattern=null) {
    //@todo look at in the context of get()
    const handleFile = pattern ? mod.frankenstein.undo : gl.print
    GlTemp.lastSave = mod.fst.getSavedData(head, version)
    // tree implicity populates GlData.recordedFileHash
    mod.fst.treeify(_forEachFile(mod.hashing.hashOnly))
    // previousFileHashes = previous recorded Hashes
    const previousFileHashes = Object.keys(GlTemp.lastSave.dat)
    let hashsum
    while (hashsum = previousFileHashes.pop()) {
      const data = GlTemp.lastSave.dat[hashsum]
      const [encoding, size, files] = data
      const filepaths = Object.keys(files)
      let fp
      while (fp = filepaths.pop()) {
        const equivFiles = hash = GlData.recordedFileHash.get(fp)
        const equivHashes = (hash === hashsum)

        GlData.recordedFileHash.delete(fp)

        if (!pattern || pattern.test(fp)) {
          const mtime = files[fp]
          if (equivFiles && !equivHashes) {
            handleFile.modified(fp, hashsum, encoding, mtime)
          } else if (!equivFiles){
            handleFile.deleted(fp, hashsum, encoding, mtime)
          }
        }
      }
    }
    GlData.recordedFileHash.forEach((vHash, kFile) => {
      if (!pattern || pattern.test(kFile)) {
        handleFile.added(kFile)
      }
    })
  }


  /**
  * @description saves each file to disk and updates fs tree
  */
  function _forEachFile(cacheFxn) {
    return (tree, childpath, relpath, status) => {
      const inode = status.ino
      let hashsum = mod.fst.getHashByInode(GlTemp.lastSave, inode)
      const data = {
        size: status.size,
        mtime: fs._toUnixTimestamp(status.mtime),
        encoding: isBinaryFile.sync(childpath, status.size) ? 'binary' : 'utf8'
      }

      const onfile = mod.fst.getOnFileData(GlTemp.lastSave, inode, relpath)

      if(!onfile.exists ||
        onfile.encoding !== onfile.encoding ||
        onfile.size !== data.size ||
        onfile.mtime !== data.mtime) {
        hashsum = cacheFxn(relpath, data.encoding)
      }

      GlData.recordedFileHash.set(relpath, hashsum)
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
        GlData.memory.add('' + d + f)
      })
    })
    fs.readdirSync(fp).forEach(d => {
      fs.readdirSync(path.join(fp, d)).forEach(f => {
        GlData.memory.add('' + d + f)
      })
    })
  }

}
