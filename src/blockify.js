/*
Recursively maps file tree
*/

const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')

function blockify(cwd, parent, block, callback, ignore) {
	const baseCase = {}
	if (!fs.existsSync(parent)) return baseCase
	const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
		if(ignore && ignore.test(child)) return tree
		const childPath = path.join(parent, child)
		const isDir = fs.statSync(childPath).isDirectory()
		if(isDir){
			Object.assign(tree,blockify(cwd, childPath, block, callback, ignore))
		} else {
			const childRelativePath = path.relative(cwd, childPath)
			const hashsum = callback(cwd, block, childRelativePath)
			tree[hashsum] = childRelativePath
		}
		return tree
	}, baseCase)
	fs.outputJsonSync(path.join(cwd,'.mu', block,'_register.json'), hashFileLookup)
	return hashFileLookup
}

function writePath(cwd, block, fpath){
	let file = fs.readFileSync(fpath,'utf8')
	const hashsum = crc.crc32(file).toString(16)
	const dest = path.join(cwd,'.mu', block, hashsum)
	fs.ensureDirSync(path.dirname(dest))
	fs.writeFileSync(dest, file)
	return hashsum
}

const tree = blockify(process.cwd(), process.cwd(), 'frontier', writePath ,/^\.|node_modules/)
console.log(tree)
