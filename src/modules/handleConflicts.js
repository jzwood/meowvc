/**
 *  REPL MASH CONFLICT HANDLING
 */


const readline = require('readline')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const loader = require('../utils/loader')
const dig = require('../utils/dig')
const mod = loader.require('modules')

const prompt = fp =>
  `conflict for file ${chalk.yellow(fp)}
Select: (o) keep original file
        (n) replace with new file
        (b) keep both `

module.exports = ({ conflicts, mergeHead, mergeVersion, currentHead, currentVersion }) => {

  if (!conflicts.length) {
    return false
  }

  const ancestor = findCommonAncestor({ mergeHead, mergeVersion, currentHead, currentVersion })
  const ancestorTree = mod.treeOps.getSavedData(ancestor.head, 'v' + ancestor.version)

  return manage(conflicts)

  /*********** FUNCTION DEFS BELOW ***********/

  function findCommonAncestor({
    mergeHead,
    mergeVersion,
    currentHead,
    currentVersion
  }) {

    const getParent = head => mod.metaOps(head).meta.parent

    const currentSaves = { [currentHead]: currentVersion }
    let currentParent
    while (currentParent = getParent(currentHead)) {
      currentHead = currentParent.head
      Object.assign(currentSaves, {
        [currentParent.head]: currentParent.version
      })
    }

    while (typeof(currentSaves[mergeHead]) === 'undefined') {
      const merge = getParent(mergeHead)
      mergeHead = merge.head
      mergeVersion = merge.version
    }

    const head = mergeHead

    const toNumber = v => parseInt(v.toString().match(/(\d+)/)[1], 10)
    const version = Math.min(toNumber(currentSaves[mergeHead]), toNumber(mergeVersion))

    return {
      head,
      version
    }
  }

  /**
   * @param {object} data - {[str]fp, [str]currentHashsum, [str]targetHashsum, [0|1]isutf8, [ℤ,≥0]mtime}
   */
  function manage(conflicts) {
    return conflicts.reduce((report, {fp, currentHashsum, targetHashsum, utf8, mtime}) => {
      // does the conflicting current file exists identically in common ancestor
      const wasCurrentEdited = !(dig(() => ancestorTree.dat[currentHashsum][2][fp]))
      // does the conflicting merge file exists identically in common ancestor
      const wasMergeEdited = !(dig(() => ancestorTree.dat[targetHashsum][2][fp]))

      const isChoiceRequired = wasCurrentEdited && wasMergeEdited
      const isFileCorrect = wasCurrentEdited && !wasMergeEdited
      const isOverwriteRequired = !wasCurrentEdited && wasMergeEdited
      //console.log({wasCurrentEdited, wasMergeEdited})

      if(isChoiceRequired){
        report.choose.push(fp)
      } else if(isFileCorrect){
        report.correct.push(fp)
      } else if(isOverwriteRequired){
        report.overwrite.push(fp)
      }

      return report

    },{choose:[],correct:[],overwrite:[]})

    //if (wasCurrentEdited && wasMergeEdited) {
      //return promptUser(data)
    //} else if (wasCurrentEdited && !wasMergeEdited) {
      //return next()
    //} else if (!wasCurrentEdited && wasMergeEdited) {
      //mod.fileOps.overwrite(data)
      //return next()
    //}
  }

  function next() {
    if (conflicts.length) {
      return manage(conflicts.pop())
    } else {
      console.info(chalk.green(`Repo ${mergeHead} ${mergeVersion} mashed into ${currentHead} ${currentVersion}`), chalk.yellow('Note: Mash unsaved!'))
      return false
    }
  }

  function promptUser(data) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    let parfp = path.parse(data.fp)
    const fname = parfp.name
    const fext = parfp.ext
    const prompt =
      `conflict for file ${chalk.yellow(data.fp)}
Select: (o) keep original file
        (n) replace with new file
        (b) keep both `

    global.muReplOpen = true
    rl.question(prompt, answer => {
      console.log("next", conflicts.length)
      rl.close()
      global.muReplOpen = false

      answer = answer.toLowerCase().trim()
      if (answer === 'n') {
        mod.fileOps.overwrite(data)
      } else if (answer === 'b') {
        let extension = -1,
          inner = '.copy.'
        while (fs.existsSync(`${fname}${inner}${++extension}${fext}`)) { /*intentionally empty*/ }
        data.fp = `${fname}${inner}${extension}${fext}`
        mod.fileOps.overwrite(data)
      } else if (answer !== 'o') {
        return manage(data)
      }

      return next()
    })
  }
}

