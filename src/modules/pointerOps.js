/**
 *  POINTER OPERATIONS
 */

const fs = require('fs-extra')
const path = require('path')
const muOps = require('./muOps')

module.exports = () => {
  const pointerPath = muOps.path('_pointer.json')
  let pointer
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

  function setPointer(head, version) {
    pointer.head = head
    pointer.branch[head] = parseInt(version.match(/(\d+)/)[1], 10)
  }

  function update() {
    pointer.branch[pointer.head]++
    fs.outputJsonSync(pointerPath, pointer)
  }

  // switches current head to name
  function pointToNewHead(name) {
    let success = false
    if (typeof pointer.branch[name] === 'undefined') {
      pointer.head = name
      pointer.branch[name] = 0
      fs.outputJsonSync(pointerPath, pointer)
      success = true
    }
    return {success}
  }

  function exists(name, version) {
    version = path.parse(version).name + '.json'
    return fs.existsSync(muOps.path('history', name, version))
  }

  function latest(name = pointer.head) {
    let latest = 0

    const historyPath = muOps.path('history', name)
    if(fs.existsSync(historyPath)){

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

  return {
    head: pointer.head,
    branch: pointer.branch,
    version: pointer.branch[pointer.head],
    setPointer,
    update,
    pointToNewHead,
    exists,
    latest
  }
}
