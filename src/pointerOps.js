const fs = require('fs-extra')
const path = require('path')

module.exports = (cwd, dotMu) => {
  const pointerPath = path.join(cwd, dotMu, '_pointer.json')
  const pointer = fs.readJsonSync(pointerPath)
  return {
    head: pointer.head,
    branch: pointer.branch,
    version: pointer.branch[pointer.head],
    incrPointer(){
      pointer.branch[pointer.head]++
    },
    writePointer(){
      fs.outputJsonSync(pointerPath, pointer)
    },
    addName(name, cb){
      let exists = true
      if(typeof pointer.branch[name] === 'undefined'){
        pointer.head = name
        pointer.branch[name] = 0
        fs.outputJsonSync(pointerPath, pointer)
        exists = false
      }
      cb(exists)
    }
  }
}
