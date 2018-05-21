const chalk = require('chalk')
const core = require('../core')
const gl = require('../constant')
const {print} = require('../utils/print')
const stopwatch = require('../utils/timer')()

/*********
*  SAVE  *
*********/

module.exports = async function save(i, args){
  const msg = args[i + 1]
  if(typeof msg === 'string' && msg.length > 0){
    stopwatch.start()
    const mdata = {msg}
    const result = await core.save({mdata})
    stopwatch.stop()
    return result
  }

  print(chalk.red('save expects a message, e.g. ') + chalk.inverse('$ mu save "fixes punctuation errors"'))
  return gl.exit.invalid

}
