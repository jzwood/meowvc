const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const chalk = require('chalk')
const pointerOps = require('./pointerOps')

module.exports = cwd => {
	const dotMu = '.mu'
	const linesPath = path.join(cwd, dotMu, 'disk_mem', 'lines')
	const filesPath = path.join(cwd, dotMu, 'disk_mem', 'files')
	const print = {
		'modified': str => console.log(chalk.cyan('%\t' + str)),
		'deleted': str => console.log(chalk.red('-\t' + str)),
		'added': str => console.log(chalk.yellow('+\t' + str))
	}
	const baseCase = () => {
		return {
			'ino': {},
			'dat': {}
		}
	}
	const memory = new Set()
	const recordedHashes = new Set()
	const recordedFiles = new Set()
	const outputFileQueue = []
	const ignore_file = fs.readFileSync(path.join(cwd, dotMu, '_ignore'), 'utf8').trim().split('\n').join('|')
	const ignore = ignore_file ? new RegExp(ignore_file) : void(0)
	const lastSave = _getSavedData()

	function _getSavedData(){
		const po = pointerOps(cwd, dotMu)
		const currentVersion = po.version.toString()
		const lastSave = (currentVersion === '0') ? baseCase() : fs.readJsonSync(path.join(cwd, dotMu, 'history', po.head, 'v' + (currentVersion - 1)))
		return lastSave
	}

	return {
		save(head) {
			_preCache()
			const tree = blockify(cwd, false)
			const dest = (head, version) => path.join(cwd, dotMu, 'history', head, 'v' + version)
			let outputFile
			if (outputFileQueue.length) {
				while (outputFile = outputFileQueue.pop()) {
					fs.outputJsonSync(outputFile[0], outputFile[1])
				}
				const po = pointerOps(cwd, dotMu)
				fs.outputJsonSync(dest(po.head, po.version), tree)
				po.incrPointer()
				po.writePointer()
				return true
			} else if (head){
				const po = pointerOps(cwd, dotMu)
				fs.copySync(dest(head, po.branch[head] - 1), dest(po.head, po.version))
			}
			return false
		},
		stat() {
			const tree = blockify(cwd, true)
			const previousFileHashes = Object.keys(lastSave.dat)
			let hashsum
			while (hashsum = previousFileHashes.pop()) {
				const hasHash = recordedHashes.delete(hashsum)
				const filepath = lastSave.dat[hashsum][0]
				const hasFile = recordedFiles.delete(filepath)
				if(!hasHash && !hasFile){
					print.deleted(filepath)
				}else if (!hasHash && hasFile) {
					print.modified(filepath)
				}
			}
			for (let file of recordedFiles) {
				print.added(file)
			}
		}
	}

	function blockify(parent, isStat) {
		if (!fs.existsSync(parent)) return baseCase()
		const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
			if (ignore && ignore.test(child)) return tree
			const childPath = path.join(parent, child)
			const isDir = fs.statSync(childPath).isDirectory()
			if (isDir) {
				const treeTemp = blockify(childPath, isStat)
				Object.assign(tree.ino, treeTemp.ino)
				Object.assign(tree.dat, treeTemp.dat)
			} else {
				const childRelativePath = path.relative(cwd, childPath)
				const status = fs.statSync(childRelativePath)
				const inode = status.ino,
					size = status.size,
					mtime = fs._toUnixTimestamp(status.mtime)
				const lastHash = lastSave.ino[inode]
				let data = lastHash && lastSave.dat[lastHash] || []
				let hashsum = lastHash
				if(data[0] !== childRelativePath || data[1] !== size || data[2] !== mtime){
					data = [childRelativePath, status.size, fs._toUnixTimestamp(status.mtime)]
					hashsum = isStat ? hashOnly(childRelativePath) : hashNCache(childRelativePath)
				}
				recordedHashes.add(hashsum)
				recordedFiles.add(childRelativePath)
				tree.ino[inode] = hashsum
				tree.dat[hashsum] = data
			}
			return tree
		}, baseCase())
		return hashFileLookup
	}

	function _preCache() {
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

	/*
	 * HASHING FUNCTIONS
	 */

	function _hashIt(data){
		const h = crc.crc32(data).toString(16)
		if (h === '0') return '00000000'
		return h
	}

	function hashOnly(fpath){
		const file = fs.readFileSync(fpath, 'utf8')
		return _hashIt(file)
	}

	function hashNCache(fpath) {
		const isUncached = hash => !(memory.has(hash))
		const cacheIt = data => {
			memory.add(data)
		}

		const file = fs.readFileSync(fpath, 'utf8')
		const fileHash = _hashIt(file)

		if (isUncached(fileHash)) {
			cacheIt(fileHash)
			const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
			const hashes = file.split('\n').map(line => {
				const lineHash = _hashIt(line)
				if (isUncached(lineHash)) {
					cacheIt(lineHash)
					outputFileQueue.push([path.join(linesPath, insert(lineHash, 2, '/')), line])
				}
				return lineHash
			})
			outputFileQueue.push([path.join(filesPath, insert(fileHash, 2, '/')), hashes, fpath])
		}
		return fileHash
	}
}
