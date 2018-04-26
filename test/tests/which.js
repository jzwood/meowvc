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
  let which = await tester.mu(['which'])
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
  await tester.mu(['saveas', 'develop'])

  helper.print(chalk.inverse('MU WHICH'))
  which = await tester.mu(['which'])
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
  which = await tester.mu(['which'])
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
  await tester.mu(['get', 'develop', 'v1'])
  which = await tester.mu(['which'])
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
  await tester.mu(['get', 'develop'])

  helper.print(chalk.inverse('MU GET MASTER'))
  await tester.mu(['get', 'master'])

  helper.print(chalk.inverse('MU WHICH'))
  which = await tester.mu(['which'])
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
