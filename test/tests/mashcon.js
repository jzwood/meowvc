const test = require('ava')
const chalk = require('chalk')

const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'conflicts'
const flags = []

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const save1 = await tester.addFiles(4)
  const files1 = Object.keys(save1)

  helper.print(chalk.inverse('MU'))
  await tester.muSave()

  helper.print(chalk.inverse('MOD FILES'))

  await helper.modFiles(files1)

  helper.print(chalk.inverse('MU SAVE'))
  tester.muSave()

  helper.print(chalk.inverse('MU GET MASTER V0 && SAVEAS DEVELOP'))
  tester.testMu(['get', 'master', 'v0'])
  tester.testMu(['saveas', 'develop'])

  helper.print(chalk.inverse('MOD FILES'))
  files1.forEach(fp => {
    tester.modFile(fp)
  })
  helper.print(chalk.inverse('MU SAVE'))
  tester.muSave()

  helper.print(chalk.inverse('MU MASH'))
  tester.testMu(['mash', 'master'])

  const cleanup = setInterval(() => {
    if(!global.muReplOpen){
      clearInterval(cleanup)
      tester.testMu(['state'])
      tester.cleanupTest(flags, name)
    }
  }, 2000)
})
