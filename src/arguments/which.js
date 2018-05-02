const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')
const gl = require('../constant')

/**********
 *  WHICH  *
 **********/

module.exports = async function which() {

  const historyPath = muOps.path('history')
  if (await fs.pathExists(historyPath)) {
    const po = pointerOps()

    let branches = (await fs.readdir(historyPath))
      .filter(async dirName => (await fs.stat(path.join(historyPath, dirName))).isDirectory())

    const whichObj = {
      current: {},
      saves: []
    }

    branches.forEach(head => {
      const vHead = gl.vnorm(po.branch[head])
      if (head === po.head) {
        const vLatest = po.latest()
        console.info('* ' + chalk.green(head, `(v${vHead}/${vLatest})`))
        whichObj.current = {
          head,
          vHead,
          vLatest
        }
      } else {
        console.info(chalk.gray(`  ${head} v${vHead}`))
        whichObj.saves.push({
          head,
          vHead
        })
      }
    })

    return whichObj
  }
}

