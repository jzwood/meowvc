const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  testOps.testMu(['start','test-conflict'])

  testOps.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  const save1 = testOps.addFiles(4)
  let files1 = Object.keys(save1)

  console.info(chalk.inverse('MU'))
  testOps.testMu(['save'])
  testOps.testMu(['which'])

  console.info(chalk.inverse('MOD FILES'))
  files1.forEach(fp => {
    testOps.modFile(fp)
  })

  console.info(chalk.inverse('MU SAVEAS'))
  testOps.testMu(['saveas', 'develop'])

  console.info(chalk.inverse('MU MASH'))
  testOps.testMu(['mash', 'master'])

  testOps.cleanupTest()
}
