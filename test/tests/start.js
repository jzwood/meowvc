const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  console.info(chalk.inverse('NO NAME'))
  testOps.testMu(['start'])

  testOps.newline()

  console.info(chalk.inverse('my-first-webapp'))
  testOps.testMu(['start','my-first-webapp'])
}
