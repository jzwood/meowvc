
  async function retrieveData({targetHashsum}){
  return fs.readFile(muOps.path('disk_mem', 'bin', gl.insert(targetHashsum, 2, '/')))
}
