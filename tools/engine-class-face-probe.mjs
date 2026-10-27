import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_BIN, ROOT, requireGodotPin, runGodot } from "./lib.mjs";

const OUT_DIR = join(ROOT, "tmp", "engine-class-face-probe");
const GD = join(OUT_DIR, "face.gd");
const OUT = join(OUT_DIR, "face.txt");
const T = String.fromCharCode(9);

const CLASSES = ["Node", "RefCounted", "Object", "Resource", "FileAccess", "GDScript"];

const lines = ["extends SceneTree", "", "func _initialize():"];
CLASSES.forEach((c, i) => {
  const f = `f${String(i)}`;
  const b = `b${String(i)}`;
  lines.push(`${T}var ${f} = ${c}.new`);
  lines.push(`${T}var ${b} = ${f}.bind(1)`);
  lines.push(`${T}print("${c}|", typeof(${f}), "|", str(${f}), "|", ${f}.get_method(), "|", ${f}.is_valid(), "|", ${f}.get_argument_count(), "|", ${f}.is_null(), "|", ${b}.get_argument_count(), "|", ClassDB.class_has_method("${c}", "new"))`);
});
lines.push(`${T}quit()`, "");

const gd = lines.join("\n");

if (!process.env.GODOT_BIN) {
  console.error(`需要 GODOT_BIN（当前解析到 ${GODOT_BIN}）：指到一个 Godot 4.6.3 可执行文件`);
  process.exit(1);
}

requireGodotPin();

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(GD, gd, "utf8");

const r = runGodot(GD, { timeoutMs: Number(process.env.GDS2JS_GODOT_TIMEOUT_MS || 60_000) });
if (r.timedOut) {
  console.error("引擎类 new 面探头超时");
  process.exit(1);
}
if (r.text.includes("GDS2JS_SPAWN_ERROR")) {
  console.error(`Godot 起不来：${r.text.slice(0, 200)}`);
  process.exit(1);
}
writeFileSync(OUT, r.text, "utf8");
console.log(r.text);
