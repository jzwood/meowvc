module.exports = () => {
  const simpleset = {}
  return {
    add(val) {
      simpleset[val] = true
    },
    has(val) {
      return typeof simpleset[val] !== 'undefined'
    },
    remove(val) {
      delete e[val]
    }
  }
}
