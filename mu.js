/*
 *	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
 */

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const discretize = require('./src/discretize.js')

const dotMu = '.mu'
const sanitizeInput = str => str.toString().toLowerCase().replace(/-?_?/g, '')
let cwd, isMuRoot
let t1, t2

const setup = () => {
		t1 = + new Date()
}
const cleanup = () => {
	t2 = + new Date()
	console.log((t2 - t1)/1000)
}

function mu(args) {

	setup()

	cwd = process.cwd()
	isMuRoot = fs.existsSync(path.join(cwd, dotMu))

	for (let i = 0, n = args.length; i < n; i++) {
		const command = { init, stat, save, saveas, getblock }[sanitizeInput(args[i])]
		if (typeof command === 'function') {
			if (isMuRoot || args[i] === 'init') {
				return command(i, args)
			} else {
				chalk.red('this directory has no mu!')
			}
		}
	}
	console.log(chalk.magenta('@todo: mu usage'))
}

mu(process.argv)

function dest(fpath) {
	return path.join(cwd, dotMu, fpath)
}

function init(i) {
	if (isMuRoot) {
		console.log(chalk.red('there is already a mu here!'))
	} else {
		fs.ensureDirSync(dest('history'))
		fs.writeJsonSync(dest('_pointer.json'), {
			head: "master",
			branch: {
				master: "-1"
			}
		})
		fs.writeFileSync(dest('_ignore'), `node_modules\n^\\.`, 'utf8')
		console.log(chalk.green('wild mu successfully released'))
	}
}

function stat(i) {
	console.log('stat', i)
	const pointer = fs.readJsonSync(dest('_pointer.json'))
	const head = pointer.head
	const output = Object.keys(pointer.branch).map(key => {
		return (key === head) ? chalk.green(key, 'v' + Math.max(0, pointer.branch[key])) : key
	}).join(' ')
	console.log(output)
}

function save(i) {
	console.log('save', i)
	let pointer = fs.readJsonSync(dest('_pointer.json'))
	pointer.branch[pointer.head]++
	fs.outputJsonSync(dest('_pointer.json'), pointer)
	discretize(cwd, pointer.head).save()
	console.log(chalk.red('The mu is done inventorying'))
	cleanup()
}

function saveas(i, args) {
	console.log('saveas', i)
	const name = args[i + 1]
	if (name) {
		let pointer = fs.readJsonSync(dest('_pointer.json'))
		if(typeof pointer.branch[name] === 'undefined'){
			pointer.head = name
			pointer.branch[name] = -1
			fs.outputJsonSync(dest('_pointer.json'), pointer)
			save(i)
			cleanup()
		}else{
			console.log(chalk.yellow('The mu says you have already named a save \"' + name + '\"'))
		}
	} else {
		console.log(chalk.red('Mu expects'), chalk.inverse('saveas'), chalk.red('to include a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
	}
}

function getblock(i) {
	console.log('getblock', i)
}
