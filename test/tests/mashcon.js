const test = require('ava')
const chalk = require('chalk')

const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'conflicts'
const flags = []
helper.verboseLogging(true)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const arbNum = 3 // arbitrary
  const numOfFileCats = 3 // 3 in this case: case1, case2, case3
  const save1 = await helper.addFiles(arbNum * numOfFileCats)
  const files1 = Object.keys(save1)

  helper.print(chalk.inverse('MU'))
  await tester.muSave()

  helper.print(chalk.inverse('MODIFY FILES'))
  const case1 = files1.slice(0 * arbNum, 1 * arbNum).sort()
  const case2 = files1.slice(1 * arbNum, 2 * arbNum).sort()
  const case3 = files1.slice(2 * arbNum, 3 * arbNum).sort()

  await helper.modFiles(case1)
  helper.print(chalk.inverse('MU SAVEAS DEVELOP'))
  await tester.mu(['saveas', 'develop'])
  await helper.modFiles(case3)
  await tester.muSave()
  await tester.mu(['get', 'master'])
  await helper.modFiles(case2)
  await helper.modFiles(case3)

  const exitCode = await tester.mu(['mash', 'develop'])
  t.truthy(exitCode, 'bash error codes are > 0')
  t.true(Number.isInteger(exitCode))
  await tester.muSave()

  await tester.mu(['which'])
  const {choose, correct, overwrite} = await tester.mu(['mash', 'develop'])
  t.deepEqual(case1, overwrite.sort())
  t.deepEqual(case2, correct.sort())
  t.deepEqual(case3, choose.sort())

  await tester.cleanupTest(flags, name)
})

