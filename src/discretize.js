const fs = require('fs-extra')
const readline = require('readline')
const path = require('path')
const crc = require('crc')

module.exports = (cwd, block) => {
	const linesPath = path.join(cwd, '.mu', 'disk_mem', 'lines')
	const filesPath = path.join(cwd, '.mu', 'disk_mem', 'files')
	const memory = new Set()
	const ignore_file = fs.readFileSync(path.join(cwd, '.mu', '_ignore'), 'utf8').trim().split('\n').join('|')
	const ignore = ignore_file ? new RegExp(ignore_file) : void(0)

	return {
		save(){
			preCache()
			const tree = blockify(cwd)
			fs.outputJsonSync(path.join(cwd,'.mu/history', block, '_register.json'), tree)
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
				const childRelativePath = path.relative(cwd, childPath)
				const hashsum = hashNCache(childRelativePath)
				tree[hashsum] = childRelativePath
			}
			return tree
		}, baseCase)
		return hashFileLookup
	}

	function preCache() {
		fs.ensureDirSync(linesPath)
		fs.ensureDirSync(filesPath)

		fs.readdirSync(linesPath).forEach(d => {
			fs.readdirSync(path.join(linesPath, d)).forEach(f => {
				memory.add('' + d + f)
			})
		})
		fs.readdirSync(filesPath).forEach(d => {
			fs.readdirSync(path.join(filesPath, d)).forEach(f => {
				memory.add('' + d + f)
			})
		})
	}

	function hashNCache(fpath) {
		const hashIt = data => {
			const h = crc.crc32(data).toString(16)
			if(h === '0') return '00000000'
			return h
		}
		const isUncached = hash => !(memory.has(hash))
		const cacheIt = data => {
			memory.add(data)
		}
		const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)

		const file = fs.readFileSync(fpath, 'utf8')
		const fileHash = hashIt(file)

		if (isUncached(fileHash)) {
			cacheIt(fileHash)
			const hashes = file.split('\n').map(line => {
				const lineHash = hashIt(line)
				if (isUncached(lineHash)) {
					cacheIt(lineHash)
					fs.outputFileSync(path.join(linesPath, insert(lineHash, 2, '/')), line)
				}
				return lineHash
			})
			fs.outputJsonSync(path.join(filesPath, insert(fileHash, 2, '/')), hashes)
		}
		return fileHash
	}
}
