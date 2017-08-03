// const cwd = require('./sys/cwd')
// const root = require('./sys/root')

const fs = require('fs-extra')
const path = require('path')

module.exports = () => {
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

  function setPointer(head, version){
    pointer.head = head
    pointer.branch[pointer.head] = version
  }

  function update(){
    pointer.branch[pointer.head]++
    fs.outputJsonSync(pointerPath, pointer)
  }

  function addName(name){
    if(typeof pointer.branch[name] === 'undefined'){
      pointer.head = name
      pointer.branch[name] = 0
      fs.outputJsonSync(pointerPath, pointer)
      return true
    }
    return false
  }

  function exists(name, version){
    version = path.parse(version) + '.json'
    return fs.existsSync(utils.dest('history', name, version))
  }

  function latest(name=pointer.head){
    const historyPath = utils.dest('history', name)
    let latest = 0
    if(fs.existsSync(historyPath)){
      let lastFile = fs.readdirSync(historyPath).pop() || ''
      lastFile = lastFile.match(/^v([0-9])+/)
      latest = lastFile ? parseInt(lastFile[1]) : latest
    }
    return latest
  }

  return {
    head: pointer.head,
    branch: pointer.branch,
    version: pointer.branch[pointer.head],
    setPointer,
    update,
    addName,
    exists,
    latest
  }
}
