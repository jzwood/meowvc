/**
 *  FS TREEIFY
 */

const fs = require('fs-extra')
const path = require('path')

const pointerOps = require('./pointerOps')
const gl = require('../constant')

module.exports = {
  treeify,
  getHashByInode,
  setHashByInode,
  setTreeData,
  getOnFileData,
  getSavedData
}

function _ignore(){
  const ignore_file = fs.readFileSync(gl.dest('_ignore'), 'utf8').trim().split('\n').join('|')
  const ignore = ignore_file ? new RegExp(ignore_file) : void(0)
  return ignore
}

// iterates through every file in root directory
function treeify(forEachFile) {
  const treeRoot = gl.cwd
  const ignorePattern = _ignore()
  const dirDive = (tree, parent) => {
    fs.readdirSync(parent).forEach((child, index, ls) => {
      if (!ignorePattern || !ignorePattern.test(child)) {
        const childpath = path.join(parent, child)
        const status = fs.statSync(childpath)
        const isDir = status.isDirectory()
        const isFile = status.isFile()
        if (isDir) {
          dirDive(tree, childpath)
        } else if (isFile) {
          const relpath = path.relative(gl.cwd, childpath)
          forEachFile(tree, childpath, relpath, status)
        }
      }
    })
  }
  const tree = gl.baseCase
  if (!fs.existsSync(treeRoot)) return tree
  dirDive(tree, treeRoot)
  return tree
}

function getSavedData(head, version) {
  let lastSavePath
  if (head && version){
    lastSavePath = gl.dest('history', head, version + '.json')
  } else {
    const po = pointerOps()
    lastSavePath = gl.dest('history', po.head, 'v' + Math.max(0, po.version - 1) + '.json')
  }
  const lastSave = fs.existsSync(lastSavePath) ? fs.readJsonSync(lastSavePath) : gl.baseCase
  return lastSave
}

/*
* TREE HELPERS
*/

function getHashByInode(tree, inode) {
  return tree.ino[inode]
}

function setHashByInode(tree, inode, hash) {
  tree.ino[inode] = hash
}

function setTreeData(tree, hash, path, data) {
  tree.dat[hash] = tree.dat[hash] || ['uft8', 0, {}]
  tree.dat[hash][0] = data.encoding
  tree.dat[hash][1] = data.size
  tree.dat[hash][2][path] = data.mtime
}

function getOnFileData(tree, inode, filepath) {
  const hash = tree.ino[inode]
  const data = tree.dat[hash]
  const mtime = hash && data[2] && data[2][filepath]
  return {
    get exists() {
      return !!(mtime)
    },
    get encoding() {
      return data && data[0]
    },
    get size() {
      return data && data[1]
    },
    get mtime() {
      return mtime
    }
  }
}
