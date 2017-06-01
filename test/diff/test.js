const assert = require('../utils/testtools.js').assert
const diff = require('../../diff/diff.js')
const fs = require('fs')

const ed = require('edit-distance')
// Define cost functions.


const lev = (a, b) => {
  let insert, remove, update
  insert = remove = function(node) { return 1; }
  update = function(stringA, stringB) { return stringA !== stringB ? 1 : 0; }
  return ed.levenshtein(a, b, insert, remove, update)
}

/*
 * TEST 1
 */
let a1 = fs.readFileSync('test/diff/a1.txt', 'utf8')
let a2 = fs.readFileSync('test/diff/a2.txt', 'utf8')

const myDiff = diff(a1,a2).distance
const benchmarkDiff = lev(a1, a2).distance


assert.equals(myDiff, benchmarkDiff)
