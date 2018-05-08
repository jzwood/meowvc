const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const gl = require('../constant')
const core = require('../core')()
const stopwatch = require('../utils/timer')()

/***********
 *  SAVEAS  *
 ***********/

module.exports = async function saveas(i, args) {
  const name = args[i + 1]
  if (name) {
    const po = pointerOps
    const [head, version] = [po.head, po.version - 1]
    const parent = {
      head,
      version
    }
    if (gl.exit.success === await po.pointToNewHead(name)) {
      stopwatch.start()
      const mdata = {
        parent
      }
      const result = await core.save({ head, mdata })
      stopwatch.stop()
      return result
    } else {
      console.warn(chalk.red(`ERROR: Save named "${name}" already exists. Save cancelled.`))
      return gl.exit.cannotExe
    }
  }

  console.warn(chalk.yellow('saveas expects a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
  return gl.exit.invalid
}

