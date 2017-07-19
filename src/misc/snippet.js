	const renamed = Object.keys(tree.dat[hashsum]).find(f => {
		return !(GlData.recordedFiles.delete(f))
	})
	const mtime = GlConsts.lastSave.dat[hashsum][fp][1]
	handleFile.renamed(fp, renamed)
	fs.utimesSync(path.join(cwd,renamed) , +new Date(), mtime)
}
