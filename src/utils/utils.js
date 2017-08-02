const fs = require('fs-extra')
const path = require('path')

const root = require('./sys/root')
const cwd = require('./sys/cwd')

module.exports = {
  dest() {
    return path.join(cwd, root, ...arguments)
  }
}
