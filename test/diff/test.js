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

 // const testFiles = ['a','b']
 const testFiles = [1]
 for(let i in testFiles){
  //  let f1 = fs.readFileSync(`test/diff/randomTextFiles/${testFiles[i]}1.txt`, 'utf8')
  //  let f2 = fs.readFileSync(`test/diff/randomTextFiles/${testFiles[i]}2.txt`, 'utf8')
  let f1 = '123'
  let f2 = '12345678'


   const myDiff = diff(f1,f2)
   const benchmarkDiff = lev(f1, f2)

   // is distance correct
   assert.equals(myDiff.distance, benchmarkDiff.distance)

   console.log(myDiff.backtrace)

   const traceLength = myDiff.backtrace.length - 1
   f2 = myDiff.backtrace.reduce((accum,_,i,arr) => {
     const op = arr[traceLength - i]
     if(op === 0) return accum.concat(f2[i])
     if(op === 1) return accum.concat(f1[traceLength - i])
    //  if(op === 2) return accum.concat(f1[f2maxi - index])
    //  if(op === 3)
     return accum.concat(f1[i])
   },[]).join('')

   //does backtrace work
  //  let f2maxi = myDiff.backtrace.length - 1
  //  let backtrackLength = myDiff.backtrace.length
  //  let index = 0
  //  while(index < backtrackLength){
  //    const operation = myDiff.backtrace[index]
  //    if(operation === 1){
  //      f2[f2maxi - index] = f1[f2maxi - index]
  //    }else if(operation === 2){
  //      f2 = del(f2, f2maxi - index)
  //    }else if(operation === 3){
  //      f2 = insert(f2, f2maxi - index, f1[f2maxi - index])
  //    }
  //    index++
  //  }
   assert.equals(f1,f2)
 }
