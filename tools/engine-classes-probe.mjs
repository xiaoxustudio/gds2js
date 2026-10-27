import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_BIN, ROOT, runGodot } from "./lib.mjs";

const OUT_DIR = join(ROOT, "tmp", "engine-classes-probe");
const GD = join(OUT_DIR, "classes.gd");
const OUT = join(OUT_DIR, "classes.txt");
const T = String.fromCharCode(9);

const gd = [
  "extends SceneTree",
  "",
  "func _initialize():",
  `${T}for c in ClassDB.get_class_list():`,
  `${T}${T}print(c)`,
  `${T}quit()`,
  "",
].join("\n");

if (!process.env.GODOT_BIN) {
  console.error(`需要 GODOT_BIN（当前解析到 ${GODOT_BIN}）：指到一个 Godot 4.6.3 可执行文件`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(GD, gd, "utf8");

const t0 = Date.now();
const r = runGodot(GD, { timeoutMs: Number(process.env.GDS2JS_GODOT_TIMEOUT_MS || 60_000) });
if (r.timedOut) {
  console.error("Godot 类清单探头超时");
  process.exit(1);
}
if (r.text.includes("GDS2JS_SPAWN_ERROR")) {
  console.error(`Godot 起不来：${r.text.slice(0, 200)}`);
  process.exit(1);
}
writeFileSync(OUT, r.text, "utf8");

const rows = r.text.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[A-Z][A-Za-z0-9_]*$/.test(l));
console.log(`${String(Date.now() - t0)}ms，ClassDB 报出 ${String(rows.length)} 个类名 → ${OUT.replace(ROOT, ".")}`);
if (rows.length < 500) {
  console.error(`读数可疑（入库表有 1053 个）：原始输出前 300 字：${r.text.slice(0, 300)}`);
  process.exit(1);
}
