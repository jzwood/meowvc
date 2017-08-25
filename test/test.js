prepTest()

let args = process.argv

args.forEach((c,i) => {
  const command = commands[c]
  if (typeof command === 'function') {
    console.log(c)
    command(i, args)
  }
})

function prepTest(){
  const cwdTemp = path.join(gl.cwd, 'test','temp')
  fs.ensureDirSync(cwdTemp)
  process.chdir(cwdTemp)
  if(fs.existsSync(gl.root)){
    fs.removeSync(gl.root)
  }
}
