/**
 *  REPL MASH CONFLICT HANDLING
 */


const readline = require('readline')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const loader = require('../utils/loader')
const mod = loader.require('modules')

module.exports = (conflicts, mergeHead, mergeVersion, currentHead, CurrentVersion) => {

  if(!conflicts.length){
    return false
  }

  const parent = mod.metaOps(currentHead).meta.parent || { 'head': 'master', 'version': 0 } //only master doesn't have a parent
  const parentDat = mod.treeOps.getSavedData(parent.head, 'v' + parent.version).dat

  return handle(conflicts.pop())

  /*********** FUNCTION DEFS BELOW ***********/

  function handle(data){
    // console.info(parentDat, data)

    if(parentDat[data[1]]){ //parent hash is identical ∴ it can be automatically merged
      mod.fileOps.overwrite(data)
      return next()
    }

    return promptUser()

    /*********** FUNCTION DEFS BELOW ***********/

    function next(){
      if(conflicts.length){
        return handle(conflicts.pop())
      }else{
        console.info(chalk.green(`Repo ${mergeHead} ${mergeVersion} mashed into ${currentHead} ${CurrentVersion}`), chalk.yellow('Note: Mash unsaved!'))
        return false
      }
    }

    function promptUser(){
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
      let file = data[0], pf = path.parse(file), fname = pf.name, fext = pf.ext
      const prompt =
  `conflict for file ${chalk.yellow(file)}
  Select: (o) keep original file
          (n) replace with new file
          (b) keep both `

      global.muReplOpen = true
      rl.question(prompt, answer => {
        rl.close()
        global.muReplOpen = false

        answer = answer.toLowerCase().trim()
        if(answer === 'n'){
          mod.fileOps.overwrite(data)
        }else if (answer === 'b'){
          let extension = -1, inner = '.copy.'
          while(fs.existsSync(`${fname}${inner}${++extension}${fext}`)){ /*intentionally empty*/ }
          data[0] = `${fname}${inner}${extension}${fext}`
          mod.fileOps.overwrite(data)
        }else if(answer !== 'o'){
          return handle(data)
        }

        return next()
      })
    }
  }
}
