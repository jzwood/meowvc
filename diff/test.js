var ed = require('edit-distance');

// Define cost functions.
var insert, remove, update;
insert = remove = function(node) { return 1; };
update = function(nodeA, nodeB) { return nodeA.id !== nodeB.id ? 1 : 0; };

// Define two trees.
var rootA = {id: 1, children: [{id: 2}, {id: 3}]};
var rootB = {id: 1, children: [{id: 4}, {id: 3}, {id: 5}]};
var children = function(node) { return node.children; };

var q = t().split('\n')
// Compute edit distance, mapping, and alignment.
var ted = ed.ted(rootA, rootB, children, insert, remove, update);
console.log('Tree Edit Distance', ted.distance, ted.pairs(), ted.alignment());


// console.log(q)

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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code
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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code
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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code
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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code
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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code
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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code
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

  But workers are, by design, strongly isolated: they can only communicate via postMessage. And for good reason! JavaScript’s “run-to-completion” programming model is a central part of the programming experience: when your code runs in an event handler, the functions and methods that you call are the only code you have to worry about changing your app state. Nevertheless, this comes at a cost: when multiple threads want to coordinate, they repeatedly have to copy any data they need to communicate between each other. The ability to transfer binary buffers helps cut down on some of these copying costs, but for many apps this still just can’t compete with the ability for multiple threads to write simultaneously into different parts of shared state. Even setting aside the costs of data transfer, message-passing itself has nontrivial latency. It’s hard to compete with dedicated hardware instructions that allow threads to communicate directly through shared state.

  So where should we go from here? A radical option would be to bite the bullet and do what Nashorn has done: turn JavaScript into a fully multi-threaded data model and call it a day. In Nashorn, nothing stops you from running multiple Java threads on a shared JavaScript environment. Unless your host Java program is careful to synchronize your scripts, your JavaScript apps lose all the guarantees of run-to-completion. Frankly, I can’t imagine considering such a step right now. Even setting aside the massive standardization and implementation work required, it’s a huge ecosystem risk: every app, every library, every data structure ever written to date threatens to be subverted by imperfect (or malicious) uses of threads.

  On the other end of the spectrum, Mozilla Research and Intel Labs have done some experiments over the years with deterministic parallelism APIs (sometimes referred to as River Trail or PJS). The goal of these experiments was to find high-level abstractions that could enable parallel speedups without any of the pitfalls of threads. This is a difficult approach, because it’s hard to find high-level models that are general enough to suit a wide variety of parallel programs. And at least for the moment, PJS faces a difficult adoption challenge: JS engine implementors are reluctant to commit to a large implementation effort without more developer feedback, but developers can’t really put PJS through the paces without a good polyfill to try it out in real production apps.

  An Extensible Web Approach to Parallel JS
  In 2012, I co-signed the Extensible Web Manifesto, which urged browser vendors and standards bodies to prioritize basic, low-level, orthogonal primitives over high-level APIs. A key insight of the Extensible Web is that growing the platform incrementally actually enables faster progress because it allows Web developers to iterate quickly—faster than browser vendors and standards bodies can—on building better abstractions and APIs on top of the standardized primitives.

  Turning back to parallelism, just such a low-level API has been in the air for a while. A couple years ago, Filip Pizlo and Ryosuke Niwa of Apple’s WebKit team discussed the possibility of a variation on ArrayBuffer that could be shared between workers. Around the same time Thibault Imbert floated the same idea on his blog (perhaps inspired by similar functionality in Flash). At last year’s JSConf, Nick Bray of Google’s PNaCl team demo’ed a working prototype of shared buffers in Chrome.

  Now, there’s no question such an API is low-level. Unlike PJS, a SharedArrayBuffer type with built-ins for locking would introduce new forms of blocking to workers, as well as the possibility that some objects could be subject to data races. But unlike Nashorn, this is only true for objects that opt in to using shared memory as a backing store—if you create an object without using a shared buffer, you know for sure that it can never race. And workers do not automatically share memory; they have to coordinate up front to share an array buffer. As long as your top level worker code never accepts and uses a shared buffer, you are assured of the same amount of isolation between workers as ever.

  Another sensible restriction, at least at this point, is to limit access to shared buffers to workers. Eventually, sharing buffers with the main thread, ideally in controlled ways, would be a logical extension. Exposing shared buffers to the main thread would increase power and allow us to connect parallel computations directly to Web APIs like <canvas>. At the same time, the main thread has implementation challenges and could carry risks for the JS programming experience. It’s an important area to explore but it needs careful investigation.

  So this approach is more conservative than full threading, and yet it should be more than enough to satisfy a large number of use cases—from number-crunching to graphics processing to video decoding—and with a much smaller implementation cost on engines than more ambitious solutions like PJS or threads. This would significantly move the needle on what JavaScript applications can do with workers, as well as open new opportunities for compiling threaded languages to the Web.

  And crucially, developers would be able to start building higher-level abstractions. As one example, I’ve sketched out API ideas for region-slicing, data-race-free sharing of portions of a single binary buffer, and this could easily be polyfilled with SharedArrayBuffer. Similarly, multi-dimensional parallel array traversals, similar to PJS, could be polyfilled in plain JavaScript, instead of being blocked on standardization. Each of these APIs has pros and cons, including different use cases and performance trade-offs. And the Extensible Web approach lets us experiment with and settle on these and other high-level abstractions faster than trying to standardize them directly.

  Moreover, by providing high-performance primitives, different domain-specific abstractions can determine for themselves how to enforce their guarantees. Consider region-slicing, for example: the design represents regions as objects and shares them with workers via message-passing. For some cases, the hits of creating wrapper objects and passing messages would be negligible; others—say, a column-major multidimensional array—might require allocating and communicating so many region slices as to dominate any parallelism gains. Providing the low-level primitives empowers library authors to determine for themselves how to achieve their desired guarantees and what use cases to enable.

  Next Steps
  We’ve begun experimenting with a SharedArrayBuffer API in SpiderMonkey. Lars Hansen is drafting a spec of the API we’re experimenting with, and we’ve provided a prototype implementation in Firefox Nightly builds. Our hope is that this will allow people to play with the API and give us feedback.

  While there seems to be a good amount of interest in this direction, it will require more discussion with Web developers and browser implementers alike. With this post we’re hoping to encourage a wider conversation. We’ll be reaching out to solicit more discussion in standards forums, and we’d love to hear from anyone who’s interested in this space.

  CATEGORIES: Uncategorized
  No responses yet
  Post a comment

  Post Your Comment
  Name (required)

  E-mail (required, will not be published)

  Spam robots, please fill in this field. Humans should leave it blank.

  Your comment

  Submit Comment
  About
  Dave Herman
  Dave Herman is a Principal Researcher and Director of Strategy at Mozilla Research.

  More from Dave



  Recent Posts

  ECMAScript 2016+ in Firefox
  Interesting reads in January
  IonMonkey: Evil on your behalf
  The state of SIMD.js performance in Firefox
  The Path to Parallel JavaScript
  Recent Comments

  Benjamin Bouvier on The state of SIMD.js performance in Firefox
  Edward Kmett on The state of SIMD.js performance in Firefox
  Hannes Verschore on ECMAScript 2016+ in Firefox
  mathieu on ECMAScript 2016+ in Firefox
  Adam on ECMAScript 2016+ in Firefox
  Archives

  February 2017
  January 2017
  July 2016
  March 2015
  February 2015
  July 2014
  January 2014
  November 2013
  August 2013
  July 2013
  April 2013
  January 2013
  December 2012
  October 2012
  September 2012
  August 2012
  Categories

  announcements
  feature
  technology
  Uncategorized
  Meta

  Log in
  Entries RSS
  Comments RSS
  WordPress.org
  Return to topMozilla Except where otherwise noted, content on this site is licensed under the Creative Commons Attribution Share-Alike License v3.0 or any later version.
  Contact Us
  Privacy Policy
  Legal Notices
  Report Trademark Abuse
  Theme Code`
}
