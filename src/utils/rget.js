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
          const abspath = path.join(parent, child)
          const status = await fs.stat(abspath)
          if (status.isDirectory()) {
            return files.concat(await rget(abspath))
          }
          if (status.isFile()) {
            const relpath = path.relative(root, abspath)
            return files.concat({ abspath, relpath, status })
          }
        }
        return files
      }, Promise.resolve([]))
  }
  return rget(root)
}
