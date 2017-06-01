const colors = require('colors')

module.exports = {
	"assert": {
		"equals": (a, b) => {
      const test = "a === b"
			if (typeof a !== typeof b) {
				console.log('type inconsistant'.red, a, b)
			}
			if (typeof a === 'string' || typeof a === 'number') {
				if (a === b) {
					console.log('test ' + test + ' status: passed!'.green)
				} else {
					console.log('test ' + test + ' status: failed.'.red, a, b)
				}
			}
		}
	}
}
