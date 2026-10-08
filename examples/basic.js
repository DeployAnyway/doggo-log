import { doglog, createDogLogger } from "@deployanyway/doggo-log";

doglog.info("Server started");
doglog.success("Tests passed");
doglog.warn("API is getting slow");
doglog.error("Database connection failed");
createDogLogger({ json: true, prefix: "demo" }).info("Ready");
