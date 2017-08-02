let t1, t2

const startTimer = () => {
  t1 = +new Date()
}
const stopTimer = () => {
  t2 = +new Date()
  console.log((t2 - t1) / 1000 + 's')
}
