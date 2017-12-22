const chalk = require('chalk')
const core = require('../core')()
const stopwatch = require('../utils/timer')()

/*********
*  SAVE  *
*********/

module.exports = function save(i, args){
  const msg = args[i + 1]
  if(typeof msg === 'string' && msg.length > 0){
    stopwatch.start()
    const mdata = {msg}
    core.save({mdata})
    stopwatch.stop()
  }else{
    console.log(chalk.red('save expects a message, e.g. ') + chalk.inverse('$ mu save "fixes punctuation errors"'))
  }
}
