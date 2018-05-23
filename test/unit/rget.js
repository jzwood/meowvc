const test = require('ava')
const chalk = require('chalk')
const tester = require('../modules/tester')
const helper = require('../modules/helper')
const path = require('path')

const rget = require('../../src/utils/rget')
const name = 'rget'

test('test', async t => {
  await tester.setupTest({local: true, noMu: true}, name)

  const save1 = await helper.addFiles(50)
  const files1 = Object.keys(save1).sort()

  const allFiles = (await rget(process.cwd(), new RegExp('^\\.')))
    .map(obj => obj.relpath)
    .sort()

  t.deepEqual(allFiles, files1)
  await tester.cleanupTest(true, name)
})
