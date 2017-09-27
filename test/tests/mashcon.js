const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = flags => {
  testOps.setupTest()
  testOps.muStart(flags,'conflicts')

  testOps.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  const save1 = testOps.addFiles(4)
  let files1 = Object.keys(save1)

  console.info(chalk.inverse('MU'))
  testOps.muSave()

  console.info(chalk.inverse('MOD FILES'))
  files1.forEach(fp => {
    testOps.modFile(fp)
  })
  console.info(chalk.inverse('MU SAVE'))
  testOps.muSave()

  console.info(chalk.inverse('MU GET MASTER V0 && SAVEAS DEVELOP'))
  testOps.testMu(['get', 'master', 'v0'])
  testOps.testMu(['saveas', 'develop'])

  console.info(chalk.inverse('MOD FILES'))
  files1.forEach(fp => {
    testOps.modFile(fp)
  })
  console.info(chalk.inverse('MU SAVE'))
  testOps.muSave()

  console.info(chalk.inverse('MU MASH'))
  testOps.testMu(['mash', 'master'])

  const cleanup = setInterval(() => {
    if(!global.muReplOpen){
      clearInterval(cleanup)
      testOps.testMu(['state'])
      testOps.cleanupTest(flags)
    }
  }, 2000)

}
