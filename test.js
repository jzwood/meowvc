//function ask(prompt) {
//return new Promise(resolve => {
//process.stdout.write(prompt)
//process.stdin.setEncoding('utf8')
//process.stdin.on('readable', () => {
//const chunk = process.stdin.read()
//if (chunk) {
//resolve(chunk.toString())
//}
//})
//})
//}

//var a = ask('hello ').then(v => { console.log(v) })

function cat() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("hello")
      resolve()
    }, 2000)
  })
}

cat()
