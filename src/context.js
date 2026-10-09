import { AsyncLocalStorage } from "node:async_hooks";
import { createDogLogger } from "./index.js";
import { copyContext } from "./redaction.js";

/** A Node logger with isolated async request scopes. Dispose only after work completes. */
export function createRequestLogger(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  if (Object.hasOwn(options, "contextProvider"))
    throw new TypeError("createRequestLogger owns its context provider.");
  const storage = new AsyncLocalStorage();
  let disposed = false;
  const logger = createDogLogger({
    ...options,
    contextProvider: () => storage.getStore() ?? {},
  });
  logger.run = (context, callback, ...args) => {
    if (disposed) throw new Error("Request logger has been disposed.");
    if (typeof callback !== "function")
      throw new TypeError("Request callback must be a function.");
    const scope = Object.freeze({
      ...storage.getStore(),
      ...copyContext(context),
    });
    return storage.run(scope, callback, ...args);
  };
  logger.getContext = () => ({ ...storage.getStore() });
  logger.dispose = () => {
    storage.disable();
    disposed = true;
  };
  return logger;
}
