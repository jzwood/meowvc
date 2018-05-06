/**
 *  POINTER OPERATIONS
 */

const fs = require('fs-extra')
const path = require('path')
const muOps = require('./muOps')

let pointer = {}

const pointerOps = {
  init,
  get head(){
    return pointer.head
  },
  get branch(){
    return pointer.branch
  },
  get version(){
    return pointer.branch[pointer.head]
  },
  setPointer,
  incrementVersion,
  pointToNewHead,
  exists,
  latest
}

module.exports = pointerOps

function sanitizeVersion(version){
  return parseInt(version.match(/(\d+)/)[1], 10)
}

function init() {
  const pointerPath = muOps.path('_pointer.json')
  if (!fs.existsSync(pointerPath)) {
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
  pointerOps.pointerPath = pointerPath
}

function setPointer(head, version) {
  pointer.head = head
  pointer.branch[head] = sanitizeVersion(version)
}

function incrementVersion() {
  //incr version
  pointer.branch[pointer.head]++
  //save
  fs.outputJsonSync(pointerOps.pointerPath, pointer)
}

// switches current head to name
function pointToNewHead(name) {
  let success = false
  if (typeof pointer.branch[name] === 'undefined') {
    pointer.head = name
    pointer.branch[name] = 0
    fs.outputJsonSync(pointerOps.pointerPath, pointer)
    success = true
  }
  return {
    success
  }
}

function exists(name, version) {
  version = path.parse(version).name + '.json'
  return fs.existsSync(muOps.path('history', name, version))
}

function latest(name = pointer.head) {
  let latest = 0

  const historyPath = muOps.path('history', name)
  if (fs.existsSync(historyPath)) {

    const historyRepo = fs.readdirSync(historyPath)

    historyRepo.forEach(version => {
      const hasNum = version.match(/^v(\d+)/)
      if (hasNum) {
        const fileNum = parseInt(hasNum[1], 10)
        if (fileNum > latest) {
          latest = fileNum
        }
      }
    })

  }
  return latest
}

