const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/***********
*  SAVEAS  *
***********/

module.exports = function saveas(i, args) {
  console.log('saveas', i)
  const name = args[i + 1]
  if (name) {
    const po = pointerOps()
    const head = po.head
    if (po.pointToNewHead(name).success) {
      core.save(head)
      console.info(chalk.green('done'))
    } else {
      console.warn(chalk.red(`ERROR: Save named "${name}" already exists. Save aborted.`))
    }
  } else {
    console.warn(chalk.yellow('saveas expects a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
  }
}
