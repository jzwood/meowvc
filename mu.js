/*
 *	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
 */

const sanitizeInput = str => str.toString().toLowerCase().replace(/-?_?/g, '')

function mu(args){
	for(let i=0, n=args.length; i<n; i++){
		const command = { init, stat, save, saveas, getblock }[sanitizeInput(args[i])]
		if(typeof command === 'function') return command(i)
	}
}

mu(process.argv)


function init(i) {
	console.log('init', i)
}

function stat(i) {
	console.log('stat', i)
}

function save(i) {
	console.log('save', i)
}

function saveas(i) {
	console.log('saveas', i)
}

function getblock(i) {
	console.log('getblock', i)
}
