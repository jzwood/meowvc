const fs = require('fs-extra')
const chalk = require('chalk')
const isUtf8 = require('is-utf8')

const fileOps = require('../modules/fileOps')
const { print } = require('../utils/print')
const gl = require('../constant')
const core = require('../core')

/*********
 *  DIFF  *
 *********/

module.exports = async function diff(i, args) {
  const file = regex = args[i + 1]
  const binaryWarning = [
    chalk.yellow('Halting: It\'s a bad idea to diff binary files'),
    chalk.yellow('Binary file. Output not shown.')
  ]

  // if parameter is file
  if ((await fs.pathExists(file)) && (await fs.stat(file)).isFile()) {
    const f1 = await fs.readFile(file)
    if (isUtf8(f1)) {
      const f2 = await fileOps.getFileMostRecentSave(file) || ''
      const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
      print(diffString)
    } else {
      print(binaryWarning[0])
    }
    return gl.exit.success
  }

  // if parameter is regex
  if (regex) {
    const filterPattern = new RegExp(regex.trim())

    const handle = async diff => {

      const diffIt = (f1, f2) => {
        const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
        print(diffString)
      }

      const newline = () => {
        print(chalk.bold('-'.repeat(30)))
      }

      for (let data of diff.modified) {
        print(chalk.cyan(chalk.inverse(data.fp, chalk.bold('% '))))
        if (data.isutf8) {
          const [f1, f2] = await Promise.all([fs.readFile(data.fp), fileOps.retrieveData(data)])
          diffIt(f1, f2)
        } else {
          print(binaryWarning[0])
        }
        newline()
      }

      for (let data of diff.added) {
        print(chalk.yellow(chalk.inverse(data.fp, chalk.bold('+ '))))
        const f1 = await fs.readFile(data.fp)
        if (isUtf8(f1)) {
          const f2 = ''
          diffIt(f1, f2)
        } else {
          print(binaryWarning[1])
        }
        newline()
      }

      for (let data of diff.deleted) {
        print(chalk.red(chalk.inverse(data.fp, chalk.bold('x '))))
        if (data.isutf8) {
          const [f1, f2] = ['', await fileOps.retrieveData(data)]
          diffIt(f1, f2)
        } else {
          print(binaryWarning[1])
        }
        newline()
      }

      return gl.exit.success
    }

    return core.difference({ handle, filterPattern })
  }

  print(chalk.red('diff expects a filename or pattern, e.g. ') + chalk.inverse('$ mu diff path/to/file.txt'))
  return gl.exit.invalid
}
