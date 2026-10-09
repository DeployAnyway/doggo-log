import test from "node:test";
import assert from "node:assert/strict";
import { setImmediate as tick } from "node:timers/promises";
import { createRequestLogger } from "@deployanyway/doggo-log/context";
import { createDogLogger } from "@deployanyway/doggo-log";

test("concurrent asynchronous requests retain isolated context through children and nested scopes", async () => {
  const lines = [];
  const log = createRequestLogger({
    json: true,
    context: { service: "api" },
    write: (line) => lines.push(JSON.parse(line)),
  });
  const child = log.child("database");
  await Promise.all(
    Array.from({ length: 16 }, (_, id) =>
      log.run({ requestId: String(id) }, async () => {
        await tick();
        child.info("query");
        await log.run({ operation: "save" }, async () => {
          await tick();
          log.info("saved");
        });
        log.info("finished");
      }),
    ),
  );
  assert.equal(lines.length, 48);
  for (let id = 0; id < 16; id++) {
    const scoped = lines.filter(
      (line) => line.context.requestId === String(id),
    );
    assert.equal(scoped.length, 3);
    assert.equal(scoped[0].prefix, "database");
    assert.equal(scoped[1].context.operation, "save");
    assert.equal(scoped[2].context.operation, undefined);
    assert.ok(scoped.every((line) => line.context.service === "api"));
  }
  assert.deepEqual(log.getContext(), {});
  log.info("outside");
  assert.equal(lines.at(-1).context.requestId, undefined);
  log.dispose();
});
test("scopes preserve callback results/errors, copy caller data and restore context", async () => {
  const log = createRequestLogger({ write: () => {} });
  const input = { requestId: "one" };
  const result = log.run(input, () => {
    input.requestId = "changed";
    const copy = log.getContext();
    copy.requestId = "mutated";
    return log.getContext().requestId;
  });
  assert.equal(result, "one");
  const failure = new Error("original");
  assert.throws(
    () =>
      log.run({}, () => {
        throw failure;
      }),
    (error) => error === failure,
  );
  await assert.rejects(
    log.run({}, async () => {
      await tick();
      throw failure;
    }),
    (error) => error === failure,
  );
  assert.equal(
    log.run({}, (a, b) => a + b, 2, 3),
    5,
  );
  for (const value of [null, [], { nested: {} }, { n: Infinity }])
    assert.throws(() => log.run(value, () => {}), TypeError);
  assert.throws(() => log.run({}, null), TypeError);
  assert.throws(() => createRequestLogger(null), TypeError);
  assert.throws(
    () => createRequestLogger({ contextProvider: () => ({}) }),
    TypeError,
  );
  log.dispose();
  assert.throws(() => log.run({}, () => {}), /disposed/);
});
test("redaction runs before writer and return for JSON/text and child scopes", () => {
  const writes = [];
  const input = {
    requestId: "abc",
    API_KEY: "credential",
    password: "hidden",
    normal: "literal-secret",
  };
  const log = createRequestLogger({
    json: true,
    redact: { values: ["literal-secret"] },
    write: (line) => writes.push(line),
  });
  const line = log.run(input, () =>
    log.child("db").warn("Token %s", "literal-secret"),
  );
  assert.equal(line, writes[0]);
  assert.doesNotMatch(line, /credential|hidden|literal-secret/);
  assert.equal(JSON.parse(line).context.API_KEY, "[REDACTED]");
  assert.equal(input.password, "hidden");
  const text = createDogLogger({
    emoji: false,
    context: { token: "secret", requestId: "abc" },
    write: () => {},
  }).info("hello");
  assert.doesNotMatch(text, /secret/);
  assert.match(text, /abc/);
  const raw = createDogLogger({
    json: true,
    redact: false,
    context: { password: "intentional" },
    write: () => {},
  }).info("x");
  assert.match(raw, /intentional/);
  const custom = createDogLogger({
    json: true,
    redact: { keys: ["private"], replacement: "***" },
    context: { private: "hidden", token: "visible" },
    write: () => {},
  }).info("x");
  assert.equal(JSON.parse(custom).context.private, "***");
  assert.match(custom, /visible/);
  log.dispose();
});
test("invalid redaction/provider values fail explicitly and filtering skips providers", () => {
  for (const redact of [
    null,
    true,
    [],
    { keys: "token" },
    { values: [""] },
    { values: [2] },
    { keys: Array(101).fill("x") },
    { replacement: 2 },
  ])
    assert.throws(() => createDogLogger({ redact }), TypeError);
  assert.throws(() => createDogLogger({ contextProvider: 2 }), TypeError);
  const bad = createDogLogger({
    contextProvider: () => ({ x: {} }),
    write: () => {},
  });
  assert.throws(() => bad.info("x"), TypeError);
  const filtered = createDogLogger({
    level: "error",
    contextProvider: () => {
      throw Error("must skip");
    },
  });
  assert.equal(filtered.info("x"), undefined);
});
