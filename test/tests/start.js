const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {

  testOps.setupTest()
  testOps.muStart(flags)

  testOps.newline()
  testOps.muStart(flags)

  testOps.cleanupTest(flags)
}
