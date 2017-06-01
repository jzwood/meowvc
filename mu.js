const diff = require('./src/diff/diff.js')


const ed = require('edit-distance')
// Define cost functions.

const lev = (a, b) => {
  let insert, remove, update
  insert = remove = function(node) { return 1; }
  update = function(stringA, stringB) { return stringA !== stringB ? 1 : 0; }
  return ed.levenshtein(a, b, insert, remove, update)
}

var a = 'dfasdfasdfasdf'
var b = 'dsdfasdf'

var t = lev(a, b)
var d = diff(a, b)
// console.log(t.distance, d.distance, t.pairs(), d.backtrace)
console.log(d.distance, d.backtrace)
