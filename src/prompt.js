const readline = require('readline')
const chalk = require('chalk')

module.exports = (save, onComplete) => {

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('No new changes. Continue [Y/n]? ', answer => {
    rl.close()
    answer = answer.toUpperCase().trim()
    if (!answer || answer === 'Y') {
      save()
      onComplete.success()
      return true
    } else {
      onComplete.failure()
      return false
    }
  })
}
