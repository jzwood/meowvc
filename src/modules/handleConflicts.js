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

module.exports = ({conflicts, mergeHead, mergeVersion, currentHead, currentVersion}) => {

  if(!conflicts.length){
    return false
  }

  const ancestor = findCommonAncestor({mergeHead, mergeVersion, currentHead, currentVersion})
  const ancestorTree = mod.treeOps.getSavedData(ancestor.head, 'v' + ancestor.version)

  return handle(conflicts.pop())

  /*********** FUNCTION DEFS BELOW ***********/

  function findCommonAncestor({mergeHead, mergeVersion, currentHead, currentVersion}){

    const getParent = head => mod.metaOps(head).meta.parent

    const currentSaves = { [currentHead]: currentVersion }
    let currentParent; while(currentParent = getParent(currentHead)){
      currentHead = currentParent.head
      Object.assign(currentSaves, { [currentParent.head] : currentParent.version})
    }

    while(typeof(currentSaves[mergeHead]) === 'undefined'){
      const merge = getParent(mergeHead)
      mergeHead = merge.head
      mergeVersion = merge.version
    }

    const head = mergeHead

    const toNumber = v => parseInt(v.toString().match(/(\d+)/)[1], 10)
    const version = Math.min(toNumber(currentSaves[mergeHead]), toNumber(mergeVersion))

    return {head, version}
  }

  /**
   * @param {object} data - {[str]fp, [str]currentHashsum, [str]targetHashsum, [0|1]isutf8, [ℤ,≥0]mtime}
   */
  function handle(data){
    // does the conflicting current file exists identically in common ancestor
    const wasCurrentEdited = !(get(ancestorTree, ['dat', data.currentHashsum, 2, data.fp]))
    // does the conflicting merge file exists identically in common ancestor
    const wasMergeEdited = !(get(ancestorTree, ['dat', data.targetHashsum, 2, data.fp]))

    if(wasCurrentEdited && wasMergeEdited){
      return promptUser(data)
    } else if(wasCurrentEdited && !wasMergeEdited){
      return next()
    } else if(!wasCurrentEdited && wasMergeEdited){
      mod.fileOps.overwrite(data)
      return next()
    }
  }

  function next(){
    if(conflicts.length){
      return handle(conflicts.pop())
    }else{
      console.info(chalk.green(`Repo ${mergeHead} ${mergeVersion} mashed into ${currentHead} ${currentVersion}`), chalk.yellow('Note: Mash unsaved!'))
      return false
    }
  }

  function promptUser(data){
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    let parfp = path.parse(data.fp), fname = parfp.name, fext = parfp.ext
    const prompt =
`conflict for file ${chalk.yellow(data.fp)}
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
        data.fp = `${fname}${inner}${extension}${fext}`
        mod.fileOps.overwrite(data)
      }else if(answer !== 'o'){
        return handle(data)
      }

      return next()
    })
  }
}
