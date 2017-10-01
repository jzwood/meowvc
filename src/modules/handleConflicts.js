/**
 *  REPL MASH CONFLICT HANDLING
 */


const readline = require('readline')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const loader = require('../utils/loader')
const get = require('../utils/get')
const mod = loader.require('modules')

module.exports = (conflicts, mergeHead, mergeVersion, currentHead, CurrentVersion) => {

  if(!conflicts.length){
    return false
  }

  const ancestor = findCommonAncestor(mergeHead, mergeVersion, currentHead, CurrentVersion)
  const ancestorTree = mod.treeOps.getSavedData(ancestor.head, 'v' + ancestor.version)

  return handle(conflicts.pop())

  /*********** FUNCTION DEFS BELOW ***********/

  function findCommonAncestor(mergeHead, mergeVersion, currentHead, CurrentVersion){
    const getParent = head => mod.metaOps(head).meta.parent

    const currentSaves = { [mergeHead] : mergeVersion }
    let currentParent; while(currentParent = getParent(currentHead)){
      currentHead = currentParent.head
      Object.assign(currentSaves, { [currentParent.head] : currentParent.version})
    }

    mergeVersion = parseInt(mergeVersion.match(/([0-9])+/)[1], 10)
    while(typeof(currentSaves[mergeHead]) === 'undefined'){
      const merge = getParent(mergeHead)
      mergeHead = merge.head
      mergeVersion = merge.version
    }

    const head = mergeHead
    const version = Math.min(currentSaves[mergeHead], mergeVersion)
    console.info(head, currentSaves[mergeHead], mergeVersion)

    return {head, version}
  }

  function handle(data){
    const isCurrentDataTheSame = get(ancestorTree, 'dat', data[1], 2, data[0])
    if(isCurrentDataTheSame){
      mod.fileOps.overwrite(data)
      return next()
    }else{
      return promptUser(data)
    }
  }

  function next(){
    if(conflicts.length){
      return handle(conflicts.pop())
    }else{
      console.info(chalk.green(`Repo ${mergeHead} ${mergeVersion} mashed into ${currentHead} ${CurrentVersion}`), chalk.yellow('Note: Mash unsaved!'))
      return false
    }
  }

  function promptUser(data){
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
