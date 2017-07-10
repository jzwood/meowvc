/*
 *	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
 */

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const discretize = require('./src/discretize')
const pointerOps = require('./src/pointerOps')


const root = '.mu'
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
	isMuRoot = fs.existsSync(path.join(cwd, root))

	for (let i = 0, n = args.length; i < n; i++) {
		const command = { init, stat, save, saveas, get, which }[sanitizeInput(args[i])]
		if (typeof command === 'function') {
			if (isMuRoot || args[i] === 'init') {
				return command(i, args)
			} else {
				chalk.yellow('Warning:',cwd,'is not a mu repo')
			}
		}
	}
	console.log(chalk.magenta('@todo: mu usage'))
}

mu(process.argv)

function dest(fpath) {
	return path.join(cwd, root, fpath)
}

function init(i) {
	if (isMuRoot) {
		console.log(chalk.red('there is already a mu here!'))
	} else {
		fs.ensureDirSync(dest('history'))
		fs.outputJsonSync(dest('_pointer.json'), {
			head: "master",
			branch: {
				master: "0"
			}
		})
		fs.outputFileSync(dest('_ignore'), `node_modules\n^\\.`, 'utf8')
		console.log(chalk.green('wild mu successfully released'))
	}
}

function which(i) {
	console.log('which', i)
	const po = pointerOps(cwd, root)
	const output = Object.keys(po.branch).map(key => {
		return (key === po.head) ? chalk.green(key, '(v' + Math.max(0, po.branch[key]) + ')') : key
	}).join(' ')
	console.log(output)
	cleanup()
}

function stat(i) {
	console.log('stat', i)
	discretize(cwd).stat()
	cleanup()
}

function save(i) {
	console.log('save', i)
	discretize(cwd).save(false)
	console.log(chalk.red('done'))
	cleanup()
}

function saveas(i, args) {
	console.log('saveas', i)
	const name = args[i + 1]
	if (name) {
		const po = pointerOps(cwd, root)
		const head = po.head
		po.addName(name, exists => {
			if(exists) console.log(chalk.yellow('Warning: save named \"' + name + '\" already exists'))
		})
		discretize(cwd).save(head)
	} else {
		console.log(chalk.red('Mu expects'), chalk.inverse('saveas'), chalk.red('to include a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
	}
}

function get(i, args){
	console.log('get', i)
	// const name = args[i + 1]
	// if (name) {
	// 	let pointer = getPointer()
	// 	if(name !== pointer.head){
	// 		checkout(cwd, name)
	// 	}else{
	// 		console.log(chalk.red('working directory already \"', name, '\"'))
	// 	}
	// }else{
	// 	console.log(chalk.red('Mu expects'), chalk.inverse('get'), chalk.red('to include the name of a save, e.g.'), chalk.inverse('$ mu get master'))
	// }
}
