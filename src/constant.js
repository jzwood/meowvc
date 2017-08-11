const chalk = require('chalk')
const path = require('path')
const eol = require('os').EOL

const cwd = process.cwd()
const root = '.mu'
const usage = `
Usage:
mu <command> [<args>]

  Commands:	Args:			Descriptions:
  help					- shows usage
  start					- creates a new mu repo
  state					- shows the working repo state

  save					- records snapshot of repo
  saveas	<name>			- saves repo with a new name

  undo		<file|pattern>		- reverts file (or pattern) to last save
  get		<name> [version]	- switches to a different named repo
`

module.exports = {
  cwd,
  root,
  dest(){
    return path.join(cwd, root, ...arguments)
  },
  linesPath: path.join(cwd, root, 'disk_mem', 'lines'),
  filesPath: path.join(cwd, root, 'disk_mem', 'files'),
  binPath: path.join(cwd, root, 'disk_mem', 'bin'),
  eol: new RegExp(`(?=${eol})`),
  get baseCase() {
    return {
      'ino': {},
      'dat': {}
    }
  },
  status: {
    modified: str => console.log(chalk.cyan('%\t' + str)),
    deleted: str => console.log(chalk.red('x\t' + str)),
    renamed: (strOld, strNew) => console.log(chalk.magenta('&\t' + strOld, '->', strNew)),
    added: str => console.log(chalk.yellow('+\t' + str))
  },
  help: usage.trim()
}
