const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {
  testOps.setupTest()
  testOps.muStart(flags,'mash')

  testOps.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  const save1 = testOps.addFiles(4)
  let files1 = Object.keys(save1)

  console.info(chalk.inverse('STATE'))
  testOps.muSave()
  testOps.testMu(['which'])

  console.info(chalk.inverse('MOD 2 FILES & 2 RM FILES'))
  files1.forEach((fp,i) => {
    if(i%2){
      testOps.modFile(fp)
    }else{
      testOps.removeFile(fp)
    }
  })

  console.info(chalk.inverse('MU SAVEAS'))
  testOps.testMu(['saveas', 'develop'])

  console.info(chalk.inverse('MU STATE'))
  testOps.testMu(['state'])

  console.info(chalk.inverse('MU MASH MASTER'))
  testOps.testMu(['mash', 'master'])
  console.info(chalk.inverse('MU STATUS'))
  testOps.testMu(['state'])

  testOps.cleanupTest(flags)
}
