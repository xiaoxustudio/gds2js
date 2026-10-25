import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const compilerSrc = join(ROOT, "packages", "compiler", "src");
const ir = readFileSync(join(compilerSrc, "lower", "ir.ts"), "utf8");

const filesIn = (dir: string): Array<{ name: string; text: string }> =>
  readdirSync(join(compilerSrc, dir))
    .filter((n) => n.endsWith(".ts"))
    .map((n) => ({ name: n, text: readFileSync(join(compilerSrc, dir, n), "utf8") }));

describe("阶段边界门（parse → lower → analyze → emit 只经显式契约）", () => {
  it("① emit 的每个模块只依赖 analyze 的契约", () => {
    let hits = 0;
    for (const { name, text } of filesIn("emit")) {
      text.split("\n").forEach((line, i) => {
        if (/^import .*from "\.\.\/analyze\/(?!analysis-result)/.test(line) || /^import .*from "\.\.\/lower\/analyze/.test(line)) {
          bad(`emit/${name}:${String(i + 1)} 又从 analyze 的实现里取内部函数`);
          hits++;
        }
      });
    }
    if (hits === 0) ok("emit 全模块只引 analyze/analysis-result 契约");
  });

  it("② IR 上没有跨阶段的可选侧信道字段", () => {
    const body = /export interface Module \{([\s\S]*?)\n\}/.exec(ir)?.[1] ?? "";
    const offenders = body.split("\n").filter((l) => /\?\s*:/.test(l));
    if (body === "") bad("解析不出 Module 接口");
    for (const o of offenders) bad(`Module 上有可选可写字段：${o.trim()}`);
    if (body !== "" && offenders.length === 0) ok("Module 全是必填字段，阶段事实不再挂在 IR 上");
  });

  it("③ analyze 不再把状态借模块级可变全局交给 emit", () => {
    let hits = 0;
    for (const { name, text } of filesIn("analyze")) {
      text.split("\n").forEach((line, i) => {
        if (/^let markOwner\b|export function useMarkOwner/.test(line)) {
          bad(`analyze/${name}:${String(i + 1)} 跨阶段全局又回来了`);
          hits++;
        }
      });
    }
    if (hits === 0) ok("无 markOwner 全局、无 useMarkOwner 回写口");
  });

  it("④ 每阶段一目录，且没有单文件吞掉整个阶段", () => {
    const oversize: string[] = [];
    for (const dir of ["analyze", "emit", "lower"]) {
      const list: Array<{ name: string; text: string }> = filesIn(dir);
      if (dir === "lower" && list.length <= 4) continue;
      for (const { name, text } of list) {
        const n = text.split("\n").length;
        if (n > 1500) oversize.push(`${dir}/${name} 有 ${String(n)} 行`);
      }
    }
    for (const o of oversize) bad(o);
    if (oversize.length === 0) ok("analyze / emit 都按维度分了模块，无 >1500 行单文件");
  });

  it("⑤ emit 的每模块状态由 context 统一复位", () => {
    const indexPath = join(compilerSrc, "emit", "index.ts");
    if (!existsSync(indexPath)) {
      bad("emit/index.ts 不在盘面");
      return;
    }
    const text = readFileSync(indexPath, "utf8");
    if (/^\t? *(analysis|ctx) = /m.test(text)) bad("emit/index.ts 直接赋值共享状态，绕过了 beginEmit");
    else if (!/beginEmit\(/.test(text)) bad("emit/index.ts 没经 beginEmit 复位上下文");
    else ok("每次发射经 beginEmit 拿到全新的 EmitContext 与分析结果");
  });
});
