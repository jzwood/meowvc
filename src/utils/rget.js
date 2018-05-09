/**
 * @description - recursively finds all files
 * @returns - promise for array of files
 */
module.exports = async (root, igorePattern) => {
  const rget = async (parent) => {
    return (await fs.readdir(parent))
      .reduce(async (files, child, index, ls) => {
        if (!ignorePattern.test(child)) {
          const childpath = path.join(parent, child)
          const status = await fs.stat(childpath)
          if (status.isDirectory()) {
            return files.concat(rget(childpath))
          }
          if (status.isFile()) {
            const relpath = path.relative(treeRoot, childpath)
            return files.concat({childPath, relpath, status})
          }
          return files
        }
      }, [])
  }
  return rget(root)
}

