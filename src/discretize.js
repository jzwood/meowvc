const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const chalk = require('chalk')
const pointerOps = require('./pointerOps')

module.exports = cwd => {

	const Root = '.mu'

	const GlConsts = {
		linesPath: path.join(cwd, Root, 'disk_mem', 'lines'),
		filesPath: path.join(cwd, Root, 'disk_mem', 'files'),
		get baseCase() {
			return {
				'ino': {},
				'dat': {}
			}
		},
		print: {
			'modified': str => console.log(chalk.cyan('%\t' + str)),
			'deleted': str => console.log(chalk.red('-\t' + str)),
			'added': str => console.log(chalk.yellow('+\t' + str))
		}
	}

	Object.assign(GlConsts, {
		ignore: _ignore(),
		lastSave: _getSavedData()
	})

	const GlData = {
		memory: new Set(),
		recordedHashes: new Set(),
		recordedFiles: new Set(),
		outputFileQueue: []
	}

	function _ignore(){
		const ignore_file = fs.readFileSync(path.join(cwd, Root, '_ignore'), 'utf8').trim().split('\n').join('|')
		const ignore = ignore_file ? new RegExp(ignore_file) : void(0)
		return ignore
	}

	function _getSavedData(){
		const po = pointerOps(cwd, Root)
		const currentVersion = po.version.toString()
		const lastSave = (currentVersion === '0') ? GlConsts.baseCase : fs.readJsonSync(path.join(cwd, Root, 'history', po.head, 'v' + (currentVersion - 1)))
		return lastSave
	}

	return {
		save(head) {
			_preCache()
			const tree = blockify(cwd, false)
			const dest = (head, version) => path.join(cwd, Root, 'history', head, 'v' + version)
			let outputFile
			if (GlData.outputFileQueue.length) {
				while (outputFile = GlData.outputFileQueue.pop()) {
					fs.outputJsonSync(outputFile[0], outputFile[1])
				}
				const po = pointerOps(cwd, Root)
				fs.outputJsonSync(dest(po.head, po.version), tree)
				po.incrPointer()
				po.writePointer()
				return true
			} else if (head){
				const po = pointerOps(cwd, Root)
				fs.copySync(dest(head, po.branch[head]), dest(po.head, po.version))
			}
			return false
		},
		status() {
			const tree = blockify(cwd, true)
			const previousFileHashes = Object.keys(GlConsts.lastSave.dat)
			let hashsum
			while (hashsum = previousFileHashes.pop()) {
				const hasHash = GlData.recordedHashes.delete(hashsum)
				const filepath = GlConsts.lastSave.dat[hashsum][0]
				const hasFile = GlData.recordedFiles.delete(filepath)
				if(!hasHash && !hasFile){
					GlConsts.print.deleted(filepath)
				}else if (!hasHash && hasFile) {
					GlConsts.print.modified(filepath)
				}
			}
			for (let file of GlData.recordedFiles) {
				GlConsts.print.added(file)
			}
		}
	}

	// iterates through every file in root directory
	function blockify(parent, isStat) {
		if (!fs.existsSync(parent)) return GlConsts.baseCase
		const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
			if (GlConsts.ignore && GlConsts.ignore.test(child)) return tree
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
				const lastHash = GlConsts.lastSave.ino[inode]
				let data = (lastHash && GlConsts.lastSave.dat[lastHash] || []).slice() //maybe remove slice...
				let hashsum = lastHash
				if(data[0] !== childRelativePath || data[1] !== size || data[2] !== mtime){
					data = [childRelativePath, status.size, fs._toUnixTimestamp(status.mtime)]
					hashsum = isStat ? hashOnly(childRelativePath) : hashNCache(childRelativePath)
				}
				GlData.recordedHashes.add(hashsum)
				GlData.recordedFiles.add(childRelativePath)
				tree.ino[inode] = hashsum
				tree.dat[hashsum] = data
			}
			return tree
		}, GlConsts.baseCase)
		return hashFileLookup
	}

	// stores every hash on disk in RAM
	function _preCache() {
		const lp = GlConsts.linesPath, fp = GlConsts.filesPath
		fs.ensureDirSync(lp)
		fs.ensureDirSync(fp)

		fs.readdirSync(lp).forEach(d => {
			fs.readdirSync(path.join(lp, d)).forEach(f => {
				GlData.memory.add('' + d + f)
			})
		})
		fs.readdirSync(fp).forEach(d => {
			fs.readdirSync(path.join(fp, d)).forEach(f => {
				GlData.memory.add('' + d + f)
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
		const isUncached = hash => !(GlData.memory.has(hash))
		const cacheIt = data => {
			GlData.memory.add(data)
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
					GlData.outputFileQueue.push([path.join(GlConsts.linesPath, insert(lineHash, 2, '/')), line])
				}
				return lineHash
			})
			GlData.outputFileQueue.push([path.join(GlConsts.filesPath, insert(fileHash, 2, '/')), hashes, fpath])
		}
		return fileHash
	}
}
