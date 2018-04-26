const test = require('ava')
const fs = require('fs-extra')
const chalk = require('chalk')

const tester = require('../modules/tester')
const helper = require('../modules/helper')

const name = 'diff'
const flags = []
helper.verboseLogging(true)

test(name, async t => {
  await tester.setupTest(flags, name)

  helper.newline()
  helper.print(chalk.inverse('ADD FILES'))

  const files = ['hello.txt', 'fox.sh', 'binary.bin']

  const p1 = fs.outputFile(files[0], 'hello world\nfoo bar')
  const p2 = fs.outputFile(files[1], 'echo "the quick brown fox jumped over the lazy dog"')
  const p3 = fs.outputFile(files[2], ']W^��Jɩ���������+^2��)\u001c�V�^pvӳ��4���K>�\u000e�C�����\nL�\b�AC��5-~�$\u0005z��\r�̾ob��mjكB�������+�T�C\u001bh\u0004�u/���v�0�\u001e�\f�ܳ�5rV||X��[��J��^��ƞH�&Ki\r4�\u0019�')

  await Promise.all([p1, p2, p3])

  helper.print(chalk.inverse('MU DIFF'))
  await tester.mu(['diff', '.'])
  helper.print(chalk.inverse('MU SAVE'))
  await tester.muSave()

  /* without a timeout the files change so quickly that their last-modified time stamps are identical. If the time stamp is the same and the size doesn't change then mu can't tell that it has been edited. */
  await new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await Promise.all([
          fs.outputFile(files[0], 'Hello the world bar foo'),
          fs.outputFile(files[1], 'echo "the Quick fox jumped high over\nthe lazy dog."'),
          fs.outputFile(files[2], ']W^��Jɩ������+^2��)\u001c�V�^pvӳ��4u000e�C�����\nL�\b�AC��005z��\r�̾ob��mj����+�T�C\u001bh\u0004�u/���v�0�\u001e�\f�ܳ�5rV||X��[�^��ƞH�&Ki\r4�\u0019�')
        ])

        helper.newline()

        helper.print(chalk.inverse('MU DIFF'))
        await tester.mu(['diff', '.'])

        helper.print(chalk.inverse('DEL FILES'))

        await Promise.all([
          fs.remove(files[0]),
          fs.remove(files[1]),
          fs.remove(files[2])
        ])

        helper.print(chalk.inverse('MU DIFF'))
        await tester.mu(['diff', '.'])

        await tester.cleanupTest(flags, name)

        t.pass()
        resolve()
      } catch (err) {
        t.fail()
        reject(err)
      }

    }, 1000)
  })
})

