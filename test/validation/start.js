const test = require('ava')
const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'start'
const quiet = true ? '--quiet' : ''

test.serial('local', start(name, quiet, true))
test.serial('remote', start(name, quiet, false))

function start(name, quiet, local) {
  return async t => {

    helper.verboseLogging(!quiet)
    const options = { quiet, local }
    let exitcode = await tester.setupTest(options, name)
    t.is(exitcode, 0) // success

    helper.newline()

    exitcode = await tester.muStart(options, '', '(when mu repo exists already)')
    t.is(exitcode, 126) //cannot execute

    exitcode = await tester.mu([quiet, 'gibberish'])
    t.is(exitcode, 127) //argument not found

    await tester.cleanupTest(local, name)
  }
}

