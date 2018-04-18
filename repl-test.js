const readline = require('readline')
const array = ['hello', 'world', 'my', 'name', 'is', 'martin']

function ask(question) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

async function decide(){
  for(let q of array){
    await ask(q)
  }
}

decide()
