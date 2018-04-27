/**
 *  LOCAL/DROPBOX MU OPERATIONS
 */

const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const cwd = process.cwd()

const MU = {
  muid: '.muid',
  local: '.mu',
  remote: 'Mu Repositories',
  get muidPath() {
    return path.join(cwd, this.muid)
  }
}

const muOps = {
  _cachedRepoPath: null,
  findMuidAncestor,
  findRemotePath,
  setupRemote,
  async getPaths() {
    await setPathCache()
    return {
      isPath: this._cachedRepoPath,
      path(){
        return path.join(this._cachedRepoPath, ...arguments)
      },
      to: {
        lines: this.path('disk_mem', 'lines'),
        files: this.path('disk_mem', 'files'),
        bin: this.path('disk_mem', 'bin')
      }
    }
  }
}

function findRemotePath(name) {
  return name ? getDropboxPath(name) : Promise.resolve(MU.local)
}

async function setPathCache() {
  if(!muOps._cachedRepoPath){
    muOps._cachedRepoPath = await getRepoPath()
  }
}

async function setupRemote(name) {
  const repoPath = await findRemotePath(name)
  await fs.outputFile(MU.muidPath, repoPath)
  await setPathCache()
}

async function findMuidAncestor() {
  const parentPath = cwd.split(path.sep)
  while (parentPath.pop()) {
    if (await fs.pathExists(path.join(...parentPath, MU.muid))) {
      return parentPath
    }
  }
  return null
}

async function getDropboxPath(name) {

  let dropboxConfigPath
  const isWin = /^win/i.test(os.platform())

  const winPath1 = path.join('%APPDATA%', 'Dropbox', 'info.json')
  const winPath2 = path.join('%LOCALAPPDATA%', 'Dropbox', 'info.json')
  const unixPath = path.join(os.homedir(), '.dropbox', 'info.json')

  if (!isWin && await fs.pathExists(unixPath)) {
    dropboxConfigPath = unixPath
  } else if (isWin && await fs.pathExists(winPath1)) {
    dropboxConfigPath = winPath1
  } else if (isWin && await fs.pathExists(winPath2)) {
    dropboxConfigPath = winPath2
  } else {
    return false
  }

  const dropboxConfig = await fs.readJson(dropboxConfigPath)
  const dropBoxPath = dropboxConfig.personal.path

  if (await fs.pathExists(dropBoxPath)) {
    const dropboxMuPath = path.join(dropBoxPath, MU.remote, name)
    await fs.ensureDir(dropboxMuPath)
    return dropboxMuPath
  } else {
    return false
  }
}

async function getRepoPath() {
  if (await fs.pathExists(MU.muidPath)) {
    let repoPath = await fs.readFile(MU.muidPath, 'utf8')
    if (!(await fs.pathExists(repoPath))) {
      repoPath = MU.local
      await fs.writeJson(MU.muidPath, MU.local)
    }
    return repoPath
  }
  console.log(muOps._cachedRepoPath)
  return null
}

module.exports = muOps

