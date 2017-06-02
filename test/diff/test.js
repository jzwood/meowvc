const assert = require('../assert.js').assert
const diff = require('../../src/diff/diff.js')
const fs = require('fs')

const ed = require('edit-distance')
// Define cost functions.

const lev = (a, b) => {
  let insert, remove, update
  insert = remove = function(node) { return 1; }
  update = function(stringA, stringB) { return stringA !== stringB ? 1 : 0; }
  return ed.levenshtein(a, b, insert, remove, update)
}

const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
const del = (string, index) => string.slice(0, index) + string.slice(index + 1)

/*
 * TEST DIFF
 */
console.log('diff tests:'.yellow)

 const testFiles = ['a','b']
 for(let i in testFiles){
   let f1 = fs.readFileSync(`test/diff/randomTextFiles/${testFiles[i]}1.txt`, 'utf8')
   let f2 = fs.readFileSync(`test/diff/randomTextFiles/${testFiles[i]}2.txt`, 'utf8')

   const myDiff = diff.diff(f1,f2)
   const benchmarkDiff = lev(f1, f2)

   // is distance correct
   assert.equals(myDiff.distance, benchmarkDiff.distance, 'dist1 === dist2')
   // is backtrace correct
   assert.equals(f1, diff.reconstruct(f2, myDiff.backtrace), 'str1 === backtrace(str2)')
 }
