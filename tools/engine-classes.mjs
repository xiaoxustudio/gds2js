import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const CLASSES = join(ROOT, "tmp", "engine-classes-probe", "classes.txt");
const OUT = join(ROOT, "packages", "runtime", "src", "runtime", "engine-classes.ts");

const HEADER = `/**
 * Godot 引擎类名清单 —— 生成物，别手改，改请重跑生成流程（pnpm regen:engine-classes）。
 *
 *   node tools/engine-classes-probe.mjs
 *   node tools/engine-classes.mjs write
 *
 * 数据是 Godot 4.6.3 无头进程里 \`ClassDB.get_class_list()\` 的全量返回，升序存放。
 * 这张表只回答「这个类名在引擎的 ClassDB 里存不存在」（\`type_exists()\` 与解析期的类名判定），
 * 不代表这些类有可建的实例或有建模的属性面 —— 那些仍按 D4 在遇到时响亮抛错。
 */

`;

export function parseClassList(text) {
  const seen = new Set();
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (/^[A-Z][A-Za-z0-9_]*$/.test(t)) seen.add(t);
  }
  return [...seen].sort();
}

export function renderEngineClasses(text) {
  const rows = parseClassList(text).map((n) => `  "${n}",`);
  return `${HEADER}export const ENGINE_CLASS_NAMES: ReadonlySet<string> = new Set([\n${rows.join("\n")}\n]);\n`;
}

export function committedNames(text) {
  return new Set([...text.matchAll(/^  "([^"]+)",$/gm)].map((m) => m[1]));
}

if (process.argv[2] === "write") {
  if (!existsSync(CLASSES)) {
    console.error(`缺探头读数 ${CLASSES.replace(ROOT, ".")}（先跑 node tools/engine-classes-probe.mjs）`);
    process.exit(1);
  }
  const measured = parseClassList(readFileSync(CLASSES, "utf8"));
  const after = renderEngineClasses(readFileSync(CLASSES, "utf8"));
  const before = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  const old = committedNames(before);
  const now = new Set(measured);
  const onlyMeasured = measured.filter((n) => !old.has(n));
  const onlyCommitted = [...old].filter((n) => !now.has(n));
  writeFileSync(OUT, after, "utf8");
  const bodySame = before.slice(before.indexOf("export const")) === after.slice(after.indexOf("export const"));
  console.log(`已写 ${OUT.replace(ROOT, ".")}：实测 ${String(measured.length)} 个，入库 ${String(old.size)} 个`);
  if (onlyMeasured.length > 0) console.log(`实测新增 ${String(onlyMeasured.length)}：${onlyMeasured.slice(0, 40).join(", ")}${onlyMeasured.length > 40 ? " …" : ""}`);
  if (onlyCommitted.length > 0) console.log(`实测不再报出 ${String(onlyCommitted.length)}：${onlyCommitted.slice(0, 40).join(", ")}${onlyCommitted.length > 40 ? " …" : ""}`);
  if (bodySame) console.log("表体与旧文件逐字节相同（差异只在生成器头部）");
  else if (onlyMeasured.length === 0 && onlyCommitted.length === 0) console.log("集合相同但表体格式不同：看 diff");
}
