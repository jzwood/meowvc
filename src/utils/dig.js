'use strict'

// get a deep object literal value that might not exist
module.exports = cb => {
  try {
    return cb()
  } catch (e) {
    return false
  }
}
