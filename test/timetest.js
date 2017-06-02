const a = []
const b = []

const t1 = + new Date().getTime()

for (let j = 0; j < 1000000; j++) {
  b[j] = [j]
}

let i = 1000000
while(i--){
  a[i] = [i]
}

const t2 = + new Date().getTime()

console.log(t2 - t1)
