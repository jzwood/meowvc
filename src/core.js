const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const chalk = require('chalk')
const pointerOps = require('./pointerOps')
const frankenstein = require('./frankenstein')
const prompt = require('./prompt')

module.exports = cwd => {

  const Root = '.mu'

  const GlConsts = {
    linesPath: path.join(cwd, Root, 'disk_mem', 'lines'),
    filesPath: path.join(cwd, Root, 'disk_mem', 'files'),
    get baseCase() {
      return {
        'ino': {},
        'dat': {}
      }
    },
    print: {
      modified: str => console.log(chalk.cyan('%\t' + str)),
      deleted: str => console.log(chalk.red('x\t' + str)),
      renamed: (strOld, strNew) => console.log(chalk.magenta('&\t' + strOld, '->', strNew)),
      added: str => console.log(chalk.yellow('+\t' + str))
    },
    ignore: _ignore()
  }

  const GlData = {
    memory: new Set(),
    recordedFileHash: new Map(),
    outputFileQueue: [],
    outputLineQueue: []
  }

  function _ignore() {
    const ignore_file = fs.readFileSync(path.join(cwd, Root, '_ignore'), 'utf8').trim().split('\n').join('|')
    const ignore = ignore_file ? new RegExp(ignore_file) : void(0)
    return ignore
  }

  function _getSavedData(checkout) {
    let lastSavePath
    if (checkout){
      lastSavePath = path.join(cwd, Root, 'history', checkout.head, 'v' + checkout.version)
    } else {
      const po = pointerOps(cwd, Root)
      const currentVersion = po.version
      lastSavePath = path.join(cwd, Root, 'history', po.head, 'v' + Math.max(0, currentVersion - 1))
    }
    const lastSave = fs.existsSync(lastSavePath) ? fs.readJsonSync(lastSavePath) : GlConsts.baseCase
    return lastSave
  }

  return {
    save(srcHead, onComplete) {
      _preCache()
      GlConsts.lastSave = _getSavedData()
      const tree = blockify(cwd, false)
      const dest = (head, version) => path.join(cwd, Root, 'history', head, 'v' + version)
      const po = pointerOps(cwd, Root)
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
    diff(pattern, checkout) {
      const handleFile = pattern ? frankenstein(cwd).undo : GlConsts.print
      GlConsts.lastSave = _getSavedData(checkout)
      // tree implicity populates GlData.recordedFileHash
      const tree = blockify(cwd, true)
      // previousFileHashes = previous recorded Hashes
      const previousFileHashes = Object.keys(GlConsts.lastSave.dat)
      let hashsum
      while (hashsum = previousFileHashes.pop()) {
        const filepaths = Object.keys(GlConsts.lastSave.dat[hashsum]) // array
        filepaths.forEach(fp => {

          const equivFiles = hash = GlData.recordedFileHash.get(fp)
          const equivHashes = (hash === hashsum)

          GlData.recordedFileHash.delete(fp)

          if (!pattern || pattern.test(fp)) {
            const mtime = GlConsts.lastSave.dat[hashsum][fp][1]
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

  // iterates through every file in root directory
  function blockify(parent, isStat) {
    if (!fs.existsSync(parent)) return GlConsts.baseCase
    const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
      if (GlConsts.ignore && GlConsts.ignore.test(child)) return tree
      const childPath = path.join(parent, child)
      const status = fs.statSync(childPath)
      const isDir = status.isDirectory()
      const isFile = status.isFile()
      if (isDir) {
        const subTree = blockify(childPath, isStat)
        Object.assign(tree.ino, subTree.ino)
        // Object.assign(tree.dat, subTree.dat)
        for(let h in subTree.dat){
          tree.dat[h] = tree.dat[h] || {}
          Object.assign(tree.dat[h], subTree.dat[h])
        }
      } else if (isFile) {
        const childRelativePath = path.relative(cwd, childPath)
        const inode = status.ino,
          size = status.size,
          mtime = fs._toUnixTimestamp(status.mtime)

        // string
        const lastHash = GlConsts.lastSave.ino[inode]
        // object
        const lastPathsFromHash = GlConsts.lastSave.dat[lastHash]
        // array
        const lastDataFromPath = lastHash && lastPathsFromHash && lastPathsFromHash[childRelativePath]

        let data = lastDataFromPath //array
        let hashsum = lastHash //string

        if (!lastDataFromPath || lastDataFromPath[0] !== size || lastDataFromPath[1] !== mtime) {
          data = [size, mtime]
          hashsum = isStat ? _hashOnly(childRelativePath) : _diskCache(childRelativePath)
        }

        GlData.recordedFileHash.set(childRelativePath, hashsum)
        tree.ino[inode] = hashsum

        tree.dat[hashsum] = tree.dat[hashsum] || {}
        tree.dat[hashsum][childRelativePath] = data

      }
      return tree
    }, GlConsts.baseCase)
    return hashFileLookup
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

  /*
  * HASHING FUNCTIONS
  */


  /**
  * @description hashes data w/ a cyclic redundancy check
  * @param {String} data - utf string data
  * @returns {String} hashsum
  */
  function _hashIt(data) {
    const h = crc.crc32(data).toString(16)
    if (h === '0') return '00000000'
    return h
  }

  /**
  * @description returns the hashsum key for file
  * @param {String} fpath - file path
  * @returns {String} hashsum
  */
  function _hashOnly(fpath) {
    const file = fs.readFileSync(fpath, 'utf8')
    return _hashIt(file)
  }

  /**
  * @description caches lines & file to disk and returns the hashsum key for file
  * @param {String} fpath - file path
  * @returns {String} hashsum
  */
  function _diskCache(fpath) {
    const isUncached = hash => !(GlData.memory.has(hash))
    const cacheIt = data => {
      GlData.memory.add(data)
    }

    const file = fs.readFileSync(fpath, 'utf8')
    const fileHash = _hashIt(file)

    if (isUncached(fileHash)) {
      cacheIt(fileHash)
      const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
      const hashes = file.split('\n').map(line => {
        const lineHash = _hashIt(line)
        if (isUncached(lineHash)) {
          cacheIt(lineHash)
          GlData.outputLineQueue.push([path.join(GlConsts.linesPath, insert(lineHash, 2, '/')), line])
        }
        return lineHash
      })
      GlData.outputFileQueue.push([path.join(GlConsts.filesPath, insert(fileHash, 2, '/')), hashes, fpath])
    }
    return fileHash
  }
}
