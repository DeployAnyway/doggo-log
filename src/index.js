import { format } from "node:util";
import { levels } from "./levels.js";

/**
 * Create a small logger. Methods return the emitted line, or undefined if filtered.
 * @param {{emoji?: boolean, color?: boolean, timestamp?: boolean, json?: boolean, quiet?: boolean, prefix?: string, level?: string, write?: (line: string, level: string) => void, clock?: () => Date}} [options]
 */
export function createDogLogger(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  const config = {
    emoji: true,
    color: false,
    timestamp: false,
    json: false,
    quiet: false,
    prefix: "",
    level: "info",
    write: (line, level) =>
      level === "warn" || level === "error"
        ? console.error(line)
        : console.log(line),
    clock: () => new Date(),
    ...options,
  };
  for (const key of ["emoji", "color", "timestamp", "json", "quiet"]) {
    if (typeof config[key] !== "boolean")
      throw new TypeError(`${key} must be a boolean.`);
  }
  if (typeof config.prefix !== "string")
    throw new TypeError("prefix must be a string.");
  if (typeof config.level !== "string" || !Object.hasOwn(levels, config.level))
    throw new RangeError(
      `level must be one of: ${Object.keys(levels).join(", ")}.`,
    );
  if (typeof config.write !== "function" || typeof config.clock !== "function")
    throw new TypeError("write and clock must be functions.");
  return Object.fromEntries(
    Object.entries(levels).map(([level, style]) => [
      level,
      (...args) => {
        if (config.quiet || style.rank < levels[config.level].rank)
          return undefined;
        const message = format(...args);
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
          ]
            .filter((part) => part !== undefined && part !== "")
            .join(" ");
          if (config.color) line = `\u001b[${style.color}m${line}\u001b[0m`;
        }
        config.write(line, level);
        return line;
      },
    ]),
  );
}

/** Default logger: emoji enabled, no timestamp/color, info threshold. */
export const doglog = createDogLogger();
