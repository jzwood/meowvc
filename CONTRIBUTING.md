# So you want to contribute to mµ?

That’s great! Make a pull request and I’ll review it.

**Todo**:
- asyncify
  i. redo handleConflicts to not use callbacks
- add Ora/log-update to pretty cli interaction

**Possible Features**
- add automerge messages (ie don't fix silently)(?)
- compress (gzip/shoco?) everything that can be compressed
- add tab autocomplete (?)

**Done**:
- add tests for diff
- fix history bugs
- smarter mashing (ie some conflicts can be automerged)
- add flag for dropbox vs local for $ mu start
- add test flags: -p (preserve), -l (local)
- add save msg
- add $ mu history
- add timer (?)
- smarter mashing (ie some conflicts can be automerged)
- completely redo tests with better coverage using AVA - mostly done

**Guidelines**:

1. Make sure all changes conform to ESLint.
1. The heart of mµ is <u>simplicity</u>, let’s keep it that way.

That’s all I got. If I think of something important to add I will.

