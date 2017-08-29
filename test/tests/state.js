const chalk = require('chalk')
const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  testOps.testMu(['start'])
  console.info(chalk.inverse('TEST'))
  let newFiles = testOps.addFiles(4)
  console.info(chalk.inverse('MU'))
  testOps.testMu(['state'])
  console.info(chalk.inverse('\nTEST'))
  for(let i=0, n=Math.floor(newFiles.length/2); i<n; i++){
    testOps.removeFile(newFiles[i])
  }
  console.info(chalk.inverse('MU'))
  testOps.testMu(['state'])
}
