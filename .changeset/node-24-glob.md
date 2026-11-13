---
"ir-kit": minor
---

File matching and watching use `fs.glob` and `fs.watch` instead of `tinyglobby` and `chokidar`, and the fn-schema Vite plugin uses Vite's own watcher.
