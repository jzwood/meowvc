const test = require('ava')
const chalk = require('chalk')

const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'mash'
const flags = []
helper.verboseLogging(false)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const egNum = 3 // arbitrary
  const save1 = await helper.addFiles(egNum * 4)
  const files1 = Object.keys(save1)

  helper.print(chalk.inverse('MU STATE'))
  await tester.muSave()
  helper.print(chalk.inverse('MU WHICH'))
  await tester.mu(['which'])

  helper.print(chalk.inverse('MOD FILES & RM FILES'))

  const dontTouchThese = files1.slice(0 * egNum, 1 * egNum).sort()
  const modifyThese = files1.slice(1 * egNum, 2 * egNum).sort()
  const modifyTheseAfter = files1.slice(2 * egNum, 3 * egNum).sort()
  const removeThese = files1.slice(3 * egNum, 4 * egNum).sort()

  await helper.modFiles(modifyThese)
  await helper.removeFiles(removeThese)

  helper.print(chalk.inverse('MU SAVEAS'))
  await tester.mu(['saveas', 'develop'])

  helper.print(chalk.inverse('MU STATE'))
  await tester.mu(['state'])

  helper.print(chalk.inverse('MU GET MASTER'))
  await tester.mu(['get', 'master'])

  helper.print(chalk.inverse('MODIFIES 1 FILE'))
  await helper.modFiles(modifyTheseAfter)
  helper.print(chalk.inverse('MU SAVE'))
  await tester.muSave()
  helper.print(chalk.inverse('MU GET DEVELOP'))
  await tester.mu(['get', 'develop'])

  helper.print(chalk.inverse('MU MASH MASTER'))
  await tester.mu(['mash', 'master'])
  helper.print(chalk.inverse('MU STATUS'))

  /* Here we have deleted and modified files saves as new branch.*/
  const stateObj = await tester.mu(['state'])
  const {
    added,
    deleted,
    modified
  } = helper.parseStateObject(stateObj)

  /* The 2nd modified files  are the only ones picked up b/c they are files that were changed after the new branching (develop) but were not modified in develop (ie no conflicts) */
  t.deepEqual(modified, modifyTheseAfter)
  /* deleted files are missing so mashing old branch into new restores them */
  t.deepEqual(added, removeThese)
  /* mashing should never result in deleted files */
  t.deepEqual(stateObj.deleted, [])

  await tester.cleanupTest(flags, name)
})

