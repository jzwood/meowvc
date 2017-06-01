var ed = require('edit-distance');

// Define cost functions.
var insert, remove, update;
insert = remove = function(node) { return 1; };
update = function(stringA, stringB) { return stringA !== stringB ? 1 : 0; };

// Define two strings.
var stringA = "abcdef";
var stringB = "abdfgh";

// Compute edit distance, mapping, and alignment.
var lev = ed.levenshtein(stringA, stringB, insert, remove, update);
console.log('Levenshtein', lev.distance, lev.pairs(), lev.alignment());
