const eol = require('os').EOL
const muOps = require('./modules/muOps')

const usage = `
Usage:
mu <command> [<args>]

  Commands: Args:                 Descriptions:
  help                            - shows usage
  start     [<name>]              - creates a new mu repo
  state                           - shows the working repo state
  save      <message>             - records snapshot of repo
  which                           - shows name of current repo
  saveas    <name>                - saves repo with a new name
  history   [<limit>]             - shows ≤ the limit number of save messages for current repo
  undo      <file|pattern>        - reverts file (or pattern) to last save
  get       <name> [<version>]    - switches to a different named repo
  mash      <name> [<version>]    - mashes (ie merges) named repo into current repo
  diff      <file|pattern>        - shows the word differences between current and saved version of file
`

module.exports = {
  help: usage.trim(),
  eol: new RegExp(`(?=${eol})`),
  insert: (string, index, substr) => string.slice(0, index) + substr + string.slice(index),
  vnorm: v => Math.max(0, parseInt(v,10) - 1),
  exit: {
    success: 0,
    error: 1, //generic
    cannotExe: 126, //command invoked cannon execute
    notFound: 127, //command not found
    invalid: 128, //invalid argument
    terminated: 130 //ctrl-c
  },
  get baseCase() {
    return {
      'ino': {},
      'dat': {}
    }
  }
}
