import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { createDogLogger, doglog } from "@deployanyway/doggo-log";

const methods = ["debug", "log", "info", "success", "warn", "error"];
const cliPath = fileURLToPath(new URL("../bin/cli.js", import.meta.url));
const cliEnv = { ...process.env };
delete cliEnv.NO_COLOR;
const cli = (...args) =>
  spawnSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8",
    env: cliEnv,
  });
const capture = (options = {}) => {
  const lines = [];
  const logger = createDogLogger({
    ...options,
    write: (line, level) => lines.push({ line, level }),
  });
  return { logger, lines };
};
test("public API and each method emit expected labels and return output", () => {
  assert.deepEqual(Object.keys(doglog), [...methods, "child", "withContext"]);
  const { logger, lines } = capture({ emoji: false, level: "debug" });
  for (const method of methods)
    assert.equal(
      logger[method]("hello"),
      `${method.toUpperCase().padEnd(7)} hello`,
    );
  assert.equal(lines.length, 6);
  assert.deepEqual(
    lines.map((item) => item.level),
    methods,
  );
});
test("defaults and all thresholds", () => {
  for (const level of methods) {
    const { logger, lines } = capture({ level });
    for (const method of methods) logger[method]("hello");
    const expected =
      level === "debug"
        ? methods
        : level === "warn"
          ? ["warn", "error"]
          : level === "error"
            ? ["error"]
            : methods.slice(1);
    assert.deepEqual(
      lines.map((item) => item.level),
      expected,
    );
  }
  const { logger } = capture();
  assert.equal(logger.debug("hidden"), undefined);
  assert.equal(logger.info("hello"), "🐶 INFO    hello");
});
test("quiet/filter skip the clock and writer", () => {
  const fail = () => assert.fail("must not be called");
  for (const config of [{ quiet: true }, { level: "error" }]) {
    const logger = createDogLogger({
      ...config,
      timestamp: true,
      clock: fail,
      write: fail,
    });
    assert.equal(logger.info("ignored"), undefined);
  }
});
test("timestamp, prefix and color", () => {
  const { logger } = capture({
    emoji: false,
    color: true,
    timestamp: true,
    prefix: "app",
    clock: () => new Date("2026-01-01T00:00:00Z"),
  });
  assert.equal(
    logger.info("ready"),
    "\u001b[36m2026-01-01T00:00:00.000Z app INFO    ready\u001b[0m",
  );
});
test("JSON omits decoration and escapes multiline messages", () => {
  const { logger } = capture({
    json: true,
    color: true,
    timestamp: true,
    prefix: "app",
    clock: () => new Date("2026-01-01T00:00:00Z"),
  });
  const line = logger.error("one\ntwo");
  assert.equal(line.split("\n").length, 1);
  assert.deepEqual(JSON.parse(line), {
    level: "error",
    message: "one\ntwo",
    prefix: "app",
    timestamp: "2026-01-01T00:00:00.000Z",
  });
  const plain = capture({ json: true }).logger.info("ready");
  assert.deepEqual(JSON.parse(plain), { level: "info", message: "ready" });
});
test("formatting handles placeholders, objects, errors and empty arguments", () => {
  const { logger } = capture({ emoji: false });
  assert.equal(logger.info("port %d", 3000), "INFO    port 3000");
  assert.ok(logger.info({ ready: true }).includes("ready: true"));
  const circular = {};
  circular.self = circular;
  assert.ok(logger.info(circular).includes("Circular"));
  assert.ok(logger.error(new Error("bad")).includes("Error: bad"));
  assert.equal(logger.log(), "LOG    ");
});
test("invalid config and clock result", () => {
  for (const options of [
    null,
    [],
    1,
    { emoji: "yes" },
    { quiet: 0 },
    { json: null },
    { color: undefined },
    { prefix: 1 },
    { write: 1 },
    { clock: false },
  ])
    assert.throws(() => createDogLogger(options), TypeError);
  for (const level of ["unknown", "__proto__", "constructor", 3])
    assert.throws(() => createDogLogger({ level }), RangeError);
  for (const clock of [() => "date", () => new Date("bad")])
    assert.throws(
      () => capture({ timestamp: true, clock }).logger.info("x"),
      TypeError,
    );
});
test("independent loggers and writer errors propagate", () => {
  const a = capture({ prefix: "a" });
  const b = capture({ prefix: "b" });
  a.logger.info("hello");
  assert.equal(b.lines.length, 0);
  assert.ok(b.logger.info("hello").startsWith("b "));
  const error = new Error("sink failed");
  assert.throws(
    () =>
      createDogLogger({
        write: () => {
          throw error;
        },
      }).info("x"),
    (e) => e === error,
  );
});
test("CLI options, stream routing and exit codes", () => {
  assert.ok(cli("--help").stdout.includes("Usage:"));
  assert.equal(cli("--version").stdout.trim(), "1.0.0");
  const info = cli("info", "hello", "--no-emoji", "--prefix", "app");
  assert.equal(info.status, 0);
  assert.equal(info.stdout.trim(), "app INFO    hello");
  assert.equal(info.stderr, "");
  const error = cli("error", "bad", "--json");
  assert.equal(error.status, 0);
  assert.equal(error.stdout, "");
  assert.deepEqual(JSON.parse(error.stderr), {
    level: "error",
    message: "bad",
  });
  assert.ok(cli("debug", "x").stdout.includes("DEBUG"));
  assert.equal(cli("info", "x", "--level", "warn").stdout, "");
  assert.equal(cli("info", "x", "--quiet").stdout, "");
  assert.ok(cli("info", "x", "--color").stdout.includes("\u001b["));
  assert.ok(
    JSON.parse(cli("info", "x", "--json", "--timestamp").stdout).timestamp,
  );
});
test("CLI rejects invalid arguments and prototype methods", () => {
  for (const args of [
    [],
    ["info"],
    ["toString", "x"],
    ["error", " "],
    ["info", "x", "--wat"],
    ["info", "x", "--level", "nope"],
    ["info", "x", "--prefix"],
  ]) {
    const result = cli(...args);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, "");
    assert.ok(result.stderr.includes("--help"));
  }
});
