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
  get muidPath(){
    return path.join(cwd, this.muid)
  }
}

const muidContents = readMuid()

const paths = {
  local(){
    return path.join(cwd, MU.local, ...arguments)
  },
  remote(){
    return path.join(muidContents.remotePath, ...arguments)
  }
}


module.exports = {
  setupRemote,
  findMuidAncestor,
  muidContents,
  path: muidContents.isLocal ? paths.local : paths.remote
}

function setupRemote(name){
  const dropboxPath = getDropboxPath()
  const remote = {
    local: true
  }
  if(dropboxPath){
    remote.local = false
    remote.remotePath = path.join(dropboxPath, name)
    fs.ensureDirSync(remote.remotePath)
  }else{
    fs.ensureDirSync(paths.local())
  }
  fs.writeJsonSync(MU.muidPath, remote)
}

function findMuidAncestor(){
  const parentPath = cwd.split(path.sep)
  while (parentPath.length) {
    parentPath.pop()
    if(fs.existsSync(path.join(...parentPath, MU.muid))){
      return parentPath
    }
  }
  return null
}

function getDropboxPath(){
  const home = os.homedir()
  const dropboxConfigPath = path.join(home, '.dropbox/info.json')
  if(!fs.existsSync(dropboxConfigPath)){
    return false
  }

  const dropboxConfig = fs.readJsonSync(dropboxConfigPath)
  const dropBoxPath = dropboxConfig.personal.path

  if(!fs.existsSync(dropBoxPath)){
    return false
  }

  const dropboxProjects = path.join(dropBoxPath, 'Mu Repositories')
  fs.ensureDirSync(dropboxProjects)
  return dropboxProjects
}

function readMuid(){
  if(fs.existsSync(MU.muidPath)){
    const muidContents = fs.readJsonSync(MU.muidPath)
    if(!muidContents.isLocal && !fs.existsSync(muidContents.remotePath)){
      muidContents.isLocal = true //resets a corrupted remote path to local
      fs.writeJsonSync(MU.muidPath, muidContents)
    }
    return muidContents
  }
  return {isLocal: '', remotePath: '', isNull: true}
}
