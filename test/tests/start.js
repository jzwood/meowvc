const test = require('ava')
const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'start'
const flags = []

test(name, async t => {
  let exitcode = await tester.setupTest(flags, name)
  t.is(exitcode, 0) // success

  helper.newline()

  exitcode = tester.muStart(tester.parseFlags(flags).local, '', '(when mu repo exists already)')
  t.is(exitcode, 126) //cannot execute

  exitcode = tester.testMu(['gibberish'])
  t.is(exitcode, 127) //argument not found

  await tester.cleanupTest(flags, name)
})
