const test = require('ava')
const chalk = require('chalk')

const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'undo'
const flags = []
const quiet = true ? '--quiet' : ''

test('test', async t => {
  helper.verboseLogging(!quiet)
  await tester.setupTest({quiet,flags}, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const save1 = await helper.addFiles(4)
  const files1 = Object.keys(save1)
  helper.print(chalk.inverse('MU'))
  await tester.muSave(quiet)

  helper.newline()

  helper.print(chalk.inverse('DEL FILES'))
  await helper.removeFiles(files1)

  helper.print(chalk.inverse('MU UNDO'))
  await tester.mu([quiet, 'undo', '.'])
  await helper.verify(t, save1)

  helper.newline()

  helper.print(chalk.inverse('MOD FILES'))

  await helper.modFiles(files1)

  helper.print(chalk.inverse('MU UNDO'))
  await tester.mu([quiet, 'undo', '.'])
  await helper.verify(t, save1)

  helper.newline()

  helper.print(chalk.inverse('RENAME FILES'))
  helper.renameFiles(files1)

  helper.print(chalk.inverse('MU UNDO'))
  await tester.mu([quiet, 'undo', '.'])
  await helper.verify(t, save1)

  await tester.cleanupTest(flags, name)
})
