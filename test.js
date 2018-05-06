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

setTimeout(() => {
  console.log("hello")
}, 2000)
