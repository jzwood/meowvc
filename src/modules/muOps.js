/**
 * LOCAL/DROPBOX MU OPERATIONS
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
  _test: {
    findRemotePath
  },
  isPath: false,
  start: {
    findMuidAncestor,
    setupRemote
  },
  ignorePath: path.join(cwd, '_muignore'),
  update
}

module.exports = muOps

function getPath() {
  return path.join(muOps._cachedRepoPath, ...arguments)
}

async function update() {
  muPath = await getRepoPath()
  const isPath = Boolean(muPath)
  muOps._cachedRepoPath = muPath
  if (isPath) {
    muOps.isPath = isPath
    muOps.path = getPath
    muOps.to = {
      bin: getPath('disk_mem', 'bin')
    }
  }
}

//call updateMuOps() after
async function setupRemote(name) {
  const muPath = await findRemotePath(name)
  await fs.outputFile(MU.muidPath, muPath)
}


function findRemotePath(name) {
  return name ? getDropboxPath(name) : Promise.resolve(MU.local)
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
  return null
}

