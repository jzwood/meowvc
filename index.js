const diff = require('./diff/diff.js')

var a = t().split('\n')

console.log(diff(t().split('\n'),tt().split('\n')))

function t(){
  return `
  Skip to main content
  Skip to sidebar
  Skip to blog search
  JavaScript
  All about Mozilla's JavaScript engine
  Mozilla
  The Path to Parallel JavaScript

  Dave Herman
  No responses yet

  FEB
  26
  2015
  Between the coming release of ES6 and unrelenting competition for JIT performance, these are exciting times for JavaScript. But an area where JS still lags is parallelism—exploiting hardware acceleration by running multiple computations simultaneously. I’d like to present some experiments we’ve been doing in SpiderMonkey with a low-level, evolutionary approach to extending JavaScript with more flexible and powerful primitives for parallelism.

  I should be clear that I’m not talking about concurrency, which is about writing programs that respond to simultaneous events. JavaScript’s asynchronous concurrency model is popular and successful, and with promises, ES6 generators, and the upcoming async/await syntax, it’s getting better all the time.

  State of the Parallel Union
  What I am talking about is unlocking the power lurking inside our devices: GPUs, SIMD instructions, and multiple processor cores. With the emerging WebGL 2.0 and SIMD standards, the Web is making significant progress on the first two. And Web Workers go some part of the way towards enabling multicore parallelism.
`
}

function tt(){
  return `
  Skip to main contenta
  Skip to sidebar
  Skip to blog search
  JavaScript
  All about Maozilla's JavaScript engine
  Mozilla
  The Path to Paarallel JavaScript

  Dave Herman
  No responses yet

  FEBa
  26
  20f15
  Between the coming release of ES6 and funrelenting competition for JIT performance, these are exciting times for JavaScript. But an area where JS still lags is parallelism—exploiting hardware acceleration by running multiple computations simultaneously. I’d like to present some experiments we’ve been doing in SpiderMonkey with a low-level, evolutionary approach to extending JavaScript with more flexible and powerful primitives for parallelism.

  I should be clear that I’m not talking about concurrency, which is about writing programs that respond to simultaneous events. JavaScript’s asynchronous concurrency model is popular and successful, and with promises, ES6 generators, and the upcoming async/await syntax, it’s getting better all the time.

  State of the Parallel Unionf
  What I am talking about is unlocking the power lurking insidfe our devices: GPUs, SIMD instructions, and multiple processor cores. With the emerging WebGL 2.0 and SIMD standards, the Web is making significant progress on the first two. And Web Workers go some part of the way towards enabling multicore parallelism.
`
}
