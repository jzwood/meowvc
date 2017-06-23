const fs = require('fs-extra')
const readline = require('readline')
const path = require('path')
const crc = require('crc')

module.exports = (cwd, block) => {
	const linesPath = path.join(cwd, '.mu', 'disk_mem', 'lines')
	const filesPath = path.join(cwd, '.mu', 'disk_mem', 'files')
	const memory = new Set()
	const ignore_file = fs.readdirSync(path.join(cwd, '.mu', '_ignore')).trim()
	const ignore = ignore_file ? new RegExp(ignore_file) : void(0)

	return {
		save(){
			preCache()
			const tree = blockify(cwd)
			fs.outputJsonSync(path.join(cwd,'.mu', block, '_register.json'), hashFileLookup)
		}
	}

	function blockify(parent) {
		const baseCase = {}
		if (!fs.existsSync(parent)) return baseCase
		const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
			if (ignore && ignore.test(child)) return tree
			const childPath = path.join(parent, child)
			const isDir = fs.statSync(childPath).isDirectory()
			if (isDir) {
				Object.assign(tree, blockify(childPath))
			} else {
				const childRelativePath = path.relative(childPath)
				const hashsum = hashNCache(childRelativePath, tree)
			}
			return tree
		}, baseCase)
		return hashFileLookup
	}

	function preCache() {
		fs.ensureDirSync(linesPath)
		fs.ensureDirSync(filesPath)
		fs.readdirSync(linesPath).forEach(v => {
			memory.add(v)
		})
		fs.readdirSync(filesPath).forEach(v => {
			memory.add(v)
		})
	}

	function hashNCache(fpath) {
		const hashIt = data => crc.crc32(data).toString(16)
		const isUncached = hash => !(memory.has(hash))
		const cacheIt = data => {
			memory.add(data)
		}

		const file = fs.readFileSync(fpath, 'utf8')
		const fileHash = hashIt(file)

		if (isUncached(fileHash)) {
			cacheIt(fileHash)
			const hashes = file.split('\n').map(line => {
				const lineHash = hashIt(line)
				if (isUncached(lineHash)) {
					cacheIt(hashsum)
					fs.writeFileSync(path.join(linesPath, lineHash), line)
				}
				return lineHash
			})
			fs.outputJsonSync(path.join(filesPath, fileHash), hashes)
		}
		return fileHash
	}
}
