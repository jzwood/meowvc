import test from 'ava'

const chalk = require('chalk')
const testOps = require('../testOps')
const fs = require('fs-extra')

test('get', t => {
  const flag = []
  const name = 'state'
  testOps.setupTest(flags, name)

  testOps.newline()
  console.info(chalk.inverse('ADD FILES'))

  const files = ['hello.txt', 'fox.sh', 'binary.bin']

  fs.outputFileSync(files[0], 'hello world\nfoo bar')
  fs.outputFileSync(files[1], 'echo "the quick brown fox jumped over the lazy dog"')
  fs.outputFileSync(files[2], ']W^��Jɩ���������+^2��)\u001c�V�^pvӳ��4���K>�\u000e�C�����\nL�\b�AC��5-~�$\u0005z��\r�̾ob��mjكB�������+�T�C\u001bh\u0004�u/���v�0�\u001e�\f�ܳ�5rV||X��[��J��^��ƞH�&Ki\r4�\u0019�')

  console.info(chalk.inverse('MU DIFF'))
  testOps.testMu(['diff','.'])
  console.info(chalk.inverse('MU SAVE'))
  testOps.muSave()

  /* without a timeout the files change so quickly that their modified time stamps
    are identical. If the time stamp is the same and the size doesn't change then
    mu can't tell that it has been edited. */
  setTimeout(() => {
    fs.outputFileSync(files[0], 'Hello the world bar foo')
    fs.outputFileSync(files[1], 'echo "the Quick fox jumped high over\nthe lazy dog."')
    fs.outputFileSync(files[2], ']W^��Jɩ������+^2��)\u001c�V�^pvӳ��4u000e�C�����\nL�\b�AC��005z��\r�̾ob��mj����+�T�C\u001bh\u0004�u/���v�0�\u001e�\f�ܳ�5rV||X��[�^��ƞH�&Ki\r4�\u0019�')

    testOps.newline()

    console.info(chalk.inverse('MU DIFF'))
    testOps.testMu(['diff','.'])

    console.info(chalk.inverse('DEL FILES'))

    fs.removeSync(files[0])
    fs.removeSync(files[1])
    fs.removeSync(files[2])

    console.info(chalk.inverse('MU DIFF'))
    testOps.testMu(['diff','.'])

    testOps.cleanupTest(flags, name)
    t.pass()

  }, 1000)

})
