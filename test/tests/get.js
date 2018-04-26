const test = require('ava')

const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'get'
const flags = []
helper.verboseLogging(false)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const save1 = await helper.addFiles(4)
  const files1 = Object.keys(save1)

  helper.print(chalk.inverse('MU'))
  await tester.muSave()
  await tester.mu(['which'])

  helper.print(chalk.inverse('DEL FILES'))
  await helper.removeFiles(files1)

  helper.print(chalk.inverse('ADD FILES'))
  const save2 = await helper.addFiles(4)
  const files2 = Object.keys(save2)

  helper.print(chalk.inverse('MU'))
  await tester.mu(['saveas', 'develop'])
  await tester.mu(['which'])
  await tester.mu(['get','master'])

  await helper.verify(t, save1)

  helper.print(chalk.inverse('MU'))
  await tester.mu(['get','develop'])

  await helper.verify(t, save2)

  await tester.cleanupTest(flags, name)
})
