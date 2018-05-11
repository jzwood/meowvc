let print = console.log

module.exports = {
  quiet() {
    print = () => {}
  },
  print() {
    return print(...arguments)
  }
}
