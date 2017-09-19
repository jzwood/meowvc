const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  testOps.testMu(['start', 'test-mash'])

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

  const save2 = testOps.addFiles(4)
  let files2 = Object.keys(save2)

  console.info(chalk.inverse('MU SAVEAS'))
  testOps.testMu(['saveas', 'develop'])
  console.info(chalk.inverse('MU WHICH'))
  testOps.testMu(['which'])
  console.info(chalk.inverse('MU MASH'))
  testOps.testMu(['mash', 'master'])
  console.info(chalk.inverse('MU STATUS'))
  testOps.testMu(['state'])

  testOps.cleanUpTest()
}
