# 1.0.0 — Fetch the Context: async request scopes and redaction

Node.js logs with async request context, JSON, levels and configurable redaction. Good logs. Very good logs. Fewer lost request IDs.

Intentional v1 changes: credential context keys redact by default, and text logs include nonempty context. Use redact:false only when you deliberately need the prior raw-context output. Existing levels, methods, JSON shape, formatting, child loggers, classic barks and opt-in rotation remain. New Node context subpath supports ESM and CommonJS; the core entry remains browser-adaptable.

Install: `npm install @deployanyway/doggo-log@1.0.0`

See README for runnable API/CLI examples, supported formats, defaults and limitations. Existing catalogs remain. Core APIs require no online services. Root demo: https://deployanyway.github.io/.

Validation is recorded in the v1 release report after final CI and installed-package verification.
