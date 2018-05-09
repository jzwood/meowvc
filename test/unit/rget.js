const test = require('ava')
const chalk = require('chalk')

const rget = require('../../src/utils/rget')

test('rget', async t => {
  console.log(rget)
  t.pass()
})
