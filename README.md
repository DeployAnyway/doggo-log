# doggo-log

[![npm version](https://img.shields.io/npm/v/%40deployanyway%2Fdoggo-log)](https://www.npmjs.com/package/@deployanyway/doggo-log)
[![CI](https://github.com/DeployAnyway/doggo-log/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/DeployAnyway/doggo-log/actions/workflows/ci.yml)

A tiny Node.js console logger with JSON output, log levels, and dog emojis. Good logs. Very good logs.

```text
🐶 INFO    Server started
🐾 SUCCESS Tests passed
🦴 WARN    API is getting slow
🚨 ERROR   Database connection failed
```

## Installation

Available on npm. Requires Node 22 or later.
You can also run from source with Node 22 or 24:

```sh
git clone https://github.com/DeployAnyway/doggo-log.git
cd doggo-log
git checkout main
npm ci
node examples/basic.js
```

Install from npm: `npm install @deployanyway/doggo-log`.

## Quick start

```js
import { doglog, createDogLogger } from "@deployanyway/doggo-log";

doglog.info("Server started");
doglog.success("Tests passed");
doglog.warn("API is getting slow");
doglog.error("Database connection failed");

const logger = createDogLogger({
  timestamp: true,
  level: "debug",
  prefix: "app",
});
logger.debug("Listening on port %d", 3000);
```

## CLI example

```sh
node bin/cli.js success "Tests passed" --no-emoji
node bin/cli.js info "Server started" --json --timestamp
```

Run with npx: `npx @deployanyway/doggo-log info "Server started"`.

## API

`doglog` is the default logger. `createDogLogger(options = {})` makes an independent
logger. Both expose `log`, `info`, `success`, `warn`, `error`, and `debug`.
Methods accept the same message arguments as Node's `util.format`, including
format placeholders, objects, and Error instances. Zero arguments log the label
alone. Each method returns its emitted string, or undefined if filtered/quiet.

Default output sends warn/error to stderr and other methods to stdout. Logging
an error does not set an exit code. The library never calls process.exit.
Errors from a custom output function propagate to the caller.

## Options

| Option      | Default        | Behavior                                               |
| ----------- | -------------- | ------------------------------------------------------ |
| `emoji`     | true           | Dog-themed level symbols                               |
| `color`     | false          | ANSI color for text lines; ignored for JSON            |
| `timestamp` | false          | UTC ISO timestamp                                      |
| `json`      | false          | One JSON object per call; emoji/color omitted          |
| `quiet`     | false          | Suppress all output                                    |
| `prefix`    | empty string   | Text prefix or JSON prefix field                       |
| `level`     | info           | Minimum level                                          |
| `write`     | console output | Function `(line, level)` for each emitted line         |
| `clock`     | current Date   | Function returning a valid Date when timestamp enabled |

Levels: debug (10), log/info/success (20), warn (30), error (40). Thresholds
include all levels with equal or higher ranks. At info, debug is suppressed.
At warn, only warn and error appear. JSON always includes `level` and `message`,
with `prefix` and `timestamp` included when enabled/nonempty. Object arguments
are formatted into the message string; they are not separate JSON fields.

Invalid options throw TypeError; unknown levels throw RangeError. Names are case
sensitive. Unknown option keys are ignored. Quiet/filtered calls skip message
formatting, clock calls, and output. No transports, rotation, telemetry, remote
service, or production dependencies are required.

## CLI reference

`doggo-log <method> <message> [options]`

| Flag              | Behavior                          |
| ----------------- | --------------------------------- |
| `--json`          | JSON output                       |
| `--timestamp`     | ISO timestamp                     |
| `--no-emoji`      | Plain labels                      |
| `--color`         | ANSI color                        |
| `--prefix text`   | Prefix                            |
| `--level name`    | Minimum level (CLI default debug) |
| `--quiet`         | Suppress output                   |
| `--help`, `-h`    | Usage                             |
| `--version`, `-v` | Version                           |

Quote messages containing shell punctuation. Use `--` before positional arguments
containing dash-prefixed text. CLI messages are strings, without placeholder
interpolation. Exit 0 means success (including filtered calls and error logging);
exit 2 means invalid arguments. No stdin support in this MVP.

## Development and examples

```sh
npm ci
node examples/basic.js
npm test
npm run lint
npm run format:check
npm pack --dry-run
```

ES modules and Node's test runner. CI runs Node 22/24. Development tooling requires
Node 22.13+ or 24. Styles and behavior are separate for easy contributions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE).

## More from DeployAnyway

**Tools for developers who probably know better.**

- [error-translator](https://github.com/DeployAnyway/error-translator)
- [excuse-js](https://github.com/DeployAnyway/excuse-js)
- [doggo-log](https://github.com/DeployAnyway/doggo-log)
- [ship-it-meter](https://github.com/DeployAnyway/ship-it-meter)
- [bro-say](https://github.com/DeployAnyway/bro-say)
