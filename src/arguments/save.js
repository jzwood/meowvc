const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/*********
*  SAVE  *
*********/

module.exports = function save(i){
  console.log('save', i)
  const po = pointerOps()
  const onComplete = {
    success(){
      console.log(chalk.green('saved as', po.head, 'v' + po.version))
    },
    failure(){
      console.log(chalk.yellow('nothing changed'))
    }
  }
  core.save(onComplete)
}
