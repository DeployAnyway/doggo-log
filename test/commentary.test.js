import { URL } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createDogLogger, barkLines } from "../src/index.js";
test("rotation is repeatable and no line repeats before the level pool is exhausted", () => {
  const make = () =>
    createDogLogger({
      bark: true,
      barkMode: "rotate",
      seed: "demo",
      json: true,
      level: "debug",
      write: () => {},
    });
  for (const level of ["debug", "log", "info", "success", "warn", "error"]) {
    const a = make(),
      b = make();
    const lines = Array.from(
      { length: 9 },
      () => JSON.parse(a[level]("same")).commentary,
    );
    assert.equal(new Set(lines.slice(0, 8)).size, 8);
    assert.equal(lines[0], lines[8]);
    assert.deepEqual(
      lines,
      Array.from({ length: 9 }, () => JSON.parse(b[level]("same")).commentary),
    );
  }
  const parent = make();
  parent.child("api", { requestId: "x" }).info("hello");
  assert.equal(
    JSON.parse(parent.info("same")).commentary,
    JSON.parse(make().info("same")).commentary,
  );
  const quiet = createDogLogger({
    bark: true,
    barkMode: "rotate",
    quiet: true,
    write: () => assert.fail(),
  });
  assert.equal(quiet.error("x"), undefined);
  for (const mode of ["unknown", null, 1])
    assert.throws(() => createDogLogger({ barkMode: mode }), RangeError);
  for (const seed of [true, null, NaN, Infinity, {}])
    assert.throws(() => createDogLogger({ seed }), TypeError);
  const copy = barkLines("info");
  copy.pop();
  assert.equal(barkLines("info").length, 8);
  assert.throws(() => barkLines("constructor"), RangeError);
});
test("unseeded rotation and numeric seed are valid; CLI preserves the message", () => {
  const logger = createDogLogger({
    bark: true,
    barkMode: "rotate",
    write: () => {},
  });
  assert.notEqual(logger.info("x"), logger.info("x"));
  assert.ok(
    createDogLogger({
      bark: true,
      barkMode: "rotate",
      seed: 42,
      write: () => {},
    }).info("x"),
  );
  const result = spawnSync(
    process.execPath,
    [
      "bin/cli.js",
      "info",
      "my message",
      "--bark",
      "--bark-mode",
      "rotate",
      "--seed",
      "demo",
      "--json",
    ],
    { cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).message, "my message");
});
test("failed writes do not advance commentary", () => {
  let fail = true;
  const log = createDogLogger({
    bark: true,
    barkMode: "rotate",
    write: () => {
      if (fail) throw new Error("sink failed");
    },
  });
  assert.throws(() => log.info("x"), /sink failed/);
  fail = false;
  assert.match(log.info("x"), /Good to know/);
});
