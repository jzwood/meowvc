/**
 *  META OPERATIONS
 */

const fs = require('fs-extra')
const chalk = require('chalk')
const muOps = require('./muOps')
const {print} = require('../utils/print')

module.exports = {
  update,
  list,
  getMetadata
}

function getPath(head) {
  return muOps.path('history', head, 'meta.json')
}

async function getMetadata(head) {
  const mpath = getPath(head)
  return (await fs.pathExists(mpath)) ? fs.readJson(mpath) : {
    'messages': []
  }
}

async function update(head, version, mdata) {
  const mpath = getPath(head)
  const metadata = await getMetadata(head)
  if (mdata.msg) {
    metadata.messages[version] = mdata.msg
  }
  if (mdata.parent) {
    metadata.parent = mdata.parent
  }
  await fs.outputJson(mpath, metadata)
}

async function list(head, limit = Infinity) {
  const metadata = await getMetadata(head)
  print(chalk.green('history of'), head)
  return metadata.messages.reduce((acc, msg, v, arr) => {
    if (parseInt(v, 10) >= arr.length - limit) {
      print(chalk.yellow('v' + v), msg)
      return acc.concat(msg)
    }
    return acc
  }, [])
}
