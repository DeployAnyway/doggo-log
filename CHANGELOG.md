# Changelog

## 0.3.0 — unreleased candidate

- Useful structured API/CLI additions described in README.
- TypeScript declarations, CommonJS entry, coverage gates and installed archive checks.
- Linux Node 22/24 plus Windows/macOS Node 24 CI.

## 0.2.0 — 2026-10-08

- Scoped logs, optional barks: Use `logger.child("database")` to create an independent logger with a nested prefix. Enable `{ bark: true }` or CLI `--bark` for dog commentary. JSON preserves the original message and adds a separate `commentary` field. Filtering still suppresses output.
- Add npm and CI badges to the published README.

## 0.1.1 — 2026-10-08

- Correct npm installation and npx documentation after the initial publication.
- Add a searchable, humorous package description and relevant npm keywords.
- No API, CLI behavior, or dependency changes.

## 0.1.0 — 2026-10-08

- Six logging methods, level filtering, quiet mode, and custom prefixes.
- Optional emojis, ANSI colors, timestamps, and JSON output.
- CLI, tests, documentation, and Node 22/24 CI.
