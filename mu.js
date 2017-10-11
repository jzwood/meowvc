'use strict'

/*
 *  MU.JS === MAIN
 */

const chalk = require('chalk')

module.exports = function mu(args) {

  const gl = require('./src/constant')
  const loader = require('./src/utils/loader')
  const commands = loader.require('arguments')
  const muOps = require('./src/modules/muOps')

  for (let i = 0, n = args.length; i < n; i++) {
    const command = commands[args[i]]
    if (typeof command === 'function') {
      if (muOps.repoPath || args[i] === 'start') {
        return command(i, args)
      }
      console.info(chalk.yellow(`Warning: ${process.cwd()} is not a mu repo root`))
      return 0
    }
  }
  console.info(gl.help)
}
