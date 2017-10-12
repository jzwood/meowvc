const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {
  const name = 'state'
  testOps.setupTest(flags, name)

  testOps.newline()
  console.info(chalk.inverse('ADD FILES'))
  let newFiles = Object.keys(testOps.addFiles(4))

  console.info(chalk.inverse('MU STATE, MU SAVE'))
  testOps.testMu(['state'])
  testOps.muSave()

  testOps.newline()

  console.info(chalk.inverse('DEL 2 FILES'))
  for(let i=0, n=Math.floor(newFiles.length/2); i<n; i++){
    testOps.removeFile(newFiles[i])
  }

  console.info(chalk.inverse('MU STATE, MU SAVE'))
  testOps.testMu(['state'])
  testOps.muSave()

  testOps.newline()

  console.info(chalk.inverse('MOD FILES'))
  for(let i=Math.floor(newFiles.length/2), n=newFiles.length; i<n; i++){
    testOps.modFile(newFiles[i])
  }

  console.info(chalk.inverse('MU STATE, MU SAVE'))
  testOps.testMu(['state'])
  testOps.muSave()

  testOps.newline()

  console.info(chalk.inverse('RENAME FILES'))
  for(let i=Math.floor(newFiles.length/2), n=newFiles.length; i<n; i++){
    testOps.rename(newFiles[i])
  }

  console.info(chalk.inverse('MU STATE, MU SAVE'))
  testOps.testMu(['state'])
  testOps.muSave()

  console.info(chalk.inverse('MU HISTORY'))
  testOps.testMu(['history'])

  console.info(chalk.inverse('MU HISTORY 2'))
  testOps.testMu(['history','2'])

  testOps.cleanupTest(flags, name)
}
