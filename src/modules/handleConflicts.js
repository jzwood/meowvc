/*
 *  REPL MASH CONFLICT HANDLING
 */


const readline = require('readline')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const fileOps = require('./fileOps')

module.exports = (conflicts, mergedHead, mergedVersion, currentHead, CurrentVersion) => {
  return conflicts.length ? handle(conflicts.pop()) : false

  function handle(data){
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    let file = data[0], pf = path.parse(file), fname = pf.name, fext = pf.ext
    const prompt = `conflict for file ${chalk.yellow(file)}
Select: (o) keep original file
        (n) replace with new file
        (b) keep both `

    global.muReplOpen = true
    rl.question(prompt, answer => {
      rl.close()
      global.muReplOpen = false
      answer = answer.toLowerCase().trim()
      let extension = -1
      switch(answer){
      case 'o':
        break
      case 'n':
        fileOps.overwrite(data)
        break
      case 'b':
        while(fs.existsSync(`${fname}.copy${++extension}${fext}`)){ /*intentionally empty*/ }
        data[0] = `${fname}.copy${extension}${fext}`
        fileOps.overwrite(data)
        break
      default:
        return handle(data)
      }
      return conflicts.length ? handle(conflicts.pop()) : (
        console.info(chalk.green(`Repo ${mergedHead} ${mergedVersion} mashed into ${currentHead} ${CurrentVersion}`), chalk.yellow('Note: Mash unsaved!')),
        false
      )
    })
  }
}
