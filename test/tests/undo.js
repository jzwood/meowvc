const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  testOps.testMu(['start'])

  testOps.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  let newFiles = testOps.addFiles(4)
  console.info(chalk.inverse('MU'))
  testOps.testMu(['state'])
  testOps.testMu(['save'])

  testOps.newline()

  console.info(chalk.inverse('DEL FILES'))
  newFiles.forEach(fp => {
    testOps.removeFile(fp)
  })

  console.info(chalk.inverse('MU UNDO'))
  testOps.testMu(['undo','.'])

  testOps.newline()

  console.info(chalk.inverse('MOD FILES'))
  newFiles.forEach(fp => {
    testOps.modFile(fp)
  })

  console.info(chalk.inverse('MU UNDO'))
  testOps.testMu(['undo','.'])

  testOps.newline()

  console.info(chalk.inverse('RENAME FILES'))
  newFiles.forEach(fp => {
    testOps.rename(fp)
  })

  console.info(chalk.inverse('MU UNDO'))
  testOps.testMu(['undo','.'])
}
