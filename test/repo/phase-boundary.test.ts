import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const emitter = readFileSync(join(ROOT, "packages", "compiler", "src", "emit", "emitter.ts"), "utf8");
const ir = readFileSync(join(ROOT, "packages", "compiler", "src", "lower", "ir.ts"), "utf8");
const analyze = readFileSync(join(ROOT, "packages", "compiler", "src", "lower", "analyze.ts"), "utf8");

describe("阶段边界门（parse → lower → analyze → emit 只经显式契约）", () => {
  it("① emitter 不引 analyze 的实现", () => {
    const hits: string[] = [];
    emitter.split("\n").forEach((line, i) => {
      if (/^import .*from "\.\.\/lower\/analyze/.test(line)) hits.push(`emitter.ts:${String(i + 1)}`);
    });
    for (const h of hits) bad(`${h} 又直接从 analyze 取内部函数`);
    if (hits.length === 0) ok("emitter 只经 analyze-result 契约");
  });

  it("② IR 上没有跨阶段的可选侧信道字段", () => {
    const body = /export interface Module \{([\s\S]*?)\n\}/.exec(ir)?.[1] ?? "";
    const offenders = body.split("\n").filter((l) => /\?\s*:/.test(l));
    if (body === "") bad("解析不出 Module 接口");
    for (const o of offenders) bad(`Module 上有可选可写字段：${o.trim()}`);
    if (body !== "" && offenders.length === 0) ok("Module 全是必填字段，阶段事实不再挂在 IR 上");
  });

  it("③ analyze 不再把状态借模块级可变全局交给 emit", () => {
    const leaks: string[] = [];
    analyze.split("\n").forEach((line, i) => {
      if (/^let markOwner\b|^export function useMarkOwner\b/.test(line)) leaks.push(`analyze.ts:${String(i + 1)}`);
    });
    for (const l of leaks) bad(`跨阶段全局又回来了：${l}`);
    if (leaks.length === 0) ok("无 markOwner 全局、无 useMarkOwner 回写口");
  });
});
