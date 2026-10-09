import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["src/index.js"],
  outfile: "dist/index.cjs",
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
});
await writeFile("index.d.cts", await readFile("index.d.ts"));
await build({
  entryPoints: ["src/context.js"],
  outfile: "dist/context.cjs",
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
});
await writeFile(
  "context.d.cts",
  (await readFile("context.d.ts", "utf8")).replace(
    "'./index.js'",
    "'./index.cjs'",
  ),
);
