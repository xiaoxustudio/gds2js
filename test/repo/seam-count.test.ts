import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT } from "../../tools/lib.mjs";

const CN_NUM: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

function nativeSeamsUnder(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) nativeSeamsUnder(p, out);
    else if (entry.name.endsWith(".native.ts")) out.push(p.slice(ROOT.length + 1).split("\\").join("/"));
  }
  return out;
}

const script = readFileSync(join(ROOT, "tools", "cli-native.mjs"), "utf8");
const body = /const SEAMS = \[([\s\S]*?)\n\];/.exec(script)?.[1] ?? "";
const entries: Array<{ from: string; to: string }> = [];
for (const m of body.matchAll(/\["([^"]+)",\s*"([^"]+)"\]/g)) {
  const from = m[1];
  const to = m[2];
  if (from !== undefined && to !== undefined) entries.push({ from, to });
}
const onDisk = ["runtime", "compiler", "gds2js"].flatMap((pkg) => nativeSeamsUnder(join(ROOT, "packages", pkg)));

describe("seam 装配门（*.native.ts 与 cli-native.mjs 的 SEAMS 对齐）", () => {
  it("① 盘面 seam 文件数 = SEAMS 条目数", () => {
    if (entries.length === 0) bad("tools/cli-native.mjs 里解析不出 SEAMS 数组");
    else if (entries.length === onDisk.length) ok(`SEAMS ${String(entries.length)} 条 = 盘面 ${String(onDisk.length)} 份 .native.ts`);
    else bad(`SEAMS 有 ${String(entries.length)} 条，盘面却有 ${String(onDisk.length)} 份 .native.ts`);
  });

  it("② 每份盘面 seam 都已登记，且两侧文件都在盘", () => {
    for (const f of onDisk) {
      if (entries.some((e) => e.from === f)) ok(`已登记：${f}`);
      else bad(`盘面有 ${f}，SEAMS 里没有它 —— 原生构建不会覆盖`);
    }
    for (const e of entries) {
      if (existsSync(join(ROOT, e.from))) ok(`from 在盘：${e.from}`);
      else bad(`SEAMS 的 from 不在盘：${e.from}`);
      if (existsSync(join(ROOT, e.to))) ok(`to 在盘：${e.to}`);
      else bad(`SEAMS 的 to 不在盘：${e.to}`);
    }
  });

  it("③ 脚本 prose 的「N 份」与括号里的名单都跟着 SEAMS 走", () => {
    for (const m of script.matchAll(/([一二三四五六七八九十\d])份(?=(?:\s*)(?:同名文件|seam))/g)) {
      const cn = m[1];
      const whole = m[0];
      if (cn === undefined) continue;
      const n = CN_NUM[cn] ?? Number(cn);
      if (n === entries.length) ok(`prose「${whole}」= ${String(entries.length)}`);
      else bad(`prose 写 ${cn}份（=${String(n)}），SEAMS 实为 ${String(entries.length)} 条：${whole}`);
    }
    const listed = /seam 换成原生实现（([^）]*)）/.exec(script)?.[1] ?? "";
    if (listed === "") bad("找不到 seam 日志行的括号名单，门失去意义");
    else if (listed.includes("SEAMS")) ok("括号名单由 SEAMS 派生，不会漂移");
    else {
      const missing = entries.filter((e) => !listed.includes(e.to.split("/").pop()!.replace(".ts", "")));
      for (const e of missing) bad(`seam 日志括号名单漏了 ${e.to}`);
      if (missing.length === 0) ok(`括号名单覆盖全部 ${String(entries.length)} 条 seam`);
    }
  });
});
