const diff = require('./src/diff/diff.js')

var one = '' // new
var two = 'dafsdjfaisdjfasdfuashdfhuasdf' // old

var d = diff.diff(one, two)

console.log(d.backtrace)

two = '' // new
one = 'dafsdjfaisdjfasdfuashdfhuasdf' // old

d = diff.diff(one, two)

console.log(d.backtrace)
