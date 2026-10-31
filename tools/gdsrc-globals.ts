import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { GLOBAL_CALLABLES } from "@gds2js/runtime/runtime/global-names";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";
import { HOST_VALUE_METHODS, VIRTUAL_HOST_NAMES } from "../packages/compiler/src/semantics/void-methods";
import { BUILTIN_TYPE_NAMES } from "../packages/compiler/src/semantics/builtin-members";
import { VALUE_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";
import { CTOR_ARMS } from "@gds2js/compiler/semantics/ctor-arms";
import { NUMERIC_VALUE_CTORS } from "../packages/compiler/src/semantics/elem-faces";
import { NODE_SELF_METHODS, NODE_SELF_PROPS } from "../packages/compiler/src/semantics/node-face";
import { HOST_MEMBERS } from "../packages/compiler/src/emit/surface";
import { GLOBAL_CONSTANTS } from "@gds2js/compiler/lower/globals";
import { ROOT } from "./lib.mjs";

const OUT = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "globals.gd");

export function renderGlobals(): string {
  const names = Object.keys(GLOBAL_CALLABLES).sort();
  const num = (x: number): string => (x === Infinity ? "INF" : x === -Infinity ? "-INF" : String(x));
  const rows = names.map((n) => {
    const b = GLOBAL_CALLABLES[n]!.bounds;
    return b === null ? `\t"${n}": null,` : `\t"${n}": [${num(b[0])}, ${num(b[1])}],`;
  });
  return [
    "# 由 tools/gdsrc-globals.ts 从 runtime 的 GLOBAL_CALLABLES 生成 —— 不要手改。",
    `# 名字 ${String(names.length)} 支、其中无界 ${String(names.filter((n) => GLOBAL_CALLABLES[n]!.bounds === null).length)} 支。`,
    "",
    "const CALLABLES = {",
    ...rows,
    "}",
    "",
    "const CTOR_ARMS = {",
    ...Object.keys(CTOR_ARMS)
      .sort()
      .map((n) => `\t"${n}": [` + CTOR_ARMS[n]!.map((row) => "[" + row.map((x) => `"${x}"`).join(", ") + "]").join(", ") + "],"),
    "}",
    "",
    "const GLOBAL_CONSTANTS = {",
    ...Object.keys(GLOBAL_CONSTANTS)
      .sort()
      .map((n) => `\t"${n}": ["${GLOBAL_CONSTANTS[n]!.kind}", "${GLOBAL_CONSTANTS[n]!.value}"],`),
    "}",
    "",
    "const VALUE_CTOR_NAMES = {",
    ...Object.keys(VALUE_METHOD_ARITY)
      .sort()
      .map((n) => `\t"${n}": true,`),
    "}",
    "",
    "const NUMERIC_VALUE_CTORS = {",
    ...[...NUMERIC_VALUE_CTORS]
      .sort()
      .map((n) => `\t"${n}": true,`),
    "}",
    "",
    "const NODE_SELF_METHODS = {",
    ...[...NODE_SELF_METHODS]
      .sort()
      .map((n) => `\t"${n}": true,`),
    "}",
    "",
    "const NODE_SELF_PROPS = {",
    ...[...NODE_SELF_PROPS.keys()]
      .sort()
      .flatMap((base) => [`\t"${base}": {`, ...[...NODE_SELF_PROPS.get(base)!].sort().map((n) => `\t\t"${n}": true,`), "\t},"]),
    "}",
    "",
    "const ENGINE_CLASS_NAMES = {",
    ...[...ENGINE_CLASS_NAMES].sort().map((n) => `\t"${n}": true,`),
    "}",
    "",
    "const VIRTUAL_HOST_NAMES = {",
    ...[...VIRTUAL_HOST_NAMES].sort().map((n) => `	"${n}": true,`),
    "}",
    "",
    "const BUILTIN_TYPE_NAMES = {",
    ...[...BUILTIN_TYPE_NAMES].sort().map((n) => `	"${n}": true,`),
    "}",
    "",
    "const HOST_VALUE_METHODS = {",
    ...[...HOST_VALUE_METHODS].sort().map((n) => `	"${n}": true,`),
    "}",
    "",
    "const HOST_MEMBERS = {",
    ...HOST_MEMBERS.map((n) => `\t"${n}": true,`),
    "}",
    "",
    "static func is_engine_self_base(name):",
    "	return NODE_SELF_PROPS.has(name)",
    "",
    "static func is_virtual_host(name):",
    "	return VIRTUAL_HOST_NAMES.has(name)",
    "",
    "static func is_builtin_type_name(name):",
    "	return BUILTIN_TYPE_NAMES.has(name)",
    "",
    "static func is_engine_class(name):",
    "\treturn ENGINE_CLASS_NAMES.has(name)",
    "",
    "static func is_global_value(name):",
    "\treturn CALLABLES.has(name)",
    "",
    "static func is_host_member(name):",
    "\treturn HOST_MEMBERS.has(name)",
    "",
    "static func is_global_const(name):",
    "\treturn GLOBAL_CONSTANTS.has(name)",
    "",
  ].join("\n");
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const text = renderGlobals();
  writeFileSync(OUT, text, "utf8");
  console.log(`globals.gd 写出：${String(text.split("\n").length)} 行`);
}
