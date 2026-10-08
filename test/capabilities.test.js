import test from "node:test";
import assert from "node:assert/strict";
import { createDogLogger } from "../src/index.js";
test("child scopes preserve parent config, filtering, and original JSON message", () => {
  const lines = [];
  const parent = createDogLogger({
    prefix: "api",
    bark: true,
    json: true,
    level: "warn",
    write: (line) => lines.push(JSON.parse(line)),
  });
  const child = parent.child("database");
  child.info("filtered");
  assert.equal(lines.length, 0);
  child.error("Migration %s", "failed");
  parent.warn("Retry");
  assert.equal(lines[0].prefix, "api:database");
  assert.equal(lines[0].message, "Migration failed");
  assert.match(lines[0].commentary, /incident report/);
  assert.equal(lines[1].prefix, "api");
  assert.throws(() => parent.child("  "), TypeError);
  assert.throws(() => createDogLogger({ bark: 1 }), TypeError);
});
test("barks are opt in and quiet child loggers stay quiet", () => {
  const writes = [];
  createDogLogger({ write: (line) => writes.push(line) }).success("done");
  assert.doesNotMatch(writes[0], /Treat/);
  createDogLogger({
    quiet: true,
    bark: true,
    write: (line) => writes.push(line),
  })
    .child("job")
    .error("bad");
  assert.equal(writes.length, 1);
});
