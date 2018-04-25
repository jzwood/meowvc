const test = require('ava')

const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'state'
const flags = []
helper.verboseLogging(false)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES'))
  const save1 = await helper.addFiles(4)
  const files1 = Object.keys(save1).sort()

  const removeThese = files1.slice(0,2).sort() // first 2
  const modifyThese = files1.slice(2).sort() // last 2
  const renameThese = modifyThese.slice()

  helper.print(chalk.inverse('MU STATE'))
  let stateObj = tester.testMu(['state'])

  const added = helper.parseStateObject(stateObj).added.sort()
  t.deepEqual(added, files1)

  helper.print(chalk.inverse('MU SAVE'))
  tester.muSave()

  helper.newline()

  helper.print(chalk.inverse('DEL 2 FILES'))
  await helper.removeFiles(removeThese)

  helper.print(chalk.inverse('MU STATE'))
  stateObj = tester.testMu(['state'])

  const deleted = helper.parseStateObject(stateObj).deleted.sort()
  t.deepEqual(deleted, removeThese)

  helper.print(chalk.inverse('MU SAVE'))
  tester.muSave()

  helper.newline()

  helper.print(chalk.inverse('MOD 2 FILES'))
  await helper.modFiles(modifyThese)

  helper.print(chalk.inverse('MU STATE'))
  tester.testMu(['state'])
  helper.print(chalk.inverse('MU SAVE'))
  tester.muSave()

  helper.newline()

  helper.print(chalk.inverse('RENAME 2 FILES'))
  await helper.renameFiles(renameThese)

  helper.print(chalk.inverse('MU STATE'))
  tester.testMu(['state'])
  helper.print(chalk.inverse('MU SAVE'))
  tester.muSave()

  helper.print(chalk.inverse('MU HISTORY'))
  tester.testMu(['history'])

  helper.print(chalk.inverse('MU HISTORY 2'))
  tester.testMu(['history','2'])

  await tester.cleanupTest(flags, name)
})
