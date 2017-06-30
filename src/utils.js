module.exports = {
  ifIsDo(value, onExists, onUndefined, then){
    (typeof value !== 'undefined') ? onExists(value) : onUndefined()
    then()
  }
}
