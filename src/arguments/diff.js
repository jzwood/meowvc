const fs = require('fs-extra')
const chalk = require('chalk')
const isUtf8 = require('is-utf8')

const fileOps = require('../modules/fileOps')
const {print} = require('../utils/print')
const core = require('../core')()

/*********
*  DIFF  *
*********/

module.exports = function diff(i, args) {
  const file = regex = args[i + 1]
  const binaryWarning = [
    chalk.yellow('Halting: It\'s a bad idea to diff binary files'),
    chalk.yellow('Binary file. Output not shown.')
  ]


  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const f1 = fs.readFileSync(file)
    if(isUtf8(f1)){
      const f2 = fileOps.getFileMostRecentSave(file) || ''
      const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
      print(diffString)
    }else{
      print(binaryWarning[0])
    }
  }else if (regex) {
    const filterPattern = new RegExp(regex.trim())

    const handle = diff => {


      const diffIt = (f1, f2) => {
        const diffString = fileOps.fdiff(f1.toString('utf8'), f2.toString('utf8'))
        print(diffString)
      }

      const newline = () => {
        print(chalk.bold('-'.repeat(30)))
      }

      let data, diffString
      while(data = diff.modified.pop()) {
        print(chalk.cyan(chalk.inverse(data.fp, chalk.bold('% '))))
        if(data.isutf8){
          const f1 = fs.readFileSync(data.fp)
          const f2 = fileOps.retrieveData(data)
          diffIt(f1, f2)
        }else{
          print(binaryWarning[0])
        }
        newline()
      }
      while(data = diff.added.pop()) {
        print(chalk.yellow(chalk.inverse(data.fp, chalk.bold('+ '))))
        const f1 = fs.readFileSync(data.fp)
        if(isUtf8(f1)){
          const f2 = ''
          diffIt(f1, f2)
        }else{
          print(binaryWarning[1])
        }
        newline()
      }
      while(data = diff.deleted.pop()) {
        print(chalk.red(chalk.inverse(data.fp, chalk.bold('x '))))
        if(data.isutf8){
          const f1 = '', f2 = fileOps.retrieveData(data)
          diffIt(f1, f2)
        }else{
          print(binaryWarning[1])
        }
        newline()
      }
    }

    return core.difference({handle, filterPattern})
  } else {
    print(chalk.red('diff expects a filename or pattern, e.g. ') + chalk.inverse('$ mu diff path/to/file.txt'))
  }
}
