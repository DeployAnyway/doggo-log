#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { createDogLogger } from "../src/index.js";
import { levels } from "../src/levels.js";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      json: { type: "boolean" },
      bark: { type: "boolean" },
      timestamp: { type: "boolean" },
      quiet: { type: "boolean" },
      color: { type: "boolean" },
      "no-emoji": { type: "boolean" },
      prefix: { type: "string" },
      level: { type: "string", default: "debug" },
    },
  });
  if (values.help) {
    console.log(
      "Usage: doggo-log <method> <message> [options]\n\nMethods: log, info, success, warn, error, debug\nOptions:\n  --bark         Add useful dog commentary\n  --json         Emit JSON\n  --timestamp    Include an ISO timestamp\n  --no-emoji     Disable emojis\n  --color        Enable ANSI colors\n  --prefix text  Add a prefix\n  --level name   Minimum level (CLI default: debug)\n  --quiet        Suppress output\n  -h, --help     Show help\n  -v, --version  Show version\n\nExit codes: 0 success; 2 invalid arguments. Logging an error exits 0.",
    );
  } else if (values.version) {
    console.log(
      JSON.parse(
        readFileSync(new URL("../package.json", import.meta.url), "utf8"),
      ).version,
    );
  } else {
    const [method, ...message] = positionals;
    if (!Object.hasOwn(levels, method ?? "") || !message.join(" ").trim())
      throw new TypeError("Provide a valid method and nonempty message.");
    const logger = createDogLogger({
      emoji: !values["no-emoji"],
      bark: values.bark ?? false,
      color: values.color ?? false,
      timestamp: values.timestamp ?? false,
      json: values.json ?? false,
      quiet: values.quiet ?? false,
      prefix: values.prefix ?? "",
      level: values.level,
    });
    logger[method](message.join(" "));
  }
} catch (error) {
  console.error(`doggo-log: ${error.message}\nRun with --help for usage.`);
  process.exitCode = 2;
}
