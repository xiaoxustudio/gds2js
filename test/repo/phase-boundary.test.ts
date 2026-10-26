import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const emitter = readFileSync(join(ROOT, "packages", "compiler", "src", "emit", "emitter.ts"), "utf8");
const ir = readFileSync(join(ROOT, "packages", "compiler", "src", "lower", "ir.ts"), "utf8");
const indexPath = join(ROOT, "packages", "compiler", "src", "analyze", "index.ts");

describe("阶段边界门（parse → lower → analyze → emit 只经显式契约）", () => {
  it("① emitter 只依赖 analyze 的契约，不碰它的实现模块", () => {
    const hits: string[] = [];
    emitter.split("\n").forEach((line, i) => {
      if (/^import .*from "\.\.\/analyze\/(?!analysis-result)/.test(line)) hits.push(`emitter.ts:${String(i + 1)}`);
      if (/^import .*from "\.\.\/lower\/analyze/.test(line)) hits.push(`emitter.ts:${String(i + 1)}`);
    });
    for (const h of hits) bad(`${h} 又从 analyze 的实现里取内部函数`);
    if (hits.length === 0) ok("emitter 只引 analyze/analysis-result 契约");
  });

  it("② IR 上没有跨阶段的可选侧信道字段", () => {
    const body = /export interface Module \{([\s\S]*?)\n\}/.exec(ir)?.[1] ?? "";
    const offenders = body.split("\n").filter((l) => /\?\s*:/.test(l));
    if (body === "") bad("解析不出 Module 接口");
    for (const o of offenders) bad(`Module 上有可选可写字段：${o.trim()}`);
    if (body !== "" && offenders.length === 0) ok("Module 全是必填字段，阶段事实不再挂在 IR 上");
  });

  it("③ analyze 不再把状态借模块级可变全局交给 emit", () => {
    if (!existsSync(indexPath)) {
      bad("packages/compiler/src/analyze/index.ts 不在盘面");
      return;
    }
    const leaks: string[] = [];
    readFileSync(indexPath, "utf8").split("\n").forEach((line, i) => {
      if (/^let markOwner\b|export function useMarkOwner/.test(line)) leaks.push(`index.ts:${String(i + 1)}`);
    });
    for (const l of leaks) bad(`跨阶段全局又回来了：${l}`);
    if (leaks.length === 0) ok("无 markOwner 全局、无 useMarkOwner 回写口");
  });

  it("④ 一阶段一目录，没有 6000 行的单文件", () => {
    const oversize: string[] = [];
    for (const rel of ["analyze/index.ts", "analyze/state.ts", "lower/lower.ts"]) {
      const p = join(ROOT, "packages", "compiler", "src", rel);
      if (!existsSync(p)) continue;
      const n = readFileSync(p, "utf8").split("\n").length;
      if (n > 1500) oversize.push(`${rel} 有 ${String(n)} 行`);
    }
    for (const o of oversize) bad(o);
    if (oversize.length === 0) ok("analyze 过程层已按维度分模块");
  });
});
