# 0.3.0 migration

Node 22.13+ is required. Existing core APIs remain available; TypeScript declarations and CommonJS exports are new. The CLI now lives in src/cli.js behind the same executable path. Input/stdout behavior for new options is documented in README.

Install 0.3.0 with npm. Seeds and exact humorous wording are version-specific. Do not treat jokes or heuristic scores as production evidence.

## 0.3.0 to 0.4.0

48 original commentary lines across six levels; opt-in seeded rotation; independent child sequences, no advancement on filtering or failed writes; barkLines catalog API and CLI controls. Classic commentary remains default.

Existing defaults and entry points remain available. The new commentary rotation is opt-in; classic first-line commentary remains the default.

## 0.4.0 to stable 1.0.0

Intentional v1 changes: credential context keys redact by default, and text logs include nonempty context. Use redact:false only when you deliberately need the prior raw-context output. Existing levels, methods, JSON shape, formatting, child loggers, classic barks and opt-in rotation remain. New Node context subpath supports ESM and CommonJS; the core entry remains browser-adaptable.

See README for exact contracts, bounds and failure behavior.
