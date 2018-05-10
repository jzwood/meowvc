const test = require('ava')
const chalk = require('chalk')
const path = require('path')

const rget = require('../../src/utils/rget')

test('rget', async t => {
  var a = (await rget(path.join(process.cwd(),'src'), new RegExp('^\\.')))
  console.log(a)
  t.pass()
})
