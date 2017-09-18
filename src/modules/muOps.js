/*
 *  LOCAL/DROPBOX MU OPERATIONS
 */

const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const muidContents = readMuid()
const cwd = process.cwd()

const MU = {
  muid: '.muid',
  local: '.mu'
}

const paths = {
  muid: path.join(cwd, MU.muid),
  local: () => path.join(cwd, MU.local, ...arguments),
  remote: () => path.join(muidContents.remotePath, ...arguments)
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
    remote.remotePath = path.join(dropboxPath, 'Mu Repositories', name)
    fs.ensureDirSync(remote.remotePath)
  }else{
    fs.ensureDirSync(paths.local())
  }
  fs.writeJsonSync(paths.muid, remote)
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
  if(!fs.existsSync(dropboxConfig)){
    return false
  }

  const dropboxConfig = fs.readJsonSync(dropboxConfigPath)
  const dropBoxPath = dropboxConfig.personal.path

  if(!fs.existsSync(dropBoxPath)){
    return false
  }

  const dropboxProjects = path.join(dropBoxPath, 'Mu Projects')
  fs.ensureDirSync(dropboxProjects)
  return dropboxProjects
}

function readMuid(){
  if(fs.existsSync(paths.muid)){
    const muidContents = fs.readJsonSync(paths.muid)
    if(!muJson.isLocal && !fs.existsSync(muJson.remotePath)){
      muJson.isLocal = true //resets a corrupted remote path to local
      fs.writeJsonSync(paths.muid, muidContents)
    }
    return muidContents
  }
  return null
}
