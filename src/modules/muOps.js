/*
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
  setupRemote,
  findMuidAncestor,
  repoPath: getRepoPath(),
  path() {
    return path.join(this.repoPath, ...arguments)
  }
}

function setupRemote(name) {
  const repoPath = name ? getDropboxPath(name) : MU.local
  fs.outputFileSync(MU.muidPath, repoPath)
  muOps.repoPath = getRepoPath()
}

function findMuidAncestor() {
  const parentPath = cwd.split(path.sep)
  while (parentPath.length) {
    parentPath.pop()
    if (fs.existsSync(path.join(...parentPath, MU.muid))) {
      return parentPath
    }
  }
  return null
}

function getDropboxPath(name) {

  let dropboxConfigPath
  const isWin = /^win/i.test(os.platform())

  const winPath1 = path.join('%APPDATA%','Dropbox','info.json')
  const winPath2 = path.join('%LOCALAPPDATA%','Dropbox','info.json')
  const unixPath = path.join(os.homedir(), '.dropbox', 'info.json')

  if(!isWin && fs.existsSync(unixPath)){
    dropboxConfigPath = unixPath
  }else if(isWin && fs.existsSync(winPath1)){
    dropboxConfigPath = winPath1
  }else if (isWin && fs.existsSync(winPath2)){
    dropboxConfigPath = winPath2
  }else{
    return false
  }

  const dropboxConfig = fs.readJsonSync(dropboxConfigPath)
  const dropBoxPath = dropboxConfig.personal.path

  if (fs.existsSync(dropBoxPath)) {
    const dropboxMuPath = path.join(dropBoxPath, MU.remote, name)
    fs.ensureDirSync(dropboxMuPath)
    return dropboxMuPath
  }else{
    return false
  }
}

function getRepoPath() {
  let repoPath
  if (fs.existsSync(MU.muidPath)) {
    let repoPath = fs.readFileSync(MU.muidPath, 'utf8')
    if (!fs.existsSync(repoPath)) {
      repoPath = MU.local
      fs.writeJsonSync(MU.muidPath, MU.local)
    }
    return repoPath
  }
  return ''
}

module.exports = muOps
