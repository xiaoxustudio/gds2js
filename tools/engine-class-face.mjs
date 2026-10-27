import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_PIN, ROOT } from "./lib.mjs";

const OUT = join(ROOT, "packages", "compiler", "src", "semantics", "engine-faces.ts");
const READING = join(ROOT, "tmp", "engine-class-face-probe", "face.txt");

export function parseFace(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t === "") continue;
    const parts = t.split("|");
    if (parts.length !== 9) continue;
    rows.push({
      cls: parts[0],
      typeofCode: Number(parts[1]),
      label: parts[2],
      member: parts[3],
      isValid: parts[4] === "true",
      args: Number(parts[5]),
      isNull: parts[6] === "true",
      boundArgs: Number(parts[7]),
      classHas: parts[8] === "true",
    });
  }
  return rows;
}

export function renderFace(text) {
  const rows = parseFace(text);
  const header = [
    "/**",
    ` * 引擎类值上的成员面（` + "`GDScriptNativeClass`" + ` 那一层）—— 生成物，别手改，改请重跑生成流程（` + "`pnpm regen:engine-class-face`" + `）。`,
    "*",
    " *   node tools/engine-class-face-probe.mjs",
    " *   node tools/engine-class-face.mjs write",
    "*",
    ` * 数据是 Godot ${GODOT_PIN} 无头进程里对每支类取 \`X.new\` 后读回的实测值（typeof / str() 标签 /`,
    " * `get_method()` / `is_valid()` / `get_argument_count()` / `is_null()` / `bind(1)` 之后的元数 /",
    " * `ClassDB.class_has_method()`）。发射期按这张表把成员名解成静态调用，运行时不背表 —— 原生轨",
    " * 明令不收按名取成员的写法。",
    " *",
    " * 表里没有的类或成员一律不在这一层放行：造实例要对象模型，那是阶段三。",
    " */",
    "",
    "export type EngineClassMember = { member: string; typeofCode: number; label: string; args: number; boundArgs: number };",
    "",
    "export const ENGINE_CLASS_FACES: Readonly<Record<string, readonly EngineClassMember[]>> = Object.freeze({",
  ].join("\n");
  const body = rows.map((r) =>
    `  ${JSON.stringify(r.cls)}: [${JSON.stringify({ member: r.member, typeofCode: r.typeofCode, label: r.label, args: r.args, boundArgs: r.boundArgs })}],`,
  );
  return `${header}\n${body.join("\n")}\n});\n`;
}

const mode = process.argv[2];
if (mode === "render") {
  if (!existsSync(READING)) {
    console.error(`缺读数 ${READING.replace(ROOT, ".")}（先跑 node tools/engine-class-face-probe.mjs）`);
    process.exit(1);
  }
  process.stdout.write(renderFace(readFileSync(READING, "utf8")));
} else if (mode === "write") {
  if (!existsSync(READING)) {
    console.error(`缺读数 ${READING.replace(ROOT, ".")}（先跑 node tools/engine-class-face-probe.mjs）`);
    process.exit(1);
  }
  const text = readFileSync(READING, "utf8");
  const out = renderFace(text);
  writeFileSync(OUT, out, "utf8");
  console.log(`已写 ${OUT.replace(ROOT, ".")}：${String(parseFace(text).length)} 支类`);
}
