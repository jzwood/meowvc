const minimumEditDistance = require('minimum-edit-distance')
const colors = require('colors')
const fs = require('fs')

/*
 * TEST DIFF
 */
console.log('diff tests:'.yellow)

const testFiles = ['a'] //['a','b','c']
for (let i in testFiles) {
	// let f1 = fs.readFileSync(`test/diff/randomTextFiles/${testFiles[i]}1.txt`, 'utf8').split('\n')
	// let f2 = fs.readFileSync(`test/diff/randomTextFiles/${testFiles[i]}2.txt`, 'utf8').split('\n')

	let f1 = `hello
world
I am
Frank`.split('\n')

	let f2 = `hello
world,
you are
Franklin
the mighty!`.split('\n')

	console.log(f1,f2)
	// const myDiff = diff.diff(f1.split('\n'), f2.split('\n'))
	// console.log(f2.split('\n'), myDiff.backtrace)

	var t = makePatch(f1, f2, minimumEditDistance)
	// console.log(t)


	function makePatch(strArry1, strArry2, med){
		const diff = med.diff(strArry1, strArry2, 2,1,1)
		const backtrace = diff.backtrace
		console.log(backtrace)
		let lineIndex = strArry2.length
		for(let i=0, n=backtrace.length; i<n; i++){
			if(backtrace[i][0] === 's'){
				backtrace[i] = med.diff(strArry1[n - i], strArry2[n - i]).backtrace
			}else{
				backtrace[i] = [backtrace[i]]
			}
		}
		return backtrace
	}

}

//input is patch buffer/obj/str(?)
function applyPatch(patch){

}

//returns patch buffer/obj/str(?)
function commutePatches(...patches){

}

function diffFile(f1, f2, med) {
	const f1Lines = f1.split('\n'),
		f2Lines = f2.split('\n')
	const diff = med.diff(f1Lines, f2Lines)
	const backtrace = diff.backtrace
	for(let i=0, n=backtrace.length; i<n; i++){
		if(backtrace[i][0] === 's'){
			backtrace[i] = med.diff(f1Lines[n-i], f2Lines[i]).backtrace
		}else{
			backtrace[i] = [backtrace[i]]
		}
	}
	return backtrace
}
