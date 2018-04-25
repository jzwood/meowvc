const test = require('ava')

const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'which'
const flags = []
helper.verboseLogging(true)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()

  helper.print(chalk.inverse('ADD FILES & SAVE'))
  const save1 = await helper.addFiles(1)
  await tester.muSave()

  helper.print(chalk.inverse('MU WHICH'))
  let which = tester.testMu(['which'])
  t.deepEqual(which, {
    current: {
      head: 'master',
      vHead: 0,
      vLatest: 0
    },
    saves: []
  })

  const save2 = await helper.addFiles(1)
  helper.print(chalk.inverse('MU SAVEAS DEVELOP'))
  tester.testMu(['saveas', 'develop'])

  helper.print(chalk.inverse('MU WHICH'))
  which = tester.testMu(['which'])
  t.deepEqual(which, {
    current: {
      head: 'develop',
      vHead: 0,
      vLatest: 0
    },
    saves: [{
      head: 'master',
      vHead: 0,
    }]
  })

  helper.print(chalk.inverse('MU SAVE 3 times'))
  const save3 = await helper.addFiles(1)
  await tester.muSave()
  const save4 = await helper.addFiles(1)
  await tester.muSave()
  const save5 = await helper.addFiles(1)
  await tester.muSave()

  helper.print(chalk.inverse('MU WHICH'))
  which = tester.testMu(['which'])
  t.deepEqual(which, {
    current: {
      head: 'develop',
      vHead: 3,
      vLatest: 3
    },
    saves: [{
      head: 'master',
      vHead: 0
    }]
  })

  helper.print(chalk.inverse('MU GET DEVELOP V1'))
  tester.testMu(['get', 'develop', 'v1'])
  which = tester.testMu(['which'])
  t.deepEqual(which, {
    current: {
      head: 'develop',
      vHead: 1,
      vLatest: 3
    },
    saves: [{
      head: 'master',
      vHead: 0
    }]
  })

  helper.print(chalk.inverse('MU GET DEVELOP'))
  tester.testMu(['get', 'develop'])

  helper.print(chalk.inverse('MU GET MASTER'))
  tester.testMu(['get', 'master'])

  helper.print(chalk.inverse('MU WHICH'))
  which = tester.testMu(['which'])
  t.deepEqual(which, {
    current: {
      head: 'master',
      vHead: 0,
      vLatest: 0
    },
    saves: [{
      head: 'develop',
      vHead: 3
    }]
  })

  await tester.cleanupTest(flags, name)
})
