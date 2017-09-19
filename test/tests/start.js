const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  console.info(chalk.inverse('NO NAME'))
  testOps.testMu(['start'])

  testOps.newline()

  console.info(chalk.inverse('test-start'))
  testOps.testMu(['start','test-start'])

  testOps.cleanupTest()
}
