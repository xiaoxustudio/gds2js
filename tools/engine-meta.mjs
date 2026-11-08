import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_BIN, ROOT, requireGodotPin, runGodot } from "./lib.mjs";

const OUT_DIR = join(ROOT, "tmp", "engine-meta-probe");
const GD = join(OUT_DIR, "meta.gd");
const OUT = join(ROOT, "packages", "runtime", "src", "runtime", "engine-meta.ts");

const gd = `extends SceneTree

func _initialize():
	print("AUTHOR:" + JSON.stringify(Engine.get_author_info()))
	print("DONOR:" + JSON.stringify(Engine.get_donor_info()))
	print("LICENSE:" + JSON.stringify(Engine.get_license_info()))
	print("COPYRIGHT:" + JSON.stringify(Engine.get_copyright_info()))
	print("TEXT:" + JSON.stringify(Engine.get_license_text()))
	print("VERSION:" + JSON.stringify(Engine.get_version_info()))
	print("SINGLETONS:" + JSON.stringify(Engine.get_singleton_list()))
	quit()
`;

if (!process.env.GODOT_BIN) {
  console.error(`需要 GODOT_BIN（当前解析到 ${GODOT_BIN}）`);
  process.exit(1);
}
requireGodotPin();
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(GD, gd, "utf8");
const r = runGodot(GD, { timeoutMs: 60_000 });
if (r.timedOut) {
  console.error("引擎元数据探头超时");
  process.exit(1);
}
const pick = (tag) => {
  const line = r.text.split(/\r?\n/).find((l) => l.startsWith(tag + ":"));
  if (line === undefined) throw new Error(`缺少 ${tag}`);
  return JSON.parse(line.slice(tag.length + 1));
};
const meta = {
  author: pick("AUTHOR"),
  donor: pick("DONOR"),
  license: pick("LICENSE"),
  copyright: pick("COPYRIGHT"),
  licenseText: pick("TEXT"),
  version: pick("VERSION"),
  singletons: pick("SINGLETONS"),
};
const header = `/**\n * 引擎静态元数据 —— 生成物，别手改，改请重跑 pnpm regen:engine-meta。\n * 数据来自钉住的 Godot 裁判引擎实测。\n */\n`;
writeFileSync(OUT, `${header}export const ENGINE_META = ${JSON.stringify(meta, null, 2)} as const;\n`, "utf8");
console.log(`已写 ${OUT}`);
