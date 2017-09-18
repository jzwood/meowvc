const eol = require('os').EOL

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
  help: usage.trim(),
  eol: new RegExp(`(?=${eol})`),
  insert: (string, index, substr) => string.slice(0, index) + substr + string.slice(index),
  vnorm: v => Math.max(0, parseInt(v,10) - 1),
  linesPath: dest('disk_mem', 'lines'),
  filesPath: dest('disk_mem', 'files'),
  binPath: dest('disk_mem', 'bin'),
  get baseCase() {
    return {
      'ino': {},
      'dat': {}
    }
  }
}
