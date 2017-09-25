<h1 align="center">
  <a href="https://github.com/jzwood/meowvc"><img src="logo.png" alt="" width="100"></a>
  <br>
  mμ
  <br>
  <br>
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/node-%E2%89%A5%20v6.10-orange.svg" alt="node ≥ v6.10"/>
</p>

<h4 align="center">Casual version control</h4>

If you tap on computers regularly it is likely that at one time or another you have lost work.
If this is true then it is possible you are also someone who obsessively saves and makes copies to placate your anxiety about loosing work.

> I would cmd-s all the time: web pages, email, listening to music. I knew I had a problem when my ⌘ key broke.

mμ is a version control system geared towards chilling out the stress endemenic to digital creation.

## version control
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

Another big win of version control is disaster prevention! If you ever loose work or screw up, it's easy to recover with version control. For instance, to save a snapshot of everything in a directory with mu is:

`$ mu save`

No matter what you change within this directory, recovering the previous snapshot is simple:

`$ mu undo .`

For more information on version control check out the <u>[visual guide to version control](https://betterexplained.com/articles/a-visual-guide-to-version-control/)</u>.

## why mµ

Most version control systems are complex and scary, e.g. **git**.
> "Git has 145 commands, but there’s no git undo."
\~ [Peter Lundgren](http://www.peterlundgren.com/blog/on-gits-shortcomings/)

mµ, on the other hand, is simple and approachable. Let's get started!

### get mµ

`$ git clone https://github.com/jzwood/meowvc.git && cd meowvc`<br>
`$ npm install && npm link`

### use mµ
`$ mu <command> [<args>]`

Commands and arguments:

**help:** shows usage

**start:** creates a new mµ repo

**state:** shows the current repo state

**save:** records snapshot of current repo

**which:** shows name of current repo

**saveas <name>:** saves current repo with a new name

**undo \<file|pattern>:** reverts file(s) (by name or pattern) to last save

**get \<name> [version]:** switches to a different named repo

**mash \<name> [version]:** mashes (ie merges) named repo into current repo
