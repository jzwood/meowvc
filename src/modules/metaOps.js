/**
*  META OPERATIONS
*/

const fs = require('fs-extra')
const chalk = require('chalk')
const muOps = require('./muOps')

module.exports = head => {
  const metafp = muOps.path('history', head, 'meta.json')
  let meta = fs.existsSync(metafp) ? fs.readJsonSync(metafp) : {
    'messages': []
  }

  function update(version, mdata) {
    if (mdata.msg) {
      meta.messages[version] = mdata.msg
    }
    if (mdata.parent) {
      meta.parent = mdata.parent
    }
    fs.outputJsonSync(metafp, meta)
  }

  function list(limit) {
    console.info(chalk.green('history of'), head)
    meta.messages.slice(-limit).map((msg, v) => {
      console.info(chalk.yellow('v' + v), msg)
    })
  }

  return {
    update,
    list
  }
}
