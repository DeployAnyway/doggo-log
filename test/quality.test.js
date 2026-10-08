import { URL } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { Readable } from "node:stream";
import { readStdin } from "../src/input.js";
const cli = (args, input = "", extraEnv = {}) => {
  const env = { ...process.env, ...extraEnv };
  if (!Object.hasOwn(extraEnv, "NO_COLOR")) delete env.NO_COLOR;
  return spawnSync(process.execPath, ["bin/cli.js", ...args], {
    cwd: new URL("..", import.meta.url),
    input,
    encoding: "utf8",
    env,
  });
};
test("stdin handles UTF-8 buffers and string chunks, refuses TTY/empty/oversized input", async () => {
  assert.equal(
    await readStdin(Readable.from([Buffer.from("你好"), Buffer.from(" 👋\n")])),
    "你好 👋",
  );
  assert.equal(await readStdin(Readable.from([" hello "])), "hello");
  const tty = Readable.from([]);
  tty.isTTY = true;
  await assert.rejects(readStdin(tty), /Pipe/);
  await assert.rejects(readStdin(Readable.from([" \n"])), /nonempty/);
  await assert.rejects(
    readStdin(Readable.from([Buffer.alloc(262145)])),
    /256 KiB/,
  );
});
import { createDogLogger } from "../src/index.js";
test("structured context is copied, inherited and independently overridden", () => {
  const lines = [];
  const context = { requestId: "abc", retry: 0, ok: true, optional: null };
  const root = createDogLogger({
    json: true,
    context,
    write: (line) => lines.push(JSON.parse(line)),
  });
  context.retry = 999;
  const child = root.child("api", { retry: 1 });
  child.info("hello");
  root.info("parent");
  root.withContext({ user: "test" }).warn("careful");
  assert.equal(lines[0].context.retry, 1);
  assert.equal(lines[0].prefix, "api");
  assert.equal(lines[1].context.retry, 0);
  assert.equal(lines[2].context.user, "test");
  assert.equal(lines[1].context.user, undefined);
  for (const bad of [
    null,
    [],
    "x",
    { nested: {} },
    { bad: Infinity },
    { bad: undefined },
  ])
    assert.throws(() => createDogLogger({ context: bad }), TypeError);
  for (const bad of [null, [], "x"]) {
    assert.throws(() => root.child("api", bad), TypeError);
    assert.throws(() => root.withContext(bad), TypeError);
  }
  assert.throws(() => root.child("api", { nested: {} }), TypeError);
});
test("CLI piped message and context keep stdout/stderr and color policy predictable", () => {
  const r = cli(
    ["info", "--stdin", "--json", "--context", '{"requestId":"abc"}'],
    "hello 👋",
  );
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).context.requestId, "abc");
  assert.equal(JSON.parse(r.stdout).message, "hello 👋");
  assert.ok(cli(["warn", "--stdin"], "warning").stderr.includes("warning"));
  assert.ok(
    cli(["info", "argument", "--stdin"], "pipe").stdout.includes("argument"),
  );
  assert.ok(cli(["info", "x", "--color"]).stdout.includes("\x1b["));
  assert.ok(
    !cli(["info", "x", "--color"], "", { NO_COLOR: "" }).stdout.includes(
      "\x1b[",
    ),
  );
  assert.ok(
    !cli(["info", "x", "--color", "--no-color"]).stdout.includes("\x1b["),
  );
  for (const [args, input] of [
    [["info", "--stdin"], ""],
    [["info", "x", "--context", "[]"], ""],
    [["info", "x", "--context", "oops"], ""],
    [["info", "--stdin"], "x".repeat(262145)],
  ])
    assert.equal(cli(args, input).status, 2);
});
