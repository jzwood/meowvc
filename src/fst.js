/*
 *  fs treeify
 */

const cwd = require('./sys/cwd')
const root = require('./sys/root')

const fs = require('fs-extra')
const chalk = require('chalk')

const path = require('path')
const pointerOps = require('./pointerOps')

module.exports = {
  treeify,
  getHashByInode,
  setHashByInode,
  setTreeData,
  getFileData,
  getSavedData
}

function baseCase(){
  return {
    'ino': {},
    'dat': {}
  }
}

function _ignore(){
  const ignore_file = fs.readFileSync(path.join(cwd, root, '_ignore'), 'utf8').trim().split('\n').join('|')
  const ignore = ignore_file ? new RegExp(ignore_file) : void(0)
  return ignore
}

// iterates through every file in root directory
function treeify(root, forEachFile) {
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
          const relpath = path.relative(cwd, childpath)
          forEachFile(tree, childpath, relpath, status)
        }
      }
    })
  }
  const tree = baseCase()
  if (!fs.existsSync(root)) return tree
  dirDive(tree, root)
  return tree
}


function getSavedData(cwd, name) {
  let lastSavePath
  if (name){
    lastSavePath = path.join(cwd, root, 'history', name.head, 'v' + name.version)
  } else {
    const po = pointerOps()
    const currentVersion = po.version
    lastSavePath = path.join(cwd, root, 'history', po.head, 'v' + Math.max(0, currentVersion - 1))
  }
  const lastSave = fs.existsSync(lastSavePath) ? fs.readJsonSync(lastSavePath) : baseCase()
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

function setTreeData(tree, hash, data) {
  tree.dat[hash] = tree.dat[hash] || ['uft8', 0, {}]
  tree.dat[hash][0] = data.encoding
  tree.dat[hash][1] = data.size
  tree.dat[hash][2][data.relpath] = data.mtime
}

function getFileData(tree, inode, filepath) {
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
