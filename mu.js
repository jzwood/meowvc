/*
*	MU.JS ENTRY POINT / MAIN / CONTROLLER / BRAINZ
*/

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const root = require('./src/sys/root')
const cwd = require('./src/sys/cwd')
const discretize = require('./src/core')
const pointerOps = require('./src/pointerOps')


const none = void(0)
const sanitizeInput = str => str.toString().toLowerCase().replace(/-?_?/g, '')

const USAGE = `
Usage:
mu <command> [<args>]

  Commands:	Args:			Descriptions:
  help					- shows usage
  start					- creates a new mu repo
  state					- shows the working repo state

  save					- records snapshot of repo
  saveas	<name>			- saves repo with a new name

  undo		<file|pattern>		- reverts file (or pattern) to last save
  get		<name> [version]	- switches to a different named repo
`

let isRoot
let t1, t2

const setup = () => {
  t1 = +new Date()
}
const cleanup = () => {
  t2 = +new Date()
  console.log((t2 - t1) / 1000 + 's')
}

function mu(args) {

  setup()

  isRoot = fs.existsSync(path.join(cwd, root)) // @todo make this smarter

  for (let i = 0, n = args.length; i < n; i++) {
    const command = {
      start,
      state,
      save,
      saveas,
      undo,
      get
    }[sanitizeInput(args[i])]
    if (typeof command === 'function') {
      if (isRoot || args[i] === 'start') {
        return command(i, args)
      } else {
        chalk.yellow('Warning:', cwd, 'is not a mu repo')
      }
    }
  }
  console.log(chalk.gray(USAGE.trim()))
}

mu(process.argv)

function dest(fpath) {
  return path.join(cwd, root, fpath)
}

function start(i) {
  isRoot ? console.log(chalk.yellow('Warning: repo already setup')) : console.log(chalk.green('setup done'))
  fs.ensureDirSync(dest('history'))
  const po = pointerOps()
  if (!fs.existsSync(dest('_ignore'))) {
    fs.outputFileSync(dest('_ignore'), `node_modules\n^\\.`, 'utf8')
  }
}

function which(i) {
  const po = pointerOps()
  const historyPath = dest(path.join('history', po.head))
  fs.ensureDirSync(historyPath)
  let latest = fs.readdirSync(historyPath).pop() || ''
  latest = latest.match(/^v([0-9])+/)
  latest = latest ? parseInt(latest[1]) : 0
  const output = Object.keys(po.branch).map(key => {
    return (key === po.head) ? chalk.green(key, `(v${Math.max(0, po.branch[key] - 1)}/${latest})`) : key
  }).join(' ')
  console.log(output)
}

function state(i) {
  which()
  discretize(cwd).diff(none, none)
  cleanup()
}

function save(i) {
  const po = pointerOps()
  const onComplete = {
    success(){
      console.log(chalk.green('saved as', po.head, 'v' + po.version))
      cleanup()
    },
    failure(){
      console.log(chalk.yellow('nothing changed'))
      cleanup()
    }
  }
  const success = discretize().save(none, onComplete)
}

function saveas(i, args) {
  const name = args[i + 1]
  if (name) {
    const po = pointerOps()
    const head = po.head
    po.addName(name, exists => {
      if (exists) {
        console.log(chalk.red(`ERROR: Save named "${name}" already exists. Repo not saved.`))
      } else {
        const onComplete = {
          success(destPo){
            console.log(chalk.green(destPo.head, 'v' + destPo.version, 'successfully saved'))
            cleanup()
          },
          failure(){
            console.log(chalk.yellow('nothing changed'))
            cleanup()
          }
        }
        discretize().save(head, onComplete)
        console.log(chalk.green('done'))
      }
    })
  } else {
    console.log(chalk.yellow('saveas expects a name, e.g.'), chalk.inverse('$ mu saveas muffins'))
  }
}

function undo(i, args) {
  let pattern = args[i + 1]
  if (pattern) {
    pattern = new RegExp(pattern.trim())
    discretize().diff(pattern, none)
  } else {
    console.log(chalk.yellow('undo expects a filename or pattern, e.g.'), chalk.inverse('$ mu undo path/to/file.txt'))
  }
  cleanup()
}

function get(i, args) {
  console.log('get', i)
  const head = args[i + 1] || '', v = args[i + 2] || ''
  const errorMsg = chalk.red('get expects the name of an existing save, e.g. ') + chalk.inverse('$ mu get master')
  const po = pointerOps()
  const latestHead = head && po.branch[head]
  const version = /v[0-9]+/.test(v) ? parseInt(v.slice(1)) : latestHead
  if (typeof latestHead !== 'undefined' && fs.readdirSync(dest(path.join('history', head))).includes('v' + version)) {
    discretize().diff(/./, { head, version })
    po.setPointer(head, version)
    po.incrPointer()
    po.writePointer()
    console.log(chalk.green('successfully switched to',head, `v${version}`))
  } else {
    console.log(errorMsg)
  }
}
