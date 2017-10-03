const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {
  const name = 'start'
  testOps.setupTest(flags, name)

  testOps.newline()
  testOps.muStart(flags)

  testOps.cleanupTest(flags, name)
}
