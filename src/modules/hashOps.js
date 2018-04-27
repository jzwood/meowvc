/**
 * HASHING FUNCTIONS
 */

const path = require('path')
const crc = require('crc')
const muOps = require('./muOps')
const gl = require('../constant')

module.exports = {
  hashIt,
  diskCache
}

/**
* @description hashes data w/ a cyclic redundancy check
* @param {String} data - utf string data
* @returns {String} hashsum
*/
function hashIt(buffer) {
  const h = crc.crc32(buffer).toString(16)
  if (h === '0') return '00000000'
  return h
}

/**
* @description caches lines & file to disk and returns the hashsum key for file
* @param {String} fpath - file path
* @returns {String} hashsum
*/
function diskCache(GlMem, buffer, isutf8) {
  const isUncached = hash => !(GlMem.memory.has(hash))
  const cacheIt = data => {
    GlMem.memory.add(data)
  }

  const fileHash = hashIt(buffer)
  if(!isutf8){
    GlMem.binQueue.push([path.join(muOps.to.bin, gl.insert(fileHash, 2, '/')), buffer])
  }else{
    const file = buffer.toString('utf8')
    if (isUncached(fileHash)) {
      cacheIt(fileHash)
      const hashes = file.split(gl.eol).map((line, _, arrayOfLines) => {
        const lineHash = hashIt(line)
        if (isUncached(lineHash) || arrayOfLines.length === 1) {
          cacheIt(lineHash)
          GlMem.lineQueue.push([path.join(muOps.to.lines, gl.insert(lineHash, 2, '/')), line])
        }
        return lineHash
      })
      GlMem.fileQueue.push([path.join(muOps.to.files, gl.insert(fileHash, 2, '/')), hashes])
    }
  }
  return fileHash
}
