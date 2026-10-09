import type { DogLogger, DogOptions, LogContext } from "./index.js";
export type RequestLogger = DogLogger & {
  run<T, A extends unknown[]>(
    context: LogContext,
    callback: (...args: A) => T,
    ...args: A
  ): T;
  /** Returns a fresh copy of the current raw scope; do not expose it as a public response. */
  getContext(): LogContext;
  dispose(): void;
};
export function createRequestLogger(
  options?: Omit<DogOptions, "contextProvider">,
): RequestLogger;
