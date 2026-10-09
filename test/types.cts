import api = require("@deployanyway/doggo-log");
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
api.barkLines("warn");
api.createDogLogger({ bark: true, barkMode: "rotate", seed: 42 });
import request = require("@deployanyway/doggo-log/context");
request
  .createRequestLogger({ redact: false })
  .run({ requestId: "abc" }, () => 1);
