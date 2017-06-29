const fs = require('fs-extra')
const readline = require('readline')
const path = require('path')
const crc = require('crc')
const util = require('./utils')

module.exports = (cwd, block) => {
	const dotMu = '.mu'
	const linesPath = path.join(cwd, dotMu, 'disk_mem', 'lines')
	const filesPath = path.join(cwd, dotMu, 'disk_mem', 'files')
	const memory = new Set()
	const ignore_file = fs.readFileSync(path.join(cwd, dotMu, '_ignore'), 'utf8').trim().split('\n').join('|')
	const ignore = ignore_file ? new RegExp(ignore_file) : void(0)

	return {
		save(){
			preCache()
			const tree = blockify(cwd)
			const pointer = fs.readJsonSync(path.join(cwd, dotMu, '_pointer.json'))
			fs.outputJsonSync(path.join(cwd, dotMu, 'history', block, 'v' + pointer.branch[pointer.head]), tree)
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
				const status = fs.statSync(childRelativePath)
				const inode = status.ino, size = status.size, mtime = fs._toUnixTimestamp(status.mtime)
				const childRelativePath = path.relative(cwd, childPath)

				const data = tree[inode] && tree[tree[inode]] || []
				if(data[0] !== childRelativePath || data[1] !== size || data[3] !== mtime){
					const hashsum = hashNCache(childRelativePath)
					tree[inode] = hashsum
					tree[hashsum] = [childRelativePath, status.size, fs._toUnixTimestamp(status.mtime)]
				}
				// else? no changes required!
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
