var input = [
  ['2'],
  ['d3', '4', 'st', 'su', 'sG', 's ', 'se', 'st', 'ss', 'sh', 'sc', 'sö', 'sh', 's ', 'ss', '1', 'sd', 'i ', '2', 'sb', 'iü', '1', 'se', 'sg', 'sa', 'sr', 'sF', 's ', 'se', 'si', 'id', '1', 'st', 'sf', '1', 'sr', 'sh', 'sc', 'iS', '1', 'sr', 'se', 'ss', 'se', 'si', 'sd', 's ', 'sn', 'si', 's ', 'ss', 'sn', 'se', 'st', 'ss', 'sg', '1', 'in', 'ie', '2', 'se', 'sb', 'su', 'sa', 'sl', 'sg', 's ', 'sh', 'sc', 'sI', 's ', 's.', 'sg', 'sa', 'im'],
  ['imag. Ich glaube wenigstens in dieser Schrift die Frage über das höchste Gut und'],
  ['4'],
  ['d', '2', 'sf', 'si', 'se', 'd', '1', 'sg', 'd', '1', 'so', 'sv', '1', 'it', '2', 'si', 'sn', '1', 'sn', '1', 'sr', 'se', 'si', 'sh', 'i ', '2', 'ss', 'se', 'sL', 'd2', '1', 'd', '2', 'sd', '1', 'sl', 'ii', '1', 'ih', '1', 'sr', 'sU', 's ', 'sm', 'se', 'sd', '1', 'd', '2', 'su', 'sa', 's ', '1', 'sc', 'ii', '1', 'sn', '1', 'se', 'iw', '1', 's,', 'se', 'ss', 'se', 'si', 'sd', '4', 'sl', 'ir', '1', 'sh', 'sc', 'si', 'is'],
  ['1'],
  ['sn', 'se', 'sb', 'se', 'sL', 's ', '1', 'sz', '1', 'sa', '1', 's ', 'ss', 'sa', 'sd', 's ', 'ie', '2', 'sl', 'se', 'sw', '1', 's,', 'in', '1', 'sd', 'sr', 'ie', 'iw', '1', 'st', 'sg', '1', 'ss', '1', 'sä', 'sl', 'sh', 'sc', 'sa', 'sn', 'sr', 'd', '1', 'sv', '4', 'sa', 'sr', 'sF', 's ', '1', 'sq', 'sd', 's ', 'sb', 'sl', 'sa', 'sh', 'ss', '1', 'sd', 'd2', '1', 'd', '2', 'sl', 'il', 'io', '1', 's ', 'sr', '2', 'ia'],
  ['1'],
  ['d'],
  ['1']
]

const fs = require('fs')
const zlib = require('zlib')

zlib.gzip(JSON.stringify(input), function(err, buffer) {
  if (!err) {
    console.log(buffer.toString('base64'));
  }else{
    console.log(err)
  }
})


// var buffer = new Buffer('eJzT0yMAAGTvBe8=', 'base64');
// zlib.unzip(buffer, function(err, buffer) {
//   if (!err) {
//     console.log(buffer.toString());
//   }
// })


// var temp = JSON.parse(buf.toString())
// console.log(temp)

// var buf = new Buffer.from(JSON.stringify(binary))
// var buf = new Buffer.from('hello world')
// console.log(buf.toString())
//
//
// fs.writeFile('backup.txt', buf, 'utf-8', err => {
//   if (err) throw err
//   console.log('The file has been saved!')
// })

// var buf = new Buffer.from('hello world')
// console.log(buf)
//
//
// fs.writeFile('backup.txt', buf.toString('hex'), 'binary', err => {
//  if (err) throw err
//  console.log('The file has been saved!')
// })
