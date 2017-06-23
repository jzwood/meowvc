/*
 *	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
 */

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const discretize = require('./src/discretize.js')

const DotMu = '.mu'
const sanitizeInput = str => str.toString().toLowerCase().replace(/-?_?/g, '')

function mu(args){
	for(let i=0, n=args.length; i<n; i++){
		const command = { init, stat, save, saveas, getblock }[sanitizeInput(args[i])]
		if(typeof command === 'function') return command(i)
	}
}

mu(process.argv)


function init(i) {
	const root = path.join(process.cwd(), DotMu)
	fs.ensureDirSync(root)
	const ledger = path.join(root, '_ledger.json')
	if(fs.existsSync(ledger)){
		console.log(chalk.red('there is a mu here already!'))
		return false
	}
	fs.writeJsonSync(ledger, {"block":0})
	console.log(chalk.green('wild mu released'))
}

function stat(i) {
	console.log('stat', i)
}

function save(i) {
	console.log('save', i)
	const cwd = process.cwd()
	discretize(cwd, 'frontier').save()
}

function saveas(i) {
	console.log('saveas', i)
}

function getblock(i) {
	console.log('getblock', i)
}
