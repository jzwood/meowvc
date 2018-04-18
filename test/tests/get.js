const test = require('ava')

const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'get'
const flags = []

test(name, async t => {
  tester.setupTest(flags, name)

  helper.newline()
  console.info(chalk.inverse('ADD FILES & SAVE'))
  const save1 = helper.addFiles(4)
  let files1 = Object.keys(save1)

  console.info(chalk.inverse('MU'))
  tester.muSave()
  tester.testMu(['which'])

  console.info(chalk.inverse('DEL FILES'))
  files1.forEach(fp => {
    helper.removeFile(fp)
  })

  console.info(chalk.inverse('ADD FILES'))
  const save2 = helper.addFiles(4)
  let files2 = Object.keys(save2)

  console.info(chalk.inverse('MU'))
  tester.testMu(['saveas', 'develop'])
  tester.testMu(['which'])
  tester.testMu(['get','master'])

  console.info(chalk.inverse('VERIFYING'))
  await helper.verify(t, save1)

  console.info(chalk.inverse('MU'))
  tester.testMu(['get','develop'])

  console.info(chalk.inverse('VERIFYING'))
  await helper.verify(t, save2)

  tester.cleanupTest(flags, name)
  t.pass()
})
