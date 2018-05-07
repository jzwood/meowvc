/**
 *  META OPERATIONS
 */

const fs = require('fs-extra')
const chalk = require('chalk')
const muOps = require('./muOps')

module.exports = {
  update,
  list,
  getMetadata
}

function getPath(head) {
  return muOps.path('history', head, 'meta.json')
}

function getMetadata(head) {
  const mpath = getPath(head)
  return fs.existsSync(mpath) ? fs.readJsonSync(mpath) : {
    'messages': []
  }
}

function update(head, version, mdata) {
  const mpath = getPath(head)
  const metadata = getMetadata(head)
  if (mdata.msg) {
    metadata.messages[version] = mdata.msg
  }
  if (mdata.parent) {
    metadata.parent = mdata.parent
  }
  fs.outputJsonSync(mpath, metadata)
}

function list(head, limit = Infinity) {
  const metadata = getMetadata(head)
  console.info(chalk.green('history of'), head)
  return metadata.messages.reduce((acc, msg, v, arr) => {
    if (parseInt(v, 10) >= arr.length - limit) {
      console.info(chalk.yellow('v' + v), msg)
      return acc.concat(msg)
    }
    return acc
  }, [])
}
