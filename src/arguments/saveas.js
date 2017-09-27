const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const core = require('../core')()

/***********
*  SAVEAS  *
***********/

module.exports = function saveas(i, args) {
  const name = args[i + 1]
  if (name) {
    const po = pointerOps()
    const [head, version] = [po.head, po.version]
    const parent = { head, version }
    if (po.pointToNewHead(name).success) {
      core.save(head, {parent})
    } else {
      console.warn(chalk.red(`ERROR: Save named "${name}" already exists. Save cancelled.`))
    }
  } else {
    console.warn(chalk.yellow('saveas expects a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
  }
}
