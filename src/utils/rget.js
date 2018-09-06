const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const {print} = require('../utils/print')
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
          if (await fs.pathExists(abspath)) {
            const status = await fs.stat(abspath)
            if (status.isDirectory()) {
              return files.concat(await rget(abspath))
            }
            if (status.isFile()) {
              const relpath = path.relative(root, abspath)
              return files.concat({ relpath, status })
            }
          } else {
            print(chalk.red('WARNING: file ') + abspath + chalk.red(' inode not found, skipping...'))
          }
        }
        return files
      }, Promise.resolve([]))
  }
  return rget(root)
}
