// get a deep object literal value that might not exist

/*
 * USAGE:
 * dig(() => parent.child.grandchild)
 * e.g. parent = {child: { grandchild: 'value' }} // true
 * e.g. parent = {child: 'something else'} // false
 */

module.exports = cb => {
  try {
    return cb()
  } catch (e) {
    return false
  }
}
