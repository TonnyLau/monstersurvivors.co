import { cp, rm } from "node:fs/promises";

const source = "dist";
const target = "_site";

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
