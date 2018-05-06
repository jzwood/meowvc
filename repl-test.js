const stdin = require('./src/utils/stdin')

const array = ['hello', 'world', 'my', 'name', 'is', 'martin']
async function decide(){
  for(let q of array){
    await stdin(q)
  }
}

decide()
