import { createServer, get } from "node:http";
import { setImmediate as tick } from "node:timers/promises";
import { createRequestLogger } from "@deployanyway/doggo-log/context";
const log = createRequestLogger({
    json: true,
    context: { service: "demo-api" },
  }),
  db = log.child("database");
let nextId = 0;
const server = createServer((request, response) => {
  void log.run(
    {
      requestId: String(++nextId),
      authorization: request.headers.authorization ?? null,
    },
    async () => {
      try {
        log.info("Request started");
        await tick();
        db.info("Query complete");
        response.end(JSON.stringify({ requestId: log.getContext().requestId }));
      } catch (error) {
        log.error(error.message);
        response.statusCode = 500;
        response.end("Failed");
      }
    },
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
try {
  const request = () =>
    new Promise((resolve, reject) => {
      get(
        {
          hostname: "127.0.0.1",
          port,
          headers: { authorization: "demo-only-secret" },
        },
        (response) => {
          response.resume();
          response.on("end", () =>
            response.statusCode === 200
              ? resolve()
              : reject(new Error("HTTP failed")),
          );
        },
      ).on("error", reject);
    });
  await Promise.all([request(), request()]);
} finally {
  await new Promise((resolve) => server.close(resolve));
  log.dispose();
}
