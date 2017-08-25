const testOps = require('../testOps')

module.exports = () => {
  testOps.setupTest()
  //
  // console.info('start')
  // mu(['start'])
  testOps.addFile(3)
}
