/**
 *  REPL MASH CONFLICT HANDLING
 */


const readline = require('readline')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const loader = require('../utils/loader')
const mod = loader.require('modules')
const utils = loader.require('utils')
const gl = require('../constant')

const prompt = fp =>
  `conflict for file ${chalk.yellow(fp)}
Select: (o) keep original file
        (n) replace with new file
        (b) keep both `

module.exports = async({conflicts, mergeHead, mergeVersion, currentHead, currentVersion }) => {

  if (!conflicts.length) {
    return false
  }

  const ancestor = await findCommonAncestor({ mergeHead, mergeVersion, currentHead, currentVersion })
  const ancestorTree = await mod.treeOps.getSavedData(ancestor.head, 'v' + ancestor.version)

  const report = auditConflicts(conflicts)
  await actOnReport(report)
  return report

  /*********** FUNCTION DEFS BELOW ***********/

  async function findCommonAncestor({
    mergeHead,
    mergeVersion,
    currentHead,
    currentVersion
  }) {

    const getParent = head => mod.metaOps.getMetadata(head).then(metadata => metadata.parent)

    const currentSaves = { [currentHead]: currentVersion }
    let currentParent
    while (currentParent = await getParent(currentHead)) {
      currentHead = currentParent.head
      Object.assign(currentSaves, {
        [currentParent.head]: currentParent.version
      })
    }

    while (typeof(currentSaves[mergeHead]) === 'undefined') {
      const merge = await getParent(mergeHead)
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
  function auditConflicts(conflicts) {
    return conflicts.reduce((report, data) => {
      const {fp, currentHashsum, targetHashsum} = data
      // does the conflicting current file exists identically in common ancestor
      const wasCurrentEdited = !(utils.dig(() => ancestorTree.dat[currentHashsum][2][fp]))
      // does the conflicting merge file exists identically in common ancestor
      const wasMergeEdited = !(utils.dig(() => ancestorTree.dat[targetHashsum][2][fp]))

      const isChoiceRequired = wasCurrentEdited && wasMergeEdited
      const isFileCorrect = wasCurrentEdited && !wasMergeEdited
      const isOverwriteRequired = !wasCurrentEdited && wasMergeEdited
      //console.log({wasCurrentEdited, wasMergeEdited})

      if(isChoiceRequired){
        report.choose.push(data)
      } else if(isFileCorrect){
        report.correct.push(data)
      } else if(isOverwriteRequired){
        report.overwrite.push(data)
      }

      return report

    },{choose:[],correct:[],overwrite:[]})
  }

  async function actOnReport(report){
    //const debugging = utils.dig(() => global.mμ.debugging)
    await Promise.all(report.overwrite.map(mod.fileOps.overwrite))
    for(let data of report.choose){
      const {name, ext} = path.parse(data.fp)
      var decision = utils.stdin(prompt(name))
      console.log(decision)
      await decision
      //const decision = (await utils.stdin(prompt(name))).toLowerCase().trim()
      const choices = {
        get n(){
          return mod.fileOps.overwrite(data)
        },
        get o(){
          return Promise.resolve(gl.exit.success)
        },
        get b(){
          return new Promise(async resolve => {
            const inner = '.copy.'
            let extension = -1
            while (await fs.pathExists(`${name}${inner}${++extension}${ext}`)) { /* intentionally empty */ }
            data.fp = `${fname}${inner}${extension}${fext}`
            await mod.fileOps.overwrite(data)
            resolve(0)
          })
        }
      }
      await choices[decision]
    }
  }
}
