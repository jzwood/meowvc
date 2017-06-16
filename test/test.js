const diff = require('minimum-edit-distance')
const colors = require('colors')
const fs = require('fs')

/*
 * TEST DIFF
 */

let str1 = 'blos meine eigenen Ansichten, sondern auch die Lehren der verschiedenen'
let str2 = 'blos meine eigfnen Ansichten, sondern auch die Lehren der verschiedenen'

const myDiff = diff.diff(str1, str2)
console.log(str1.cyan, str2.yellow)
console.log(myDiff)


// process.exit(1)
