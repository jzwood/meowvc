const test = require('ava')

const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'get'
const flags = []

test(name, async t => {
  //helper.verboseLogging(true)
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const save1 = await helper.addFiles(4)
  const files1 = Object.keys(save1)

  helper.print(chalk.inverse('MU'))
  tester.muSave()
  tester.testMu(['which'])

  helper.print(chalk.inverse('DEL FILES'))
  await helper.removeFiles(files1)

  helper.print(chalk.inverse('ADD FILES'))
  const save2 = await helper.addFiles(4)
  const files2 = Object.keys(save2)

  helper.print(chalk.inverse('MU'))
  tester.testMu(['saveas', 'develop'])
  tester.testMu(['which'])
  tester.testMu(['get','master'])

  await helper.verify(t, save1)

  helper.print(chalk.inverse('MU'))
  tester.testMu(['get','develop'])

  await helper.verify(t, save2)

  await tester.cleanupTest(flags, name)
})
