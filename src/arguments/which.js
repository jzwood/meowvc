const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')

const pointerOps = require('../modules/pointerOps')
const muOps = require('../modules/muOps')
const gl = require('../constant')

/**********
 *  WHICH  *
 **********/

module.exports = function which() {

  const historyPath = muOps.path('history')
  if (fs.existsSync(historyPath)) {
    const po = pointerOps()

    let branches = fs.readdirSync(historyPath).filter(dirName => {
      return fs.statSync(path.join(historyPath, dirName)).isDirectory()
    })

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
        whichObj.saves.push({head,vHead})
      }
    })

    return whichObj
  }
}

