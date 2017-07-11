const fs = require('fs-extra')
const path = require('path')

module.exports = (cwd, root) => {
  const pointerPath = path.join(cwd, root, '_pointer.json')
  if(!fs.existsSync(pointerPath)){
    fs.outputJsonSync(pointerPath, {
      head: "master",
      branch: {
        master: "0"
      }
    })
	}
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
