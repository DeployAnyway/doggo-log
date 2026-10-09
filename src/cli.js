import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { createDogLogger } from "./index.js";
import { levels } from "./levels.js";

import { readStdin } from "./input.js";

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      json: { type: "boolean" },
      stdin: { type: "boolean" },
      context: { type: "string" },
      "no-color": { type: "boolean" },
      bark: { type: "boolean" },
      "bark-mode": { type: "string" },
      seed: { type: "string" },
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
      "Usage: doggo-log <method> <message> [options]\n\nMethods: log, info, success, warn, error, debug. --stdin reads a bounded message; arguments win. --context accepts JSON scalar fields for JSON logs; --no-color and NO_COLOR disable ANSI.\nOptions:\n  --bark         Add useful dog commentary\n  --bark-mode classic|rotate  Classic line or varied commentary\n  --seed text    Repeatable rotation starting point\n  --json         Emit JSON\n  --timestamp    Include an ISO timestamp\n  --no-emoji     Disable emojis\n  --color        Enable ANSI colors\n  --prefix text  Add a prefix\n  --level name   Minimum level (CLI default: debug)\n  --quiet        Suppress output\n  -h, --help     Show help\n  -v, --version  Show version\n\nExit codes: 0 success; 2 invalid arguments. Logging an error exits 0.",
    );
  } else if (values.version) {
    console.log(
      JSON.parse(
        readFileSync(new URL("../package.json", import.meta.url), "utf8"),
      ).version,
    );
  } else {
    const [method, ...message] = positionals;
    const text = message.length
      ? message.join(" ")
      : values.stdin
        ? await readStdin()
        : "";
    if (!Object.hasOwn(levels, method ?? "") || !text.trim())
      throw new TypeError("Provide a valid method and nonempty message.");
    const logger = createDogLogger({
      emoji: !values["no-emoji"],
      bark: values.bark ?? false,
      barkMode: values["bark-mode"] ?? "classic",
      seed: values.seed,
      color:
        !values["no-color"] &&
        !Object.hasOwn(process.env, "NO_COLOR") &&
        (values.color ?? false),
      context: values.context === undefined ? {} : JSON.parse(values.context),
      timestamp: values.timestamp ?? false,
      json: values.json ?? false,
      quiet: values.quiet ?? false,
      prefix: values.prefix ?? "",
      level: values.level,
    });
    logger[method](text);
  }
} catch (error) {
  console.error(`doggo-log: ${error.message}\nRun with --help for usage.`);
  process.exitCode = 2;
}
