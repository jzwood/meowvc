const colors = require('colors')

module.exports = {
	"assert": {
		"equals": (a, b, msg='') => {
      const test = "a === b"
			if (typeof a !== typeof b) {
				console.log('type inconsistant'.red, a, b)
			}
			if (typeof a === 'string' || typeof a === 'number') {
				if (a === b) {
					console.log(msg + ' passed!'.green)
				} else {
					console.log(msg + ' failed.'.red, a, b)
				}
			}
		}
	}
}
