const test = require('ava')
const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'start'
const flags = []
const quiet = true ? '--quiet' : ''

test('test', async t => {
  helper.verboseLogging(!quiet)
  let exitcode = await tester.setupTest({
    quiet,
    flags
  }, name)
  t.is(exitcode, 0) // success

  helper.newline()

  const options = {
    quiet,
    local: tester.parseFlags(flags).local
  }
  exitcode = await tester.muStart(options, '', '(when mu repo exists already)')
  t.is(exitcode, 126) //cannot execute

  exitcode = await tester.mu([quiet, 'gibberish'])
  t.is(exitcode, 127) //argument not found

  await tester.cleanupTest(flags, name)
})

