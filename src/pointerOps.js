const fs = require('fs-extra')
const path = require('path')

module.exports = (cwd, root) => {
  const pointerPath = path.join(cwd, root, '_pointer.json')
  let pointer
  if(!fs.existsSync(pointerPath)){
    pointer = {
      head: "master",
      branch: {
        master: 0
      }
    }
    fs.outputJsonSync(pointerPath, pointer)
  } else {
    pointer = fs.readJsonSync(pointerPath)
  }
  return {
    head: pointer.head,
    branch: pointer.branch,
    version: pointer.branch[pointer.head],
    incrPointer(){
      pointer.branch[pointer.head]++
    },
    setPointer(head, version){
      pointer.head = head
      pointer.branch[pointer.head] = version
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
