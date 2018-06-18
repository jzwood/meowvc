const {print} = require('./print')

module.exports = () => {
  let t1, t2
  return {
    start(){
      t1 = Date.now()
    },
    stop(){
      t2 = Date.now()
      print((t2 - t1) / 1000 + 's')
    }
  }
}

