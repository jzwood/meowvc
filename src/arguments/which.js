const chalk = require('chalk')
const pointerOps = require('../modules/pointerOps')
const fs = require('fs-extra')
const path = require('path')

const core = require('../core')()
const gl = require('../constant')

/**********
*  WHICH  *
**********/

module.exports = function which() {

  const historyPath = gl.dest('history')
  if(fs.existsSync(historyPath)){
    const po = pointerOps()

    let branches = fs.readdirSync(historyPath)
    branches.forEach(head => {
      if(head === po.head){
        console.info('* ' + chalk.green(head, `(v${Math.max(0, po.branch[head] - 1)}/${po.latest()})`))
      }else{
        console.info(chalk.gray(`  ${head} v${po.branch[head]}`))
      }
    })
  }
}
