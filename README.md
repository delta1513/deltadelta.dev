## Git hooks

This repo uses a tracked `pre-commit` hook (in `.githooks/`) that runs `npm run build` and blocks the commit if it produces any changes, to keep build artifacts in sync with source. After cloning, enable it with:

```sh
git config core.hooksPath .githooks
```
