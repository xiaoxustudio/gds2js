import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_PIN, ROOT } from "./lib.mjs";

const OUT = join(ROOT, "packages", "runtime", "src", "runtime", "engine-class-consts.ts");

const CLASSES = ["Node", "Node2D", "Node3D", "Control", "Object", "SceneTree", "RefCounted", "FileAccess", "HashingContext", "Time", "AESContext"];

const HEADER = `/**
 * 引擎类静态常量与枚举值 —— 生成物，别手改，改请重跑生成流程（pnpm regen:engine-consts）。
 *
 *   node tools/engine-class-consts.mjs write
 *
 * 数据是 Godot ${GODOT_PIN} 的 extension_api.json 里各建模类的 constants/enums，
 * 连同祖先链一起摊平到每个类上，取值一律是 int。
 */
`;

function apiPath() {
  for (const p of [
    join(ROOT, "tmp", "compat-api", "extension_api.json"),
    join(ROOT, "tmp", "d6", "extension_api.json"),
    join(ROOT, "tmp", "d6", "api", "extension_api.json"),
  ]) {
    if (!existsSync(p)) continue;
    try {
      const api = JSON.parse(readFileSync(p, "utf8"));
      const h = api.header;
      if (`${h.version_major}.${h.version_minor}.${h.version_patch}` === GODOT_PIN) return api;
    } catch {
    }
  }
  return null;
}

function collect(api, name) {
  const byName = new Map(api.classes.map((c) => [c.name, c]));
  const out = {};
  let cur = byName.get(name);
  while (cur !== undefined) {
    for (const c of cur.constants ?? []) out[c.name] = c.value;
    for (const e of cur.enums ?? []) for (const v of e.values ?? []) out[v.name] = v.value;
    cur = byName.get(cur.inherits);
  }
  return out;
}

export function renderConsts(api) {
  const lines = [];
  for (const name of CLASSES) {
    const consts = collect(api, name);
    const keys = Object.keys(consts).sort();
    const body = keys.map((k) => `      ${JSON.stringify(k)}: ${String(consts[k])},`).join("\n");
    lines.push(`  ${JSON.stringify(name)}: Object.freeze({\n${body}\n  }),`);
  }
  return `${HEADER}export const ENGINE_CLASS_CONSTS: Readonly<Record<string, Readonly<Record<string, number>>>> = Object.freeze({\n${lines.join("\n")}\n});\n\nexport function engineClassConst(cls: string, name: string): number | null {\n  return ENGINE_CLASS_CONSTS[cls]?.[name] ?? null;\n}\n`;
}

if (process.argv[2] === "write") {
  const api = apiPath();
  if (api === null) {
    console.error(`缺 Godot ${GODOT_PIN} 的 extension_api.json（先跑 pnpm regen:compat-api）`);
    process.exit(1);
  }
  writeFileSync(OUT, renderConsts(api), "utf8");
  console.log(`已写 ${OUT.replace(ROOT, ".")}`);
}
