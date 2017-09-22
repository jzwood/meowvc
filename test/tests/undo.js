const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {
  testOps.setupTest()
  testOps.muStart(flags,'undo')

  testOps.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  const fileDataMap = testOps.addFiles(4)
  let newFiles = Object.keys(fileDataMap)
  console.info(chalk.inverse('MU'))
  testOps.testMu(['save'])

  testOps.newline()

  console.info(chalk.inverse('DEL FILES'))
  newFiles.forEach(fp => {
    testOps.removeFile(fp)
  })

  console.info(chalk.inverse('MU UNDO'))
  testOps.testMu(['undo','.'])
  testOps.verify(fileDataMap)

  testOps.newline()

  console.info(chalk.inverse('MOD FILES'))
  newFiles.forEach(fp => {
    testOps.modFile(fp)
  })

  console.info(chalk.inverse('MU UNDO'))
  testOps.testMu(['undo','.'])
  testOps.verify(fileDataMap)

  testOps.newline()

  console.info(chalk.inverse('RENAME FILES'))
  newFiles.forEach(fp => {
    testOps.rename(fp)
  })

  console.info(chalk.inverse('MU UNDO'))
  testOps.testMu(['undo','.'])
  testOps.verify(fileDataMap)

  testOps.cleanupTest(flags)
}
