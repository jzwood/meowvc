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
  if(fs.existsSync(historyPath)){
    const po = pointerOps()

    let branches = fs.readdirSync(historyPath).filter(dirName => {
      return fs.statSync(path.join(historyPath, dirName)).isDirectory()
    })

    branches.forEach(head => {
      if(head === po.head){
        console.info('* ' + chalk.green(head, `(v${gl.vnorm(po.branch[head])}/${po.latest()})`))
      }else{
        console.info(chalk.gray(`  ${head} v${gl.vnorm(po.branch[head])}`))
      }
    })
  }
}
