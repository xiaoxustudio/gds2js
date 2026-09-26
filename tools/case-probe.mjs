/**
 * 大小写映射探针的第一段：把「JS 认为存在大小写映射」的全部码点写成临时用例，
 * 交给 tools/golden.mjs 用 Godot 跑出真值。
 *
 * 只扫这批码点的理由：Godot 的 to_upper/to_lower 走 Unicode **简单映射**（一个码点只映一个
 * 码点，实测全宇宙 0 个例外）。若某码点在 JS 里上下都等于自己，说明 Unicode 数据里它没有
 * case mapping，Godot 也只可能给回原字符 —— 两边同形，不必测。反过来，JS 有映射的码点才是
 * 「可能与 Godot 不同」的全集（含 JS 会撑开成多码点的那 103 个）。
 *
 * 用法（三步，别漏第二步）：
 *   node tools/case-probe.mjs
 *   node tools/golden.mjs 000-probe-cs        # 真值由 Godot 4.6.3 给，不是凭印象
 *   node tools/case-table.mjs                 # 对账 + 重写 src/runtime/case-table.ts
 * 探针目录 corpus/cases/000-probe-cs-* 是临时产物，生成表后可以直接删掉。
 */
import { mkdirSync, writeFileSync } from "node:fs";

const CHUNK = 700;

const cands = [];
for (let cp = 0; cp <= 0x10ffff; cp++) {
  if (cp >= 0xd800 && cp <= 0xdfff) continue;
  const s = String.fromCodePoint(cp);
  if (s.toUpperCase() === s && s.toLowerCase() === s) continue;
  cands.push(cp);
}

const hex = (n) => "0x" + n.toString(16).toUpperCase().padStart(4, "0");

for (let i = 0, part = 0; i < cands.length; i += CHUNK, part++) {
  const slice = cands.slice(i, i + CHUNK);
  const dir = `corpus/cases/000-probe-cs-${part}`;
  const src = [
    "extends SceneTree",
    "",
    "func _dump_all(cps: Array):",
    "\tfor i in cps:",
    "\t\tvar c = String.chr(i)",
    '\t\tprint("%x|%s|%s" % [i, c.to_upper(), c.to_lower()])',
    "",
    "func _initialize():",
    `\t_dump_all([${slice.map(hex).join(", ")}])`,
    "\tquit()",
    "",
  ].join("\n");
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/main.gd`, src);
}

console.log(`JS 有映射的码点 ${cands.length} 个 → ${Math.ceil(cands.length / CHUNK)} 个探针用例，去跑：node tools/golden.mjs 000-probe-cs`);
