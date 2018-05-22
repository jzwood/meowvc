const test = require('ava')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')

const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'conflicts'
const quiet = true ? '--quiet' : ''

test.serial('local', con(name, quiet, true))
test.serial('remote', con(name, quiet, false))

function con(name, quiet, local) {
  return async t => {
    helper.verboseLogging(!quiet)
    await tester.setupTest({quiet,local}, name)

    helper.newline()
    helper.print(chalk.inverse('ADD FILES & SAVE'))
    const arbNum = 3 // arbitrary
    const numOfFileCats = 3 // 3 in this case: case1, case2, case3
    const save1 = await helper.addFiles(arbNum * numOfFileCats)
    const files1 = Object.keys(save1)

    helper.print(chalk.inverse('MU'))
    await tester.muSave(quiet)

    helper.print(chalk.inverse('MODIFY FILES'))
    const case1 = files1.slice(0 * arbNum, 1 * arbNum).sort()
    const case2 = files1.slice(1 * arbNum, 2 * arbNum).sort()
    const case3 = files1.slice(2 * arbNum, 3 * arbNum).sort()

    await helper.modFiles(case1)
    helper.print(chalk.inverse('MU SAVEAS DEVELOP'))
    await tester.mu([quiet, 'saveas', 'develop'])
    await helper.modFiles(case3)
    await tester.muSave(quiet)
    await tester.mu([quiet, 'get', 'master'])
    await helper.modFiles(case2)
    await helper.modFiles(case3)

    const exitCode = await tester.mu([quiet, 'mash', 'develop'])
    t.truthy(exitCode, 'bash error codes are > 0')
    t.true(Number.isInteger(exitCode))
    await tester.muSave(quiet)

    await tester.mu([quiet, 'which'])
    global.muRepl = 'b'
    const {choose, correct, overwrite} = await tester.mu([quiet, 'mash', 'develop'])
    const getFP = arr => arr.map(data => data.fp)
    t.deepEqual(case1, getFP(overwrite).sort())
    t.deepEqual(case2, getFP(correct).sort())
    t.deepEqual(case3, getFP(choose).sort())

    const ls = await fs.readdir('.')
    for(let data of choose) {
      t.true(ls.includes(path.basename(data.fp,'txt') + 'copy.0.txt'))
    }

    await tester.cleanupTest(local, name)
  }
}
