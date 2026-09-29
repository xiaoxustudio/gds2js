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
