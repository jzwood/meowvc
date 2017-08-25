# mµ

![node ≥ v6.10](https://img.shields.io/badge/node-%E2%89%A5%20v6.10-orange.svg)

Version control for dummies (_by a dummy_)

Everyone who uses a computer to create things should have tools for backing up their work. If you use Dropbox or similar you have only really solved one problem: the need to access your files anytime and any place. Rad, yes, but you have not done anything other than preserve the most recent snapshot of your work. Enter version control.

## Version Control
Version control systems (VCS) are file databases that track file changes over time. VCS replace manual file versioning with software management. This simplification facilitates complex workflows unachievable by hand.
```
# Managed by hand
── final
   ├── finalpaper.docx
   ├── finalpaper1.docx
   ├── finalpaper121.docx
   ├── finalpaper-final.docx
   ├── finalpaper-final_REAL.docx
   └── finalpaper-THISONEISWEAR.docx

# Managed with code
── final
   ├── .mu
   └── finalpaper.docx
```
Thanks to _[willzfarmer](https://github.com/willzfarmer/gitgud)_ for the brilliant "Managed by hand"  example.

The big takeaway from the above example is that version control lets you work with the version of the files you want (e.g. finalpaper.docx) and keeps archived files accessible but out of sight.

For more information on version control check out the <u>[visual guide to version control](https://betterexplained.com/articles/a-visual-guide-to-version-control/)</u>.

## mµ

Most version control systems are complex and scary. mµ, however, is simple and approachable. Let's get started!

### get mµ

`$ git clone https://github.com/jzwood/meowvc.git && cd meowvc`<br>
`$ npm install && npm link`

### use mµ
`$ mu <command> [<args>]`

Commands and arguments:

**help:** shows usage

**start:** creates a new mu repo

**state:** shows the working repo state

**save:** records snapshot of repo

**which:** shows name of current working repo

**saveas <name>:** saves repo with a new name

**undo <file|pattern>:** reverts file (or pattern) to last save

**get <name> [version]:** switches to a different named repo
