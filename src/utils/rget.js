const fs = require('fs-extra')
const path = require('path')
/**
 * @description - recursively finds all files
 * @returns - promise for array of files
 */
module.exports = (root, ignorePattern) => {
  const rget = async (parent) => {
    return (await fs.readdir(parent))
      .reduce(async (pfiles, child, index, ls) => {
        const files = await pfiles
        if (!ignorePattern.test(child)) {
          const childpath = path.join(parent, child)
          const status = await fs.stat(childpath)
          if (status.isDirectory()) {
            return rget(childpath)
          }
          if (status.isFile()) {
            const relpath = path.relative(root, childpath)
            return files.concat({ childpath, relpath, status })
          }
        }
        return files
      }, Promise.resolve([]))
  }
  return rget(root)
}
