/**
 *  POINTER OPERATIONS
 */

const fs = require('fs-extra')
const path = require('path')
const muOps = require('./muOps')
const gl = require('../constant')

let pointer = {}

const pointerOps = {
  init,
  get head() {
    return pointer.head
  },
  get branch() {
    return pointer.branch
  },
  get version() {
    return pointer.branch[pointer.head]
  },
  setPointer,
  incrementVersion,
  pointToNewHead,
  exists,
  latest
}

module.exports = pointerOps

function sanitizeVersion(version) {
  return parseInt(version.match(/(\d+)/)[1], 10)
}

async function init() {
  const pointerPath = muOps.path('_pointer.json')
  if (!(await fs.pathExists(pointerPath))) {
    pointer = {
      head: 'master',
      branch: {
        master: 0
      }
    }
    await fs.outputJson(pointerPath, pointer)
  } else {
    pointer = await fs.readJson(pointerPath)
  }
  pointerOps.pointerPath = pointerPath
}

function setPointer(head, version) {
  pointer.head = head
  pointer.branch[head] = sanitizeVersion(version)
}

async function incrementVersion() {
  //incr version
  ++pointer.branch[pointer.head]

  //save
  await fs.outputJson(pointerOps.pointerPath, pointer)
}

// switches current head to name
async function pointToNewHead(name) {
  if (typeof pointer.branch[name] === 'undefined') {
    pointer.head = name
    pointer.branch[name] = 0
    await fs.outputJson(pointerOps.pointerPath, pointer)
    return gl.exit.success
  } else {
    return gl.exit.cannotExe
  }
}

function exists(name, version) {
  version = path.parse(version).name + '.json'
  return fs.pathExists(muOps.path('history', name, version))
}

async function latest(name = pointer.head) {
  let latest = 0

  const historyPath = muOps.path('history', name)
  if (await fs.pathExists(historyPath)) {

    const historyRepo = await fs.readdir(historyPath)

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

