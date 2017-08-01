const root = require('./sys/root')
const cwd = require('./sys/cwd')
const chalk = require('chalk')
const path = require('path')
const eol = require('os').EOL

module.exports = {
  linesPath: path.join(cwd, root, 'disk_mem', 'lines'),
  filesPath: path.join(cwd, root, 'disk_mem', 'files'),
  eol: new RegExp(`(?=${eol})`),
  get baseCase() {
    return {
      'ino': {},
      'dat': {}
    }
  },
  print: {
    modified: str => console.log(chalk.cyan('%\t' + str)),
    deleted: str => console.log(chalk.red('x\t' + str)),
    renamed: (strOld, strNew) => console.log(chalk.magenta('&\t' + strOld, '->', strNew)),
    added: str => console.log(chalk.yellow('+\t' + str))
  }
}
