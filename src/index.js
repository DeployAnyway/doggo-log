import { format } from "node:util";
import { levels } from "./levels.js";
import { barkLines, commentaryIndex } from "./commentary.js";
export { barkLines };

/**
 * Create a small logger. Methods return the emitted line, or undefined if filtered.
 * @param {{emoji?: boolean, color?: boolean, timestamp?: boolean, json?: boolean, quiet?: boolean, prefix?: string, level?: string, write?: (line: string, level: string) => void, clock?: () => Date}} [options]
 */
export function createDogLogger(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  const config = {
    emoji: true,
    bark: false,
    barkMode: "classic",
    seed: undefined,
    color: false,
    timestamp: false,
    json: false,
    quiet: false,
    prefix: "",
    level: "info",
    context: {},
    write: (line, level) =>
      level === "warn" || level === "error"
        ? console.error(line)
        : console.log(line),
    clock: () => new Date(),
    ...options,
  };
  for (const key of ["emoji", "color", "timestamp", "json", "quiet", "bark"]) {
    if (typeof config[key] !== "boolean")
      throw new TypeError(`${key} must be a boolean.`);
  }
  if (typeof config.prefix !== "string")
    throw new TypeError("prefix must be a string.");
  if (
    !config.context ||
    typeof config.context !== "object" ||
    Array.isArray(config.context)
  )
    throw new TypeError("context must be an object of scalar fields.");
  for (const value of Object.values(config.context))
    if (!(
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))
    ))
      throw new TypeError(
        "Context values must be strings, finite numbers, booleans or null.",
      );
  config.context = { ...config.context };
  if (typeof config.level !== "string" || !Object.hasOwn(levels, config.level))
    throw new RangeError(
      `level must be one of: ${Object.keys(levels).join(", ")}.`,
    );
  if (typeof config.write !== "function" || typeof config.clock !== "function")
    throw new TypeError("write and clock must be functions.");
  if (!["classic", "rotate"].includes(config.barkMode))
    throw new RangeError("barkMode must be classic or rotate.");
  if (
    config.seed !== undefined &&
    typeof config.seed !== "string" &&
    !(typeof config.seed === "number" && Number.isFinite(config.seed))
  )
    throw new TypeError("seed must be a string or finite number.");
  const counters = {};
  const logger = Object.fromEntries(
    Object.entries(levels).map(([level, style]) => [
      level,
      (...args) => {
        if (config.quiet || style.rank < levels[config.level].rank)
          return undefined;
        const message = format(...args);
        const pool = config.bark ? barkLines(level) : undefined;
        const index =
          config.barkMode === "rotate"
            ? (commentaryIndex(
                config.seed,
                config.prefix + ":" + level,
                pool?.length ?? 1,
              ) +
                (counters[level] ?? 0)) %
              (pool?.length ?? 1)
            : 0;
        const commentary = pool?.[index];
        let timestamp;
        if (config.timestamp) {
          const date = config.clock();
          if (!(date instanceof Date) || !Number.isFinite(date.getTime()))
            throw new TypeError("clock must return a valid Date.");
          timestamp = date.toISOString();
        }
        let line;
        if (config.json) {
          line = JSON.stringify({
            level,
            message,
            ...(Object.keys(config.context).length
              ? { context: { ...config.context } }
              : {}),
            ...(commentary ? { commentary } : {}),
            ...(config.prefix ? { prefix: config.prefix } : {}),
            ...(timestamp ? { timestamp } : {}),
          });
        } else {
          line = [
            timestamp,
            config.prefix,
            config.emoji ? style.emoji : undefined,
            level.toUpperCase().padEnd(7),
            message,
            commentary,
          ]
            .filter((part) => part !== undefined && part !== "")
            .join(" ");
          if (config.color) line = `\u001b[${style.color}m${line}\u001b[0m`;
        }
        config.write(line, level);
        if (config.bark)
          counters[level] = ((counters[level] ?? 0) + 1) % pool.length;
        return line;
      },
    ]),
  );
  logger.child = (prefix, context = {}) => {
    if (!context || typeof context !== "object" || Array.isArray(context))
      throw new TypeError("context must be an object.");
    if (typeof prefix !== "string" || !prefix.trim())
      throw new TypeError("Child prefix must be a nonempty string.");
    return createDogLogger({
      ...config,
      context: { ...config.context, ...context },
      prefix: [config.prefix, prefix.trim()].filter(Boolean).join(":"),
    });
  };
  logger.withContext = (context) => {
    if (!context || typeof context !== "object" || Array.isArray(context))
      throw new TypeError("context must be an object.");
    return createDogLogger({
      ...config,
      context: { ...config.context, ...context },
    });
  };
  return logger;
}

/** Default logger: emoji enabled, no timestamp/color, info threshold. */
export const doglog = createDogLogger();
