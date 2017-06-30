const fs = require('fs-extra')
const readline = require('readline')
const path = require('path')
const crc = require('crc')

module.exports = cwd => {
	const dotMu = '.mu'
	const linesPath = path.join(cwd, dotMu, 'disk_mem', 'lines')
	const filesPath = path.join(cwd, dotMu, 'disk_mem', 'files')
	const memory = new Set()
	const outputFileQueue = []
	const ignore_file = fs.readFileSync(path.join(cwd, dotMu, '_ignore'), 'utf8').trim().split('\n').join('|')
	const ignore = ignore_file ? new RegExp(ignore_file) : void(0)

	return {
		save(){
			const tree = getTree()
			let outputFile
			if(outputFileQueue.length){
				while(outputFile = outputFileQueue.pop()){
					fs.outputJsonSync(outputFile[0], outputFile[1])
				}
				const pointerPath = path.join(cwd, dotMu, '_pointer.json')
				const pointer = fs.readJsonSync(pointerPath)
				fs.outputJsonSync(path.join(cwd, dotMu, 'history', pointer.head, 'v' + pointer.branch[pointer.head]), tree)
				pointer.branch[pointer.head]++
				fs.outputJsonSync(pointerPath, pointer)
				return true
			}
			return false
		},
		stat(){
			getTree() //populates outputFileQueue
			let outputFile
			if(outputFileQueue.length){
				while(outputFile = outputFileQueue.pop()){
					console.log(outputFile)
				}
			}
		}
	}

	function getTree(){
		preCache()
		return blockify(cwd)
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
				const status = fs.statSync(childRelativePath)
				const inode = status.ino, size = status.size, mtime = fs._toUnixTimestamp(status.mtime)
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
					outputFileQueue.push([path.join(linesPath, insert(lineHash, 2, '/')), line])
				}
				return lineHash
			})
			outputFileQueue.push([path.join(filesPath, insert(fileHash, 2, '/')), hashes])
		}
		return fileHash
	}
}
