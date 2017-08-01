const root = require('./sys/root')
const cwd = require('./sys/cwd')

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const isBinaryFile = require('isbinaryfile')

const pointerOps = require('./pointerOps')
const frankenstein = require('./frankenstein')
const fst = require('./fst')
const prompt = require('./prompt')
const h = require('./hashing')
const GlConsts = require('./glConsts')


module.exports = () => {

  const GlTemp = {}
  const GlData = {
    memory: new Set(),
    recordedFileHash: new Map(),
    outputFileQueue: [],
    outputLineQueue: []
  }

  return {
    save, diff
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function save(srcHead, onComplete) {
    _preCache()
    GlTemp.lastSave = fst.getSavedData()
    const tree = fst.treeify(cwd, _forEachFile(h._diskCache.bind(null, GlData, GlConsts)))
    const dest = (head, version) => path.join(cwd, root, 'history', head, 'v' + version + '.json')
    const po = pointerOps()
    const saveit = () => {
      let outputFile, outputLine
      while (outputFile = GlData.outputFileQueue.pop()) {
        fs.outputJsonSync(outputFile[0], outputFile[1], outputFile[2])
      }
      while (outputLine = GlData.outputLineQueue.pop()) {
        fs.outputFileSync(outputLine[0], outputLine[1])
      }
      fs.outputJsonSync(dest(po.head, po.version), tree) // write tree
      po.incrPointer()
      po.writePointer()
    }
    if (GlData.outputFileQueue.length) {
      saveit()
      onComplete.success(po)
      return true
    } else if (srcHead) {
      fs.copySync(dest(srcHead, po.branch[srcHead] - 1), dest(po.head, po.version))
      onComplete.success(po)
      po.incrPointer()
      po.writePointer()
      return true
    } else {
      prompt(saveit, onComplete)
      return false
    }
  }

  /**
  * @description can show difference to last save, undo differences and switch branches
  */
  function diff(pattern=null, name=null) {
    const handleFile = pattern ? frankenstein().undo : GlConsts.print
    GlTemp.lastSave = fst.getSavedData(name)
    // tree implicity populates GlData.recordedFileHash
    const tree = fst.treeify(cwd, _forEachFile(h._hashOnly))
    // previousFileHashes = previous recorded Hashes
    const previousFileHashes = Object.keys(GlTemp.lastSave.dat)
    let hashsum
    while (hashsum = previousFileHashes.pop()) {
      const data = GlTemp.lastSave.dat[hashsum]
      const files = data[2]
      const filepaths = Object.keys(files)
      let fp
      while (fp = filepaths.pop()) {
        const equivFiles = hash = GlData.recordedFileHash.get(fp)
        const equivHashes = (hash === hashsum)

        GlData.recordedFileHash.delete(fp)

        if (!pattern || pattern.test(fp)) {
          const mtime = files[fp]
          if (equivFiles && !equivHashes) {
            handleFile.modified(fp, hashsum, mtime)
          } else if (!equivFiles){
            handleFile.deleted(fp, hashsum, mtime)
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
      let hashsum = fst.getHashByInode(GlTemp.lastSave, inode)
      const data = {
        size: status.size,
        mtime: fs._toUnixTimestamp(status.mtime),
        encoding: isBinaryFile.sync(childpath, status.size) ? 'binary' : 'utf8'
      }

      const onfile = fst.getOnFileData(GlTemp.lastSave, inode, relpath)

      if(!onfile.exists ||
        onfile.encoding !== onfile.encoding ||
        onfile.size !== data.size ||
        onfile.mtime !== data.mtime) {
        hashsum = cacheFxn(relpath, data.encoding)
      }

      GlData.recordedFileHash.set(relpath, hashsum)
      fst.setHashByInode(tree, inode, hashsum)
      fst.setTreeData(tree, hashsum, relpath, data)
    }
  }

  /**
  * @description stores every hash on disk into RAM
  */
  function _preCache() {
    const lp = GlConsts.linesPath,
      fp = GlConsts.filesPath
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
