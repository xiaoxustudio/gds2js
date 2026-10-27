import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_BIN, ROOT, requireGodotPin, runGodot } from "./lib.mjs";

const OUT_DIR = join(ROOT, "tmp", "ucaps-probe");
const GD = join(OUT_DIR, "sweep.gd");
const OUT = join(OUT_DIR, "sweep.txt");
const T = String.fromCharCode(9);

const gd = [
  "extends SceneTree",
  "",
  "func _initialize():",
  `${T}for cp in range(0x40, 0x110000):`,
  `${T}${T}if cp >= 0xD800 and cp <= 0xDFFF:`,
  `${T}${T}${T}continue`,
  `${T}${T}var c = String.chr(cp)`,
  `${T}${T}var u = c.to_upper()`,
  `${T}${T}var l = c.to_lower()`,
  `${T}${T}if u != c or l != c:`,
  `${T}${T}${T}print("%x|%s|%s" % [cp, u, l])`,
  `${T}quit()`,
  "",
].join("\n");

if (!process.env.GODOT_BIN) {
  console.error(`需要 GODOT_BIN（当前解析到 ${GODOT_BIN}）：指到一个 Godot 4.6.3 可执行文件`);
  process.exit(1);
}
requireGodotPin();
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(GD, gd, "utf8");

const t0 = Date.now();
const r = runGodot(GD, { timeoutMs: Number(process.env.GDS2JS_UCAPS_TIMEOUT_MS || 900_000) });
if (r.timedOut) {
  console.error("Godot 全码点扫描超时（用 GDS2JS_UCAPS_TIMEOUT_MS 放大）");
  process.exit(1);
}
if (r.text.includes("GDS2JS_SPAWN_ERROR")) {
  console.error(`Godot 起不来：${r.text.slice(0, 200)}`);
  process.exit(1);
}
writeFileSync(OUT, r.text, "utf8");

const rows = r.text.split(/\r?\n/).filter((l) => /^[0-9a-f]+\|/.test(l));
console.log(`${String(Date.now() - t0)}ms，扫出 ${String(rows.length)} 个码点有映射差异 → ${OUT.replace(ROOT, ".")}`);
if (rows.length < 1000) {
  console.error(`读数可疑（入库表有 1477 对）：原始输出前 300 字：${r.text.slice(0, 300)}`);
  process.exit(1);
}
