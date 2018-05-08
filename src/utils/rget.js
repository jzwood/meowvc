/**
 * @description - recursively finds all files
 * @returns - promise for array of files
 */
module.exports = (root, igorePattern) => {
  const allFiles = async (tree, parent) => {
    return (await fs.readdir(parent))
      .reduce(async (acc, child, index, ls) => {
        if (!ignorePattern.test(child)) {
          const childpath = path.join(parent, child)
          const status = await fs.stat(childpath)
          const [isDir, isFile] = [status.isDirectory(), status.isFile()]
          if (isDir) {
            dirDive(tree, childpath)
          } else if (isFile) {
            const relpath = path.relative(treeRoot, childpath)
            forEachFile(tree, childpath, relpath, status)
          }
        }
      }, [])
  }
}

