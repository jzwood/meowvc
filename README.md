<p align="center">
  <a href="https://github.com/jzwood/meowvc"><img src="sticker.png" alt="" width="100" height="100"></a>
</p>

<p align="center"><h1 align="center">mμ</h1></p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-%E2%89%A5%20v7.6.0-blue.svg?longCache=false&style=for-the-badge" alt="node ≥ v7.6.0"/>
</p>

<p align="center">
  <h4 align="center">Casual version control</h4>
</p>

If you tap on computers regularly it is likely that at one time or another you have lost work.
If this is true then it is possible you are also someone who obsessively saves and makes copies to placate your anxiety about losing work.

> I would cmd-s all the time: web pages, email, listening to music. I knew I had a problem when my ⌘ key broke. ¬ me

mμ is a version control system geared towards chilling out the stress endemic to digital creation.

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
Thanks to _[TheDataLeek](https://github.com/TheDataLeek/gitgud)_ for the brilliant "Managed by hand"  example.

The big takeaway from the above example is that version control lets you work with the version of the files you want (e.g. finalpaper.docx) and keeps archived files accessible but out of sight.

Another big win of version control is disaster prevention! If you ever loose work or screw up, it’s easy to recover with version control. For instance, to save a snapshot of everything in a directory with mµ is:

`$ mu save "short explanation"`

No matter what you change within this directory, recovering the previous snapshot is simple:

`$ mu undo .`

For more information on version control check out the <u>[visual guide to version control](https://betterexplained.com/articles/a-visual-guide-to-version-control/)</u>.

## why mµ

Most version control systems are complex and scary, e.g. **git**.
> "Git has 145 commands, but there’s no git undo."
\~ [Peter Lundgren](http://www.peterlundgren.com/blog/on-gits-shortcomings/)

mµ, on the other hand, is simple and approachable. Let’s get started!

### get mµ

**from npm**

`$ yarn global add meowvc`

**or from GitHub**

`$ git clone https://github.com/jzwood/meowvc.git && cd meowvc`<br>
`$ yarn && yarn link`

**and you're ready to go!**

`$ mu help`

### use mµ
`$ mu <command> [<args>]`

Commands and arguments:

`help` : shows usage

`start [<name>]` : creates a new mµ repo

`state:` : shows the current repo state

`save <message>` : records snapshot of current repo

`which` : shows name of current repo

`saveas <name>` : saves current repo with a new name

`history [<limit=∞>]` : shows ≤ the limit number of save messages for current repo

`undo <file|pattern>` : reverts file(s) (by name or pattern) to last save

`get <name> [<version>]` : switches to a different named repo

`mash <name> [<version>]` : mashes (ie merges) named repo into current repo

`diff <file|pattern>` : shows the word differences between current and saved version of file

## when to use mµ

For people who already use Git, SVN, Mercurial, or other there still may be reasons to use mu. If you give `mu start` the optional _name_ parameter your mu data will be stored in **Dropbox** if possible. This means that if you want to backup your personal work (_which you do_) without setting up and syncing a repository on **BitBucket** or polluting your **GitHub** you can use mu!

## power users
If you want to resume working on a project from a different computer that is still linked to your Dropbox run `mu start <name_of_repo>`. If you then run `mu state` mu will tell you that all your files have been deleted (_cuz the dir is empty_). Run `mu undo .` and your latest master branch will be restored.
