const readline = require('readline')
const {print} = require('./print')

module.exports = choice => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve, reject) => {
    rl.question(choice, decision => {
      rl.close()
      console.log("HEARD",decision)
      resolve(decision)
    })
  })
}

