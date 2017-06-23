/*
Recursively maps file tree
*/

const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const cache = require('./discretize.js')

function blockify(cwd, parent, callback, ignore) {
	const baseCase = {}
	if (!fs.existsSync(parent)) return baseCase
	const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
		if(ignore && ignore.test(child)) return tree
		const childPath = path.join(parent, child)
		const isDir = fs.statSync(childPath).isDirectory()
		if(isDir){
			Object.assign(tree, blockify(cwd, childPath, callback, ignore))
		} else {
			const childRelativePath = path.relative(cwd, childPath)
			const hashsum = callback(cwd, childRelativePath, tree)
		}
		return tree
	}, baseCase)
	return hashFileLookup
}

cache(cwd, fpath, block)

const tree = blockify(process.cwd(), process.cwd(), 'frontier', cache ,/^\.|node_modules/)
// fs.outputJsonSync(path.join(cwd,'.mu', block,'_register.json'), hashFileLookup)

console.log(tree)
