/*
* HASHING FUNCTIONS
*/

const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')

module.exports = {
  _hashOnly,
  _diskCache
}

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
function _hashOnly(fpath, encoding) {
  const file = fs.readFileSync(fpath, encoding)
  return _hashIt(file)
}

/**
* @description caches lines & file to disk and returns the hashsum key for file
* @param {String} fpath - file path
* @returns {String} hashsum
*/
function _diskCache(GlData, GlConsts, fpath, encoding) {
  const isUncached = hash => !(GlData.memory.has(hash))
  const cacheIt = data => {
    GlData.memory.add(data)
  }

  const file = fs.readFileSync(fpath, encoding)
  const fileHash = _hashIt(file)

  if (isUncached(fileHash)) {
    cacheIt(fileHash)
    const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
    if (encoding === 'utf8') {
      const hashes = file.split(GlConsts.eol).map(line => {
        const lineHash = _hashIt(line)
        if (isUncached(lineHash)) {
          cacheIt(lineHash)
          GlData.outputLineQueue.push([path.join(GlConsts.linesPath, insert(lineHash, 2, '/')), line])
        }
        return lineHash
      })
      GlData.outputFileQueue.push([path.join(GlConsts.filesPath, insert(fileHash, 2, '/')), hashes, encoding])
    }
    // else {
    //   GlData.outputLineQueue.push([path.join(GlConsts.linesPath, insert(fileHash, 2, '/')), file])
    //   GlData.outputFileQueue.push([path.join(GlConsts.filesPath, insert(fileHash, 2, '/')), [fileHash], encoding])
    // }
  }
  return fileHash
}
