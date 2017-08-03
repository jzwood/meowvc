const fs = require('fs-extra')
const path = require('path')

module.exports = {
  require(directory){
    const files = {}
    directory = path.join(__dirname,'../', directory)
    if(fs.existsSync(directory)) {
      fs.readdirSync(directory).forEach(script => {
        files[script] = require(path.join(directory, script))
      })
    }
    return files
  }
}
