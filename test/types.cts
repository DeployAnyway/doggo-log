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
