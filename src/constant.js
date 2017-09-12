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
  insert(string, index, substr){
    return string.slice(0, index) + substr + string.slice(index)
  },
  vnorm(v){
    return Math.max(0, parseInt(v,10) - 1)
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
  help: usage.trim()
}
