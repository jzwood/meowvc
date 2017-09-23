const chalk = require('chalk')
const core = require('../core')()

/*********
*  SAVE  *
*********/

module.exports = function save(i, args){
  const msg = args[i + 1]
  if(typeof message === 'string' && message.length > 0){
    core.save(null, {msg})
  }else{
    console.log(chalk.red('save expects a message, e.g. ') + chalk.inverse('$ mu save "fixes punctuation errors"'))
  }
}
