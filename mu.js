'use strict'

/*
 * MAIN
 */

const chalk = require('chalk')

module.exports = async function mu(args) {
  const gl = require('./src/constant')
  const loader = require('./src/utils/loader')
  const commands = loader.require('arguments')
  const muOps = require('./src/modules/muOps')
  const po = require('./src/modules/pointerOps')

  for (let [index, param] of args.entries()) {
    const command = commands[param]
    if (typeof command === 'function') {
      await muOps.update()
      if (param === 'start') {
        return command(index, args)
      }
      if(muOps.isPath){
        po.init()
        return command(index, args)
      }
      console.info(chalk.yellow(`Warning: ${process.cwd()} is not a mu repo root`))
      return gl.exit.cannotExe
    }
  }
  console.info(gl.help)
  return gl.exit.notFound
}
