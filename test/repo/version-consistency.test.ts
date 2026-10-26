import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const MANIFESTS = [
  "package.json",
  "packages/runtime/package.json",
  "packages/compiler/package.json",
  "packages/gds2js/package.json",
  "packages/testkit/package.json",
];

describe("版本戳一致性门（AGENTS.md 红线 4）", () => {
  it("version.ts 与五份 package.json 一字一致", () => {
    const src = readFileSync(join(ROOT, "packages", "gds2js", "src", "version.ts"), "utf8");
    const m = /VERSION = "([^"]+)"/.exec(src);
    if (m === null) {
      bad("packages/gds2js/src/version.ts 里找不到 VERSION 字面量");
      return;
    }
    const version = m[1];
    let drift = 0;
    for (const p of MANIFESTS) {
      const v = JSON.parse(readFileSync(join(ROOT, p), "utf8")).version as string | undefined;
      if (v === version) ok(`${p} = ${version}`);
      else {
        bad(`${p} 是 ${v ?? "缺 version"}，version.ts 是 ${version}`);
        drift++;
      }
    }
    if (drift === 0) ok(`六处版本戳一致（${version}）`);
  });
});
