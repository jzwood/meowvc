/*
*	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
*/

// +1

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const root = require('./src/sys/root')
const cwd = require('./src/sys/cwd')

const help = require('./src/help')
const commands = require('./src/arguments')


function mu(args) {

  const isRoot = fs.existsSync(path.join(cwd, root))
  const sanitizeInput = str => str.toString().toLowerCase().replace(/-?_?/g, '')
  for (let i = 0, n = args.length; i < n; i++) {
    const command = commands[sanitizeInput(args[i])]
    if (typeof command === 'function') {
      if (isRoot || args[i] === 'start') {
        return command(i, args)
      }
      console.info(chalk.yellow('Warning:', cwd, 'is not a mu repo'))
      return 0
    }
  }
  console.info(chalk.gray(help))
}

mu(process.argv)
