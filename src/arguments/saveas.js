const chalk = require('chalk')
const pointerOps = require('../pointerOps')
const core = require('../core')()

// + 1

/***********
*  SAVEAS  *
***********/

module.exports = function saveas(i, args) {
  console.log('saveas', i)
  const name = args[i + 1]
  if (name) {
    const po = pointerOps()
    const originalHead = po.head
    const nameAdded = po.addName(name) // returns true on success
    if (nameAdded) {
      const onComplete = {
        success(destPo){
          console.info(chalk.green(destPo.head, 'v' + destPo.version, 'successfully saved'))
        },
        failure(){
          console.warn(chalk.yellow('nothing changed'))
        }
      }
      core.save(onComplete, originalHead)
      console.info(chalk.green('done'))
    } else {
      console.warn(chalk.red(`ERROR: Save named "${name}" already exists. Repo not saved.`))
    }
  } else {
    console.warn(chalk.yellow('saveas expects a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
  }
}
