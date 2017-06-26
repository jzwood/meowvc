/*
 *	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
 */

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const discretize = require('./src/discretize.js')

const DotMu = '.mu'
const sanitizeInput = str => str.toString().toLowerCase().replace(/-?_?/g, '')
let cwd, isMuRoot
let t1

function mu(args) {

	t1 = + new Date()

	cwd = process.cwd()
	isMuRoot = fs.existsSync(path.join(cwd, DotMu))

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
	return path.join(cwd, DotMu, fpath)
}

function init(i) {
	if (isMuRoot) {
		console.log(chalk.red('there is already a mu here!'))
	} else {
		fs.ensureDirSync(dest('history'))
		fs.writeJsonSync(dest('_pointer.json'), {
			head: "master",
			branches: {
				master: "v0.0.0"
			}
		})
		fs.writeFileSync(dest('_ignore'), `node_modules\n^\\.`, 'utf8')
		console.log(chalk.green('wild mu successfully released'))
	}
}

function stat(i) {
	console.log('stat', i)
}

function save(i) {
	console.log('save', i)
	let pointer = fs.readJsonSync(dest('_pointer.json'))
	discretize(cwd, pointer.head).save()
	console.log(chalk.red('The mu is done inventorying'))
	const t2 = + new Date()
	console.log((t2 - t1)/1000)
}

function saveas(i, args) {
	console.log('saveas', i)
	const name = args[i + 1]
	if (name) {
		let pointer = fs.outputJsonSync(dest('_pointer.json'))
		pointer.head = name
		pointer.branch[name] = "v0.0.0"
		fs.outputJsonSync(dest('_pointer.json'), pointer)
	} else {
		console.log(chalk.red('Mu expects'), chalk.inverse('saveas'), chalk.red('to include a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
	}
}

function getblock(i) {
	console.log('getblock', i)
}
