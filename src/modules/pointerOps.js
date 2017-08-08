const fs = require('fs-extra')
const path = require('path')

const gl = require('../constant')

module.exports = () => {
  const pointerPath = gl.dest('_pointer.json')
  let pointer
  if(!fs.existsSync(pointerPath)){
    pointer = {
      head: 'master',
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
    pointer.branch[head] = parseInt(version.match(/([0-9])+/)[1])
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
    version = path.parse(version).name + '.json'
    return fs.existsSync(gl.dest('history', name, version))
  }

  function latest(name=pointer.head){
    const historyPath = gl.dest('history', name)
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
