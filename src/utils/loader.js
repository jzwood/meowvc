const fs = require('fs-extra')
const path = require('path')

module.exports = {
  require(directory){
    const files = {}
    directory = path.join(__dirname,'../', directory)
    if(fs.existsSync(directory)) {
      fs.readdirSync(directory).forEach(script => {
        files[path.parse(script).name] = require(path.join(directory, script))
      })
    }
    return files
  }
}
