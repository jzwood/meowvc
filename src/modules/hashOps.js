/**
 * HASHING FUNCTIONS
 */

const path = require('path')
const crc32 = require('crc/lib/crc32')
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
  const h = crc32(buffer).toString(16)
  if (h === '0') return '00000000'
  return h
}

/**
* @description caches files to disk and returns the hashsum key for file
* @param {String} fpath - file path
* @returns {String} hashsum
*/
function diskCache(GlMem, buffer, isutf8) {
  const fileHash = hashIt(buffer)
  if(!(GlMem.memory.has(fileHash))) {
    GlMem.memory.add(fileHash)
    GlMem.binQueue.push([path.join(muOps.to.bin, gl.insert(fileHash, 2, '/')), buffer])
  }
  return fileHash
}
