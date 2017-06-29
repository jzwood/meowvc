const mv = require('mv')
const path = require('path')

module.exports = (cwd, newHead) => {

  fs.readdirSync(cwd).forEach(dpath => {
    mv('source/dir', 'dest/a/b/c/dir', {mkdirp: true, clobber: true}, function(err) {
      // done. it first created all the necessary directories, and then
      // tried fs.rename, then falls back to using ncp to copy the dir
      // to dest and then rimraf to remove the source dir
    })
  })
}
