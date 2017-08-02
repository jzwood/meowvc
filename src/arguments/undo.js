const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const root = require('../sys/root')
const cwd = require('../sys/cwd')
const pointerOps = require('../pointerOps')

const utils = require('../utils')

const core = require('../core')()

// + 1

/*********
*  UNDO  *
*********/

module.exports = function undo(i, args){
  let pattern = args[i + 1]
  if (pattern) {
    pattern = new RegExp(pattern.trim())
    core().undo(pattern)
  } else {
    console.warn(chalk.yellow('undo expects a filename or pattern, e.g.'), chalk.inverse('$ mu undo path/to/file.txt'))
  }
}
