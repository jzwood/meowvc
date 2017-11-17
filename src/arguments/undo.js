const chalk = require('chalk')
const core = require('../core')()

/*********
*  UNDO  *
*********/

module.exports = function undo(i, args) {
  let pattern = args[i + 1]
  if (pattern) {
    pattern = new RegExp(pattern.trim())
    core.checkout({pattern})
  } else {
    console.warn(chalk.yellow('undo expects a filename or pattern, e.g.'), chalk.inverse('$ mu undo path/to/file.txt'))
  }
}
