const diff = require('./src/diff/diff.js')


const ed = require('edit-distance')
// Define cost functions.

const lev = (a, b) => {
	let insert, remove, update
	insert = remove = function(node) { return 1; }
	update = function(stringA, stringB) { return stringA !== stringB ? 1 : 0; }
	return ed.levenshtein(a, b, insert, remove, update)
}

//get new from old + backtrace
// var b = 'pewgdashdaaaso' // old
// var a = 'sadfafassdfa' // new

var b = 'dafsdjfaisdjfasdfuashdfhuasdf' // old
var a = 'asdhfhfgdysbsg' // new

var t = lev(a, b)
var d = diff.diff(a, b)

console.log(a === diff.reconstruct(b, d.backtrace))

var a = 'asdfnausdfuasdhfuhasdufhuhudqme' // new
var b = 'susdyfwrfbfsdbfds' // old

var t = lev(a, b)
var d = diff.diff(a, b)

console.log(a === diff.reconstruct(b, d.backtrace))
