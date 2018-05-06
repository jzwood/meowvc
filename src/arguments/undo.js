const chalk = require('chalk')
const gl = require('../constant')
const core = require('../core')()

/*********
 *  UNDO  *
 *********/

module.exports = function undo(i, args) {
  let pattern = args[i + 1]
  if (pattern) {
    const filterPattern = new RegExp(pattern.trim())
    return core.checkout({ filterPattern })
  }
  console.warn(chalk.yellow('undo expects a filename or pattern, e.g.'), chalk.inverse('$ mu undo path/to/file.txt'))
  return gl.exit.invalid
}

