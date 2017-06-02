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
var b = 'aerfrf' // old
var a = 'asefesfaer' // new

var t = lev(a, b)
var d = diff(a, b)
// console.log(t.pairs())

function getNewStr(old, trace){
	let c = '', aPointer = old.length
	for(let i=0, n=d.backtrace.length; i < n; i++){
		const op = d.backtrace[i], skipBlock = parseInt(op)
		if(op[1] === '_'){
			c = old.slice(aPointer - skipBlock, aPointer) + c
			aPointer -= skipBlock
		}else if(op[0] === 's'){
			c = op[1] + c
			aPointer--
		}else if(op[0] === 'i'){
			c = op[1] + c
		}
	}
	return c
}

// console.log(a, getNewStr(b,d.backtrace), b, d.backtrace)
console.log(a, b, d.backtrace)
