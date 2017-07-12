const fs = require('fs-extra')
const path = require('path')
const crc = require('crc')
const chalk = require('chalk')
const pointerOps = require('./pointerOps')
const frankenstein = require('./frankenstein')

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
			modified: str => console.log(chalk.cyan('%\t' + str)),
			deleted: str => console.log(chalk.red('x\t' + str)),
			renamed: (strOld, strNew) => console.log(chalk.magenta('&\t' + strOld, '->', strNew)),
			added: str => console.log(chalk.yellow('+\t' + str))
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
		const lastSavePath = path.join(cwd, Root, 'history', po.head, 'v' + Math.max(0, currentVersion - 1))
		const lastSave = fs.existsSync(lastSavePath) ? fs.readJsonSync(lastSavePath) : GlConsts.baseCase
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
				fs.outputJsonSync(dest(po.head, po.version), tree) // write tree
				po.incrPointer()
				po.writePointer()
				return true
			} else if (head){
				const po = pointerOps(cwd, Root)
				fs.copySync(dest(head, po.branch[head] - 1), dest(po.head, po.version))
				return true
			}
			return false
		},
		diff(pattern) {
			const handleFile = pattern ? frankenstein(cwd).undo : GlConsts.print
			const tree = blockify(cwd, true)
			const previousFileHashes = Object.keys(GlConsts.lastSave.dat)
			let hashsum
			while (hashsum = previousFileHashes.pop()) {
				const hasHash = GlData.recordedHashes.delete(hashsum)
				const filepath = GlConsts.lastSave.dat[hashsum][0]
				const hasFile = GlData.recordedFiles.delete(filepath)

				if(!pattern || pattern.test(filepath)){
					if(!hasHash && !hasFile){
						handleFile.deleted(filepath, hashsum)
					}else if (!hasHash && hasFile) {
						handleFile.modified(filepath, hashsum)
					}else if(hasHash && !hasFile){
						const renamed = tree.dat[hashsum][0]
						handleFile.renamed(filepath, renamed)
						GlData.recordedFiles.delete(renamed)
					}
				}
			}
			for (let file of GlData.recordedFiles) {
				if(!pattern || pattern.test(file)){
					handleFile.added(file)
				}
			}
		},
		undo(pattern){
			const previousFileHashes = Object.keys(GlConsts.lastSave.dat)
			let hashsum
			while (hashsum = previousFileHashes.pop()) {
				const dat = GlConsts.lastSave.dat[hashsum]
				pattern = new RegExp(pattern)
				console.log('targeting:', pattern.test(dat[0]), dat[0])
			}
		}
	}

	// iterates through every file in root directory
	function blockify(parent, isStat) {
		if (!fs.existsSync(parent)) return GlConsts.baseCase
		const hashFileLookup = fs.readdirSync(parent).reduce((tree, child) => {
			if (GlConsts.ignore && GlConsts.ignore.test(child)) return tree
			const childPath = path.join(parent, child)
			const status = fs.statSync(childPath)
			const isDir = status.isDirectory()
			if (isDir) {
				const treeTemp = blockify(childPath, isStat)
				Object.assign(tree.ino, treeTemp.ino)
				Object.assign(tree.dat, treeTemp.dat)
			} else {
				const childRelativePath = path.relative(cwd, childPath)
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
