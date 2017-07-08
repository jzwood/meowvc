const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const chalk = require('chalk')

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
	const recordedFiles = new Set()
	const outputFileQueue = []
	const ignore_file = fs.readFileSync(path.join(cwd, dotMu, '_ignore'), 'utf8').trim().split('\n').join('|')
	const ignore = ignore_file ? new RegExp(ignore_file) : void(0)
	const lastSave = getSavedData()

	return {
		save() {
			const tree = getTree()
			let outputFile
			if (outputFileQueue.length) {
				while (outputFile = outputFileQueue.pop()) {
					fs.outputJsonSync(outputFile[0], outputFile[1])
				}
				const po = pointerOps()
				fs.outputJsonSync(path.join(cwd, dotMu, 'history', po.head, 'v' + po.version), tree)
				po.incrPointer()
				po.writePointer()
				return true
			}
			return false
		},
		stat() {
			blockify(cwd, true)
			const previousFilepaths = Object.keys(lastSave.dat)
			let outputFile
			while (outputFile = previousFilepaths.pop()) {
				const fileData = lastSave.dat[outputFile]
				if (!recordedFiles.delete(fileData[0])) {
					print.deleted(fileData[0])
				}
			}
			for (let item of recordedFiles) {
				print.added(item)
			}
		}
	}

	function getTree() {
		preCache()
		return blockify(cwd, false)
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
				recordedFiles.add(childRelativePath)
				tree.ino[inode] = hashsum
				tree.dat[hashsum] = data
			}
			return tree
		}, baseCase())
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

	function pointerOps(){
		const pointerPath = path.join(cwd, dotMu, '_pointer.json')
		const pointer = fs.readJsonSync(pointerPath)
		const writePointer = () => {
			fs.outputJsonSync(pointerPath, pointer)
		}
		const incrPointer = () => {
			pointer.branch[pointer.head]++
		}
		return {
			head: pointer.head,
			version: pointer.branch[pointer.head],
			incrPointer,
			writePointer
		}
	}

	function getSavedData(){
		const po = pointerOps()
		const currentVersion = po.version.toString()
		const lastSave = (currentVersion === '0') ? baseCase() : fs.readJsonSync(path.join(cwd, dotMu, 'history', po.head, 'v' + (currentVersion - 1)))
		return lastSave
	}

	function hashIt(data){
		const h = crc.crc32(data).toString(16)
		if (h === '0') return '00000000'
		return h
	}

	function hashOnly(fpath){
		const file = fs.readFileSync(fpath, 'utf8')
		return hashIt(file)
	}

	function hashNCache(fpath) {
		const isUncached = hash => !(memory.has(hash))
		const cacheIt = data => {
			memory.add(data)
		}

		const file = fs.readFileSync(fpath, 'utf8')
		const fileHash = hashIt(file)

		if (isUncached(fileHash)) {
			cacheIt(fileHash)
			const insert = (string, index, substr) => string.slice(0, index) + substr + string.slice(index)
			const hashes = file.split('\n').map(line => {
				const lineHash = hashIt(line)
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
