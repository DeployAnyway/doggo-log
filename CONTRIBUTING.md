# Contributing

Welcome! Keep doggo-log small, useful, and workplace-safe.

Use Node 22.13+ or 24, create a feature branch, and run `npm ci`.
Log styles live in `src/levels.js`; behavior lives in `src/index.js`.
Use an injected `write` function and `clock` in tests instead of real console or time.

Before opening a PR, run:

```sh
npm run format
npm run lint
npm run format:check
npm test
npm pack --dry-run
```

Describe the behavior change and checks. Discuss larger logging features in an
issue first; this package is intended to stay lightweight.
