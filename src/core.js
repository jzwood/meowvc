const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const chalk = require('chalk')
const isBinaryFile = require("isbinaryfile")
const eol = require('os').EOL

const pointerOps = require('./pointerOps')
const frankenstein = require('./frankenstein')
const fst = require('./treeify')
const prompt = require('./prompt')
const h = require('./hashing')
const root = require('./root')

module.exports = cwd => {

  const GlConsts = require('./glConsts')(cwd)
  const GlTemp = {}
  const GlData = {
    memory: new Set(),
    recordedFileHash: new Map(),
    outputFileQueue: [],
    outputLineQueue: []
  }

  return {
    save(srcHead, onComplete) {
      _preCache()
      GlTemp.lastSave = fst.getSavedData(cwd)
      const tree = fst.treeify(cwd, _forEachFile(h.diskCache.bind(null, GlData, GlConsts)))
      const dest = (head, version) => path.join(cwd, root, 'history', head, 'v' + version)
      const po = pointerOps(cwd, root)
      const saveit = () => {
        let outputFile, outputLine
        while (outputFile = GlData.outputFileQueue.pop()) {
          fs.outputJsonSync(outputFile[0], outputFile[1])
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
    },
    diff(pattern, name) {
      const handleFile = pattern ? frankenstein(cwd).undo : GlConsts.print
      GlTemp.lastSave = fst.getSavedData(cwd, name)
      // tree implicity populates GlData.recordedFileHash
      const tree = fst.treeify(cwd, _forEachFile(h.hashOnly))
      // previousFileHashes = previous recorded Hashes
      const previousFileHashes = Object.keys(GlTemp.lastSave.dat)
      let hashsum
      while (hashsum = previousFileHashes.pop()) {
        const filepaths = Object.keys(GlTemp.lastSave.dat[hashsum]) // array
        filepaths.forEach(fp => {

          const equivFiles = hash = GlData.recordedFileHash.get(fp)
          const equivHashes = (hash === hashsum)

          GlData.recordedFileHash.delete(fp)

          if (!pattern || pattern.test(fp)) {
            const mtime = GlTemp.lastSave.dat[hashsum][fp][1]
            if (equivFiles && !equivHashes) {
              handleFile.modified(fp, hashsum, mtime)
            } else if (!equivFiles){
              handleFile.deleted(fp, hashsum, mtime)
            }
          }
        })
      }
      GlData.recordedFileHash.forEach((vHash, kFile) => {
        if (!pattern || pattern.test(kFile)) {
          handleFile.added(kFile)
        }
      })
    }
  }


  /**
  * @description
  */
  function _forEachFile(cacheFxn) {
    return (tree, childpath, relpath, status) => {
      const inode = status.ino
      let hashsum = fst.getHashByInode(GlTemp.lastSave, inode)
      const data = {
        size: status.size,
        mtime: fs._toUnixTimestamp(status.mtime),
        encoding: isBinaryFile.sync(childpath, size) ? 'binary' : 'utf8'
      }

      const file = fst.getFileData(GlTemp.lastSave, inode, relpath)

      if(!file.exists || file.encoding !== data.encoding || file.size !== data.size || file.mtime !== data.mtime) {
        data.size = file.size
        data.encoding = file.encoding
        data.mtime = file.mtime
        hashsum = cacheFxn(relpath, data.encoding)
      }

      GlData.recordedFileHash.set(relpath, hashsum)
      fst.setHashByInode(tree, inode, hashsum)
      fst.setTreeData(tree, hashsum, data)
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
