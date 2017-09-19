const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  testOps.testMu(['start','test/get'])

  testOps.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  const save1 = testOps.addFiles(4)
  let files1 = Object.keys(save1)

  console.info(chalk.inverse('MU'))
  testOps.testMu(['save'])
  testOps.testMu(['which'])

  console.info(chalk.inverse('DEL FILES'))
  files1.forEach(fp => {
    testOps.removeFile(fp)
  })

  console.info(chalk.inverse('ADD FILES'))
  const save2 = testOps.addFiles(4)
  let files2 = Object.keys(save2)

  console.info(chalk.inverse('MU'))
  testOps.testMu(['saveas', 'develop'])
  testOps.testMu(['which'])
  testOps.testMu(['get','master'])

  console.info(chalk.inverse('VERIFYING'))
  testOps.verify(save1)

  console.info(chalk.inverse('MU'))
  testOps.testMu(['get','develop'])

  console.info(chalk.inverse('VERIFYING'))
  testOps.verify(save2)

  testOps.cleanupTest()
}
