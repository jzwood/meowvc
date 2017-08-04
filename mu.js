/*
 *  MU.JS ENTRY
 */

const fs = require('fs-extra')
const chalk = require('chalk')

const gl = require('./src/constant')
const loader = require('./src/utils/loader')
const commands = loader.require('arguments')

function mu(args) {

  const isRoot = fs.existsSync(gl.dest())

  for (let i = 0, n = args.length; i < n; i++) {
    const command = commands[args[i]]
    if (typeof command === 'function') {
      if (isRoot || args[i] === 'start') {
        return command(i, args)
      }
      console.info(chalk.yellow('Warning:', gl.cwd, 'is not a mu repo'))
      return 0
    }
  }
  console.info(chalk.gray(gl.help))
}

mu(process.argv)
