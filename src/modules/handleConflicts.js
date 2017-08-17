const readline = require('readline')
const chalk = require('chalk')
const fileOps = require('./fileOps')

module.exports = conflicts => {
  return conflicts.length ? handle(conflicts.pop()) : false

  function handle(data){
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    let file = data[0]
    const prompt = `conflict for file ${chalk.yellow(file)}
Select: (o) keep original file
        (n) replace with new file
        (b) keep both`
    rl.question(prompt, answer => {
      rl.close()
      answer = answer.toLowerCase().trim()
      let extension = 1
      switch(answer){
      case 'o':
        break
      case 'n':
        fileOps.overwrite(data)
        break
      case 'b':
        while(fs.existsSync(`${file}_${++extension}`)){ /*intentionally empty*/ }
        data[0] = `${file}_${extension}`
        fileOps.overwrite(data)
        break
      default:
        handle(data)
      }
      return conflicts.length ? handle(conflicts.pop()) : false
    })
  }
}
