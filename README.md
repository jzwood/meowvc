# mµ

Version control for dummies (_by a dummy_)

Everyone who uses a computer to create things should have tools for backing up their work. If you use Dropbox or similar you have only really solved one problem: the need to access one's files anytime and any place. You have not, however, done anything other than preserve the most recent snapshot of your work.

Luckily, there is a better way.

## Version Control Systems (VCS)
VCS are file databases that track file changes over time. In many respects, VCS replace the manual versioning that many people do instinctively (_see below_) with an intelligent management system.
```
── final
   ├── finalpaper.docx
   ├── finalpaper1.docx
   ├── finalpaper121.docx
   ├── finalpaper-final.docx
   ├── finalpaper-final_REAL.docx
   └── finalpaper-THISONEISWEAR.docx
```
(Thanks to _[@willzfarmer](https://github.com/willzfarmer/gitgud)_ for the brilliant example above)

Most VCS are complex and if used without care can be dangerous; mµ, however, is the simplest and safest VCS ever.

## install


## usage
```shell
Usage:
mu <command> [<args>]

  Commands:   Args:         Descriptions:
  help                      - shows usage
  start                     - creates a new mu repo
  status                    - shows the working repo state

  save                      - records snapshot of repo
  saveas  <name>            - saves repo with a new name

  undo    <file|pattern>    - reverts file (or pattern) to last save
  get     <name> [version]  - switches to a different named repo
```

For more information on version control checkout (a visual guide to version control)[https://betterexplained.com/articles/a-visual-guide-to-version-control/] from betterexplained.com.

As great as mµ is, anyone serious about version control should use [git](https://git-scm.com/) on pain of death.
