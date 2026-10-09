import * as api from "@deployanyway/doggo-log";
api
  .createDogLogger({
    json: true,
    context: { requestId: "abc" },
    write: () => {},
  })
  .withContext({ retry: 1 })
  .info("hello");
// @ts-expect-error invalid literal
api.createDogLogger({ level: "cow" });
import { barkLines } from "@deployanyway/doggo-log";
barkLines("warn");
import { createRequestLogger } from "@deployanyway/doggo-log/context";
const scoped = createRequestLogger({
  json: true,
  redact: { keys: ["password"], values: ["secret"] },
});
const answer: number = scoped.run(
  { requestId: "abc" },
  (value: number) => value + 1,
  1,
);
const work: Promise<void> = scoped.run({}, async () => {
  scoped.child("db").info("done");
});
void answer;
void work;
scoped.getContext();
scoped.dispose();
// @ts-expect-error context must be scalar
scoped.run({ nested: {} }, () => {});
api.createDogLogger({ bark: true, barkMode: "rotate", seed: 42 });
