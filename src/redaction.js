const defaultKeys = [
  "password",
  "passwd",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret",
  "apiKey",
];
const normalize = (key) => key.toLowerCase().replaceAll(/[-_]/g, "");
export function copyContext(context) {
  if (!context || typeof context !== "object" || Array.isArray(context))
    throw new TypeError("context must be an object of scalar fields.");
  for (const value of Object.values(context))
    if (!(
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))
    ))
      throw new TypeError(
        "Context values must be strings, finite numbers, booleans or null.",
      );
  return { ...context };
}
export function createRedactor(options) {
  if (options === false)
    return { text: (value) => value, context: copyContext };
  if (options === undefined) options = {};
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("redact must be false or an options object.");
  const keys = options.keys ?? defaultKeys,
    values = options.values ?? [],
    replacement = options.replacement ?? "[REDACTED]";
  for (const [name, list] of [
    ["keys", keys],
    ["values", values],
  ])
    if (
      !Array.isArray(list) ||
      list.length > 100 ||
      !list.every((value) => typeof value === "string" && value.length > 0)
    )
      throw new TypeError(
        `Redaction ${name} must contain at most 100 nonempty strings.`,
      );
  if (typeof replacement !== "string")
    throw new TypeError("Redaction replacement must be a string.");
  const protectedKeys = new Set(keys.map(normalize));
  // Longest first prevents a short secret from exposing a suffix of a longer one.
  const literals = [...new Set(values)].sort((a, b) => b.length - a.length);
  const text = (value) =>
    literals.reduce(
      (output, secret) => output.split(secret).join(replacement),
      value,
    );
  return {
    text,
    context: (context) =>
      Object.fromEntries(
        Object.entries(copyContext(context)).map(([key, value]) => [
          key,
          protectedKeys.has(normalize(key))
            ? replacement
            : typeof value === "string"
              ? text(value)
              : value,
        ]),
      ),
  };
}
