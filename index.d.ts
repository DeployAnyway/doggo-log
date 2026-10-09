export type Level = "debug" | "log" | "info" | "success" | "warn" | "error";
export type LogContext = Record<string, string | number | boolean | null>;
export interface DogOptions {
  /** Defaults to common credential context keys. Literal values also redact formatted messages. */
  redact?: false | { keys?: string[]; values?: string[]; replacement?: string };
  contextProvider?: () => LogContext;
  emoji?: boolean;
  bark?: boolean;
  barkMode?: "classic" | "rotate";
  seed?: string | number;
  color?: boolean;
  timestamp?: boolean;
  json?: boolean;
  quiet?: boolean;
  prefix?: string;
  level?: Level;
  context?: LogContext;
  write?: (line: string, level: Level) => void;
  clock?: () => Date;
}
export type LogMethod = (...args: unknown[]) => string | undefined;
export type DogLogger = Record<Level, LogMethod> & {
  child(prefix: string, context?: LogContext): DogLogger;
  withContext(context: LogContext): DogLogger;
};
export function createDogLogger(options?: DogOptions): DogLogger;
export const doglog: DogLogger;

export function barkLines(level: Level): string[];
