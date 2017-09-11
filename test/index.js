const loader = require('../src/utils/loader')
const tests = loader.require('../test/tests')

const args = process.argv.slice(2)

const test = tests[args.pop()]
if(typeof test === 'function'){
  test()
}else{
  console.info('npm test <option>')
  console.info(`options: ${Object.keys(tests).join(', ')}`)
}
