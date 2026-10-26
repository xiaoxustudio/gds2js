import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const engines = (p: string): string => String(JSON.parse(readFileSync(join(ROOT, p), "utf8")).engines?.node ?? "");
const targets: Array<[string, string]> = [
  ["packages/gds2js/tsdown.config.ts", readFileSync(join(ROOT, "packages/gds2js/tsdown.config.ts"), "utf8")],
  ["packages/gds2js/tsdown.product.config.ts", readFileSync(join(ROOT, "packages/gds2js/tsdown.product.config.ts"), "utf8")],
  ["packages/gds2js/tsdown.standalone.config.ts", readFileSync(join(ROOT, "packages/gds2js/tsdown.standalone.config.ts"), "utf8")],
];

const majorOf = (s: string): number | null => {
  const m = /node(\d+)/.exec(s);
  return m === null ? null : Number(m[1]);
};

describe("Node 底线一致性门", () => {
  it("① engines.node 在根与对外包一字一致", () => {
    const root = engines("package.json");
    const cli = engines("packages/gds2js/package.json");
    if (root === "" || cli === "") bad(`engines.node 缺项：根=${root || "缺"}，gds2js=${cli || "缺"}`);
    else if (root === cli) ok(`engines.node = ${root}`);
    else bad(`engines.node 不一致：根 ${root}，gds2js ${cli}`);
  });

  it("② 三份 tsdown 的 target 不许高于对外底线", () => {
    const floor = /(\d+)/.exec(engines("package.json"))?.[1];
    if (floor === undefined) {
      bad("读不出 engines.node 的下限版本号");
      return;
    }
    let bads = 0;
    for (const [file, text] of targets) {
      const t = /target:\s*"(node\d+)"/.exec(text)?.[1];
      if (t === undefined) {
        bad(`${file} 没写 target，落的是打包器默认值`);
        bads++;
        continue;
      }
      const n = majorOf(t);
      if (n !== null && n > Number(floor)) {
        bad(`${file} 的 target ${t} 高于对外底线 node${floor}，产物会在承诺支持的 node 上跑不动`);
        bads++;
      }
    }
    if (bads === 0) ok(`三份 target 都不高于 engines 底线（node${floor}）`);
  });

  it("③ 原生轨的产物底线与 engines 同数", () => {
    const seam = /产物要 node ≥ ([\d.]+)/.exec(readFileSync(join(ROOT, "packages/gds2js/src/exec.native.ts"), "utf8"))?.[1];
    const root = engines("package.json").replace(">=", "");
    if (seam === undefined || seam === "") bad("exec.native.ts 里找不到「产物要 node ≥ …」那句");
    else if (seam === root) ok(`exec.native.ts 与 engines 同为 ${seam}`);
    else bad(`exec.native.ts 说 ≥${seam}，engines 说 ≥${root}`);
  });
});
