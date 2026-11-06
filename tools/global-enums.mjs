import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { GODOT_BIN, GODOT_PIN, ROOT, requireGodotPin } from "./lib.mjs";

const OUT = join(ROOT, "packages", "compiler", "src", "semantics", "global-enums.ts");

const HEADER = `/**
 * 全局枚举表 —— 生成物，别手改，改请重跑 pnpm regen:global-enums。
 *
 * 数据来自钉住的裁判引擎导出的 extension_api.json（global_enums），
 * 只收引擎在全局作用域暴露的枚举名与值；它回答 \`Error.OK\` / \`Key.KEY_ESCAPE\`
 * 这类限定名在编译期该折成哪个整数，不代表这些枚举已经被运行时建模。
 */

`;

function headerMatches(api) {
  return `${api.header.version_major}.${api.header.version_minor}.${api.header.version_patch}` === GODOT_PIN;
}

function apiPath() {
  const cached = [join(ROOT, "tmp", "d6", "extension_api.json"), join(ROOT, "tmp", "d6", "api", "extension_api.json")].find((p) => {
    if (!existsSync(p)) return false;
    try {
      return headerMatches(JSON.parse(readFileSync(p, "utf8")));
    } catch {
      return false;
    }
  });
  if (cached !== undefined) return cached;
  const dir = join(ROOT, "tmp", "global-enums-api");
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "extension_api.json");
  const r = spawnSync(GODOT_BIN, ["--headless", "--dump-extension-api"], { cwd: dir, encoding: "utf8", timeout: 120_000 });
  if (!existsSync(out) || !headerMatches(JSON.parse(readFileSync(out, "utf8")))) {
    process.stderr.write(`无法从 ${GODOT_BIN} 导出 extension_api.json\n${r.stdout ?? ""}${r.stderr ?? ""}`);
    process.exit(1);
  }
  return out;
}

export function renderGlobalEnums(api) {
  const rows = [];
  for (const e of api.global_enums ?? []) {
    const members = (e.values ?? []).map((v) => `    ${JSON.stringify(v.name)}: ${String(Number(v.value))},`);
    rows.push(`  ${JSON.stringify(e.name)}: Object.freeze({`);
    rows.push(...members);
    rows.push("  }),");
  }
  return `${HEADER}export const GLOBAL_ENUM_VALUES: Readonly<Record<string, Readonly<Record<string, number>>>> = Object.freeze({\n${rows.join("\n")}\n});\n\nconst GLOBAL_ENUM_PREFIXES: ReadonlySet<string> = new Set(Object.keys(GLOBAL_ENUM_VALUES).filter((n) => n.includes(".")).map((n) => n.split(".")[0] as string));\n\nexport function isGlobalEnumName(name: string): boolean {\n  return Object.hasOwn(GLOBAL_ENUM_VALUES, name);\n}\n\nexport function isGlobalEnumPrefix(name: string): boolean {\n  return GLOBAL_ENUM_PREFIXES.has(name);\n}\n\nexport function globalEnumValue(owner: string, member: string): number | null {\n  const table = GLOBAL_ENUM_VALUES[owner];\n  if (table === undefined || !Object.hasOwn(table, member)) return null;\n  return table[member] as number;\n}\n`;
}

if (process.argv[2] === "write") {
  requireGodotPin();
  const path = apiPath();
  const api = JSON.parse(readFileSync(path, "utf8"));
  const text = renderGlobalEnums(api);
  const enums = api.global_enums ?? [];
  const values = enums.reduce((n, e) => n + (e.values?.length ?? 0), 0);
  writeFileSync(OUT, text, "utf8");
  console.log(`已写 ${OUT.replace(ROOT, ".")}：${String(enums.length)} 个枚举 / ${String(values)} 个值（${api.header.version_full_name}）`);
}
