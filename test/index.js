const chalk = require('chalk')
const loader = require('../src/utils/loader')
const tests = loader.require('../test/tests')

const args = process.argv.slice(2)

const test = tests[args.shift()]
if(typeof test === 'function'){
  test(args)
}else{
  console.info(`npm test <${chalk.cyan('option')}> [--] [${chalk.cyan('flags')}]`)
  console.info(`options: ${Object.keys(tests).map(op => chalk.cyan(op)).join(', ')}`)
  console.info(`flags:
  -${chalk.cyan('l')}:  test locally ie not on dropbox
  -${chalk.cyan('p')}:  preserve mu files after test ie don't run cleanup step`)
  console.info('example: npm test start -- -lp\n')
}
