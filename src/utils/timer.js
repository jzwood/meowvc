module.exports = () => {
  let t1, t2
  return {
    start(){
      t1 = +new Date()
    },
    stop(){
      t2 = +new Date()
      console.info((t2 - t1) / 1000 + 's')
    }
  }
}
