const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {
  const name = 'start'
  testOps.setupTest(flags, name)

  testOps.newline()
  testOps.muStart(testOps.parseFlags(flags).local, '', '(when mu repo exists already)')

  testOps.cleanupTest(flags, name)
}
