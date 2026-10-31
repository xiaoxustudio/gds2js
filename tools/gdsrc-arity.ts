import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ARRAY_METHOD_ARITY, DICT_METHOD_ARITY, NODE_PATH_METHOD_ARITY, STRING_METHOD_ARITY, STRING_NAME_METHOD_ARITY, VALUE_ATTR_UNIVERSE, VALUE_EXIST, VALUE_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";
import { BUILTIN_ARITY, BUILTIN_INSTANCE_MEMBERS, BUILTIN_INSTANCE_PROPS, BUILTIN_MEMBER_TYPES, BUILTIN_METHOD_RETURNS, BUILTIN_NEW_ABSENT_FACES, FACE_CTOR_LITERAL, JOIN_BAD_ARG, UTILITY_ARITY } from "../packages/compiler/src/semantics/builtin-members";
import { CTOR_REFUSED, CUBIC_NAME_ARG_FUNCS, GLOBAL_NUM_ARITH, GLOBAL_TYPED_NAME_ARGS, STATIC_FACE } from "../packages/compiler/src/semantics/faces";
import { FACE_ARG_AS, FACE_ARG_TYPES } from "../packages/compiler/src/semantics/arg-types/face-arg-types";
import { STATIC_ARG_AS, STATIC_ARG_TYPES } from "../packages/compiler/src/semantics/arg-types/static-arg-types";
import { ENGINE_CLASS_FACES } from "../packages/compiler/src/semantics/engine-faces";
import { ARITH_RAW, CMP_RAW, FLOAT_ARITH_RAW } from "../packages/compiler/src/emit/surface";
import {
  ARG_TYPE_FOLLOWS_FIRST,
  DERIVED_ARG_TYPES,
  GLOBAL_ARG_AS,
  GLOBAL_ARG_BOOL_REFUSED,
  GLOBAL_ARG_FOLLOWS_BOOL,
  GLOBAL_ARG_SENTENCE,
  GLOBAL_ARG_SHOULD_BE,
  GLOBAL_ARG_SUPPRESS_OTHER,
  GLOBAL_ARG_TYPES,
  GLOBAL_ARG_VARARG,
} from "../packages/compiler/src/semantics/arg-types/global-arg-types";
import { INSTANCE_ARG_AS, INSTANCE_ARG_TYPES } from "../packages/compiler/src/semantics/arg-types/instance-arg-types";
import { COLOR_NAMED } from "@gds2js/runtime/runtime/class/color/named";
import { ANNOT_SOURCES, FACE_ANNOTATIONS, PACK_APPEND_ARRAY_AS, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES, PACK_SHAPE_NAMES, PACK_TYPE_NAMES, SIGNAL_PARSE_MISSING } from "../packages/compiler/src/semantics/elem-faces";
import {
  OP_PAIRS_CONST_A,
  OP_PAIRS_CONST_B,
  OP_PAIRS_REFUSED_A,
  OP_PAIRS_REFUSED_B,
  OP_PAIRS_REFUSED_CALLABLE,
  OP_PAIRS_REFUSED_DECL,
  OP_PAIRS_REFUSED_DECL_VAL,
  OP_PAIRS_REFUSED_DECL_VAL_REV,
} from "../packages/compiler/src/semantics/op-pairs";
import {
  CALLABLE_PARSE_ARGS,
  CALLABLE_PARSE_ARITY,
  SIGNAL_PARSE_ARITY_MAX,
  VOID_ARRAY_METHODS,
  VOID_BYTES_METHODS,
  VOID_CALLABLE_METHODS,
  VOID_DICT_METHODS,
  VOID_OBJECT_METHODS,
  VOID_SIGNAL_METHODS,
} from "../packages/compiler/src/semantics/void-methods";
import { ROOT } from "./lib.mjs";

const OUT = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "arity_tables.gd");
const OUT_OPS = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "op_tables.gd");

const esc = (x: string): string => x.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const num = (x: number): string => (x === Infinity ? "INF" : x === -Infinity ? "-INF" : String(x));
const pair = (x: [number, number]): string => `[${num(x[0])}, ${num(x[1])}]`;
const triple = (x: [number, number | null, string]): string => `[${num(x[0])}, ${x[1] === null ? "null" : num(x[1])}, "${x[2]}"]`;
const table = (name: string, rec: Record<string, [number, number]>): string[] => [
  `const ${name} = {`,
  ...Object.keys(rec)
    .sort()
    .map((k) => `\t"${k}": ${pair(rec[k]!)},`),
  "}",
  "",
];

export function renderArityTables(): string {
  const lines = [
    "# 由 tools/gdsrc-arity.ts 从 runtime / semantics 的元数表生成 —— 不要手改。",
    "",
    ...table("ARRAY_ARITY", ARRAY_METHOD_ARITY),
    ...table("DICT_ARITY", DICT_METHOD_ARITY),
    ...table("STRING_ARITY", STRING_METHOD_ARITY),
    ...table("STRING_NAME_ARITY", STRING_NAME_METHOD_ARITY),
    ...table("NODE_PATH_ARITY", NODE_PATH_METHOD_ARITY),
    "const VALUE_ARITY = {",
    ...Object.keys(VALUE_METHOD_ARITY)
      .sort()
      .flatMap((face) => {
        const rec = VALUE_METHOD_ARITY[face]!;
        return [`\t"${face}": {`, ...Object.keys(rec).sort().map((m) => `\t\t"${m}": ${pair(rec[m]!)},`), "\t},"];
      }),
    "}",
    "",
    ...table("BUILTIN_ARITY", BUILTIN_ARITY),
    "const UTILITY_ARITY = {",
    ...Object.keys(UTILITY_ARITY)
      .sort()
      .map((k) => `\t"${k}": ${triple(UTILITY_ARITY[k]!)},`),
    "}",
    "",
    "const FACE_CTOR_LITERAL = {",
    ...Object.keys(FACE_CTOR_LITERAL)
      .sort()
      .map((k) => `\t"${k}": "${FACE_CTOR_LITERAL[k]!}",`),
    "}",
    "",
    "const PACK_TYPE_NAMES = {",
    ...[...PACK_TYPE_NAMES].sort().map((k) => `\t"${k}": true,`),
    "}",
    "",
    "const BUILTIN_METHOD_RETURNS = {",
    ...Object.keys(BUILTIN_METHOD_RETURNS)
      .sort()
      .flatMap((face) => [`\t"${face}": {`, ...Object.keys(BUILTIN_METHOD_RETURNS[face]!).sort().map((m) => `\t\t"${m}": "${BUILTIN_METHOD_RETURNS[face]![m]!}",`), "\t},"]),
    "}",
    "",
    "const BUILTIN_MEMBER_TYPES = {",
    ...Object.keys(BUILTIN_MEMBER_TYPES)
      .sort()
      .flatMap((face) => [`\t"${face}": {`, ...Object.keys(BUILTIN_MEMBER_TYPES[face]!).sort().map((m) => `\t\t"${m}": "${BUILTIN_MEMBER_TYPES[face]![m]!}",`), "\t},"]),
    "}",
    "",
    "const BUILTIN_INSTANCE_MEMBERS = {",
    ...Object.keys(BUILTIN_INSTANCE_MEMBERS)
      .sort()
      .flatMap((k) => [`\t"${k}": [`, ...[...BUILTIN_INSTANCE_MEMBERS[k]!].map((m) => `\t\t"${m}",`), "\t],"]),
    "}",
    "",
    "const PACK_IS_AS_NAMES = {",
    ...[...PACK_IS_AS_NAMES].sort().map((k) => `	"${k}": true,`),
    "}",
    "",
    "const ANNOT_SOURCES = {",
    ...[...ANNOT_SOURCES].sort().map((k) => `	"${k}": true,`),
    "}",
    "",
    "const PACK_APPEND_ARRAY_AS = [",
    ...PACK_APPEND_ARRAY_AS.map((k) => `	"${k}",`),
    "]",
    "",
    "const PACK_INT_SLOT_OK = [",
    ...PACK_INT_SLOT_OK.map((k) => `	"${k}",`),
    "]",
    "",
    "const PACK_BOOL_SLOT_OK = [",
    ...PACK_BOOL_SLOT_OK.map((k) => `	"${k}",`),
    "]",
    "",
    "const PACK_ARG_SLOTS = {",
    ...Object.keys(PACK_ARG_SLOTS)
      .sort()
      .map((k) => `	"${k}": {"slot": "${PACK_ARG_SLOTS[k]!.slot}", "ok": [${PACK_ARG_SLOTS[k]!.ok.map((x) => "\"" + x + "\"").join(", ")}]},`),
    "}",
    "",
    "const PACK_ARG_POSITIONS = {",
    ...Object.keys(PACK_ARG_POSITIONS)
      .sort()
      .map((k) => `	"${k}": [${PACK_ARG_POSITIONS[k]!.map((x) => "\"" + x + "\"").join(", ")}],`),
    "}",
    "",
    "const BUILTIN_NEW_ABSENT_FACES = {",
    ...[...BUILTIN_NEW_ABSENT_FACES].sort().map((k) => `\t"${k}": true,`),
    "}",
    "",
    "const STATIC_FACE = {",
    ...Object.keys(STATIC_FACE)
      .sort()
      .flatMap((face) => {
        const def = STATIC_FACE[face]!;
        return [
          `\t"${face}": {`,
          `\t\t"consts": [${def.consts.map((c) => `"${c}"`).join(", ")}],`,
          `\t\t"axis": [${def.axis.map((c) => `"${c}"`).join(", ")}],`,
          "\t\t\"statics\": {",
          ...Object.keys(def.statics)
            .sort()
            .map((m) => `\t\t\t"${m}": ${pair(def.statics[m]!)},`),
          "\t\t},",
          "\t},",
        ];
      }),
    "}",
    "",
    "const COLOR_NAMED = {",
    ...Object.keys(COLOR_NAMED)
      .sort()
      .map((k) => `\t"${k}": ${String(COLOR_NAMED[k]!)},`),
    "}",
    "",
  ];
  return lines.join("\n");
}

const pairsOf = (rec: Readonly<Record<string, ReadonlyArray<string>>>): string[] => [
  ...Object.keys(rec)
    .sort()
    .map((k) => `\t"${k}": [${rec[k]!.map((x) => `"${x}"`).join(", ")}],`),
];

const numListRows = (rec: Readonly<Record<string, ReadonlyArray<number>>>): string[] =>
  Object.keys(rec)
    .sort()
    .map((k) => `	"${k}": [${rec[k]!.map((x) => String(x)).join(", ")}],`);

const argSentenceRows = (rec: Readonly<Record<string, ReadonlyArray<readonly [number, ReadonlyArray<string>, string, ReadonlyArray<string>]>>>): string[] =>
  Object.keys(rec)
    .sort()
    .map((k) => `	"${k}": [${rec[k]!.map((r) => `[${String(r[0])}, [${r[1].map((x) => `"${esc(x)}"`).join(", ")}], "${esc(r[2])}", [${r[3].map((x) => `"${esc(x)}"`).join(", ")}]]`).join(", ")}],`);

const argAsFiveRows = (rec: Readonly<Record<string, ReadonlyArray<readonly [number, ReadonlyArray<string>, string, ReadonlyArray<string>, ReadonlyArray<string>]>>>): string[] =>
  Object.keys(rec)
    .sort()
    .map((k) => `	"${k}": [${rec[k]!.map((r) => `[${String(r[0])}, [${r[1].map((x) => `"${esc(x)}"`).join(", ")}], "${esc(r[2])}", [${r[3].map((x) => `"${esc(x)}"`).join(", ")}], [${r[4].map((x) => `"${esc(x)}"`).join(", ")}]]`).join(", ")}],`);

const argAsRows = (rec: Readonly<Record<string, ReadonlyArray<readonly [number, ReadonlyArray<string>, string, ReadonlyArray<string>]>>>): string[] =>
  Object.keys(rec)
    .sort()
    .map((k) => `	"${k}": [${rec[k]!.map((r) => `[${String(r[0])}, [${r[1].map((x) => `"${esc(x)}"`).join(", ")}], "${esc(r[2])}", [${r[3].map((x) => `"${esc(x)}"`).join(", ")}]]`).join(", ")}],`);

const argTypeRows = (rec: Readonly<Record<string, ReadonlyArray<readonly [number, ReadonlyArray<string>, string]>>>): string[] =>
  Object.keys(rec)
    .sort()
    .map((k) => `	"${k}": [${rec[k]!.map((r) => `[${String(r[0])}, [${r[1].map((x) => `"${esc(x)}"`).join(", ")}], "${esc(r[2])}"]`).join(", ")}],`);

export function renderOpTables(): string {
  const lines = [
    "# 由 tools/gdsrc-arity.ts 从 semantics 的算子与方法表生成 —— 不要手改。",
    "",
    "const OP_CONST_A = {",
    ...pairsOf(OP_PAIRS_CONST_A),
    "}",
    "",
    "const OP_CONST_B = {",
    ...pairsOf(OP_PAIRS_CONST_B),
    "}",
    "",
    "const OP_REFUSED_A = {",
    ...pairsOf(OP_PAIRS_REFUSED_A),
    "}",
    "",
    "const OP_REFUSED_B = {",
    ...pairsOf(OP_PAIRS_REFUSED_B),
    "}",
    "",
    "const OP_REFUSED_CALLABLE = {",
    ...pairsOf(OP_PAIRS_REFUSED_CALLABLE),
    "}",
    "",
    "const OP_REFUSED_DECL = {",
    ...pairsOf(OP_PAIRS_REFUSED_DECL),
    "}",
    "",
    "const OP_REFUSED_DECL_VAL = {",
    ...pairsOf(OP_PAIRS_REFUSED_DECL_VAL),
    "}",
    "",
    "const OP_REFUSED_DECL_VAL_REV = {",
    ...pairsOf(OP_PAIRS_REFUSED_DECL_VAL_REV),
    "}",
    "",
    "const BUILTIN_INSTANCE_PROPS = {",
    ...[...Object.keys(BUILTIN_INSTANCE_PROPS).sort()].flatMap((k) => [`\t"${k}": [${BUILTIN_INSTANCE_PROPS[k]!.map((x) => `"${x}"`).join(", ")}],`]),
    "}",
    "",
    "const JOIN_BAD_ARG = {",
    ...Object.keys(JOIN_BAD_ARG)
      .sort()
      .map((k) => `\t"${k}": "${esc(JOIN_BAD_ARG[k]!)}",`),
    "}",
    "",
    "const SIGNAL_PARSE_MISSING = {",
    ...[...SIGNAL_PARSE_MISSING].sort().map((k) => `\t"${k}": true,`),
    "}",
    "",
    "const SIGNAL_PARSE_ARITY_MAX = {",
    ...Object.keys(SIGNAL_PARSE_ARITY_MAX)
      .sort()
      .map((k) => `\t"${k}": ${String(SIGNAL_PARSE_ARITY_MAX[k]!)},`),
    "}",
    "",
    "const CALLABLE_PARSE_ARITY = {",
    ...Object.keys(CALLABLE_PARSE_ARITY)
      .sort()
      .map((k) => `\t"${k}": ${pair(CALLABLE_PARSE_ARITY[k]!)},`),
    "}",
    "",
    "const CALLABLE_PARSE_ARGS = {",
    ...Object.keys(CALLABLE_PARSE_ARGS)
      .sort()
      .map(
        (k) =>
          `\t"${k}": [${CALLABLE_PARSE_ARGS[k]!.map((r) => `[${String(r[0])}, [${r[1].map((x) => `"${esc(x)}"`).join(", ")}], "${esc(r[2])}"]`).join(", ")}],`,
      ),
    "}",
    "",
    "const CTOR_REFUSED = {",
    ...Object.keys(CTOR_REFUSED)
      .sort()
      .map((k) => `	"${k}": [${CTOR_REFUSED[k]!.map((row) => "[" + row.map((x) => `"${esc(x)}"`).join(", ") + "]").join(", ")}],`),
    "}",
    "",
    "const STATIC_ARG_AS = {",
    ...argAsRows(STATIC_ARG_AS),
    "}",
    "",
    "const STATIC_ARG_TYPES = {",
    ...argTypeRows(STATIC_ARG_TYPES),
    "}",
    "",
    "const FACE_ARG_AS = {",
    ...argAsRows(FACE_ARG_AS),
    "}",
    "",
    "const FACE_ARG_TYPES = {",
    ...argTypeRows(FACE_ARG_TYPES),
    "}",
    "",
    "const INSTANCE_ARG_AS = {",
    ...argAsRows(INSTANCE_ARG_AS),
    "}",
    "",
    "const INSTANCE_ARG_TYPES = {",
    ...argTypeRows(INSTANCE_ARG_TYPES),
    "}",
    "",
    "const ARG_TYPE_FOLLOWS_FIRST = {",
    ...numListRows(ARG_TYPE_FOLLOWS_FIRST),
    "}",
    "",
    "const GLOBAL_ARG_BOOL_REFUSED = {",
    ...numListRows(GLOBAL_ARG_BOOL_REFUSED),
    "}",
    "",
    "const GLOBAL_ARG_VARARG = {",
    ...Object.keys(GLOBAL_ARG_VARARG)
      .sort()
      .map((k) => `	"${k}": [${[...GLOBAL_ARG_VARARG[k]!].sort().map((x) => `"${esc(x)}"`).join(", ")}],`),
    "}",
    "",
    "const GLOBAL_ARG_FOLLOWS_BOOL = {",
    ...Object.keys(GLOBAL_ARG_FOLLOWS_BOOL)
      .sort()
      .map((k) => `	"${k}": true,`),
    "}",
    "",
    "const GLOBAL_ARG_SENTENCE = {",
    ...argSentenceRows(GLOBAL_ARG_SENTENCE),
    "}",
    "",
    "const GLOBAL_ARG_AS = {",
    ...argAsFiveRows(GLOBAL_ARG_AS),
    "}",
    "",
    "const GLOBAL_ARG_SHOULD_BE = {",
    ...argSentenceRows(GLOBAL_ARG_SHOULD_BE),
    "}",
    "",
    "const DERIVED_ARG_TYPES = {",
    ...Object.keys(DERIVED_ARG_TYPES)
      .sort()
      .map((k) => `	"${k}": [${DERIVED_ARG_TYPES[k]!.map((r) => `["${esc(r[0])}", ${String(r[1])}, [${r[2].map((x) => `"${esc(x)}"`).join(", ")}]]`).join(", ")}],`),
    "}",
    "",
    "const GLOBAL_ARG_SUPPRESS_OTHER = {",
    ...Object.keys(GLOBAL_ARG_SUPPRESS_OTHER)
      .sort()
      .map((k) => `	"${k}": [${String(GLOBAL_ARG_SUPPRESS_OTHER[k]![0])}, [${GLOBAL_ARG_SUPPRESS_OTHER[k]![1].map((x) => `"${esc(x)}"`).join(", ")}]],`),
    "}",
    "",
    "const GLOBAL_TYPED_NAME_ARGS = {",
    ...Object.keys(GLOBAL_TYPED_NAME_ARGS)
      .sort()
      .map((k) => `	"${k}": [${GLOBAL_TYPED_NAME_ARGS[k]!.map((r) => `[${String(r[0])}, "${esc(r[1])}", [${r[2].map((x) => `"${esc(x)}"`).join(", ")}]]`).join(", ")}],`),
    "}",
    "",
    "const CUBIC_NAME_ARG_FUNCS = {",
    ...[...CUBIC_NAME_ARG_FUNCS].sort().map((k) => `	"${k}": true,`),
    "}",
    "",
    "const GLOBAL_NUM_ARITH = {",
    ...[...GLOBAL_NUM_ARITH].sort().map((k) => `	"${k}": true,`),
    "}",
    "",
    "const FACE_ANNOTATIONS = {",
    ...[...FACE_ANNOTATIONS].sort().map((k) => `	"${k}": true,`),
    "}",
    "",
    "const VALUE_ATTR_UNIVERSE = {",
    ...[...VALUE_ATTR_UNIVERSE].sort().map((k) => `	"${k}": true,`),
    "}",
    "",
    "const VALUE_EXIST = {",
    ...Object.keys(VALUE_EXIST)
      .sort()
      .map((k) => `	"${k}": [${VALUE_EXIST[k]!.map((x) => `"${esc(x)}"`).join(", ")}],`),
    "}",
    "",
    "const ENGINE_CLASS_FACES = {",
    ...Object.keys(ENGINE_CLASS_FACES)
      .sort()
      .flatMap((k) => [`	"${k}": [`, ...ENGINE_CLASS_FACES[k]!.map((r) => `		["${esc(r.member)}", ${String(r.args)}],`), "	],"]),
    "}",
    "",
    "const CMP_RAW = {",
    ...Object.keys(CMP_RAW)
      .sort()
      .map((k) => `	"${esc(k)}": "${esc(CMP_RAW[k]!)}",`),
    "}",
    "",
    "const ARITH_RAW = {",
    ...Object.keys(ARITH_RAW)
      .sort()
      .map((k) => `	"${esc(k)}": "${esc(ARITH_RAW[k]!)}",`),
    "}",
    "",
    "const FLOAT_ARITH_RAW = {",
    ...Object.keys(FLOAT_ARITH_RAW)
      .sort()
      .map((k) => `	"${esc(k)}": "${esc(FLOAT_ARITH_RAW[k]!)}",`),
    "}",
    "",
    "const GLOBAL_ARG_TYPES = {",
    ...Object.keys(GLOBAL_ARG_TYPES)
      .sort()
      .map((k) => `	"${k}": [${GLOBAL_ARG_TYPES[k]!.map((r) => `[${String(r[0])}, "${r[1]}"]`).join(", ")}],`),
    "}",
    "",
    "const PACK_SHAPE_NAMES = {",
    ...[...PACK_SHAPE_NAMES].sort().map((k) => `\t"${k}": true,`),
    "}",
    "",
    ...voidSet("VOID_ARRAY_METHODS", VOID_ARRAY_METHODS),
    ...voidSet("VOID_BYTES_METHODS", VOID_BYTES_METHODS),
    ...voidSet("VOID_CALLABLE_METHODS", VOID_CALLABLE_METHODS),
    ...voidSet("VOID_DICT_METHODS", VOID_DICT_METHODS),
    ...voidSet("VOID_OBJECT_METHODS", VOID_OBJECT_METHODS),
    ...voidSet("VOID_SIGNAL_METHODS", VOID_SIGNAL_METHODS),
  ];
  return lines.join("\n");
}

const voidSet = (name: string, set: ReadonlySet<string>): string[] => [`const ${name} = {`, ...[...set].sort().map((k) => `\t"${k}": true,`), "}", ""];

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const text = renderArityTables();
  writeFileSync(OUT, text, "utf8");
  console.log(`arity_tables.gd 写出：${String(text.split("\n").length)} 行`);
  const ops = renderOpTables();
  writeFileSync(OUT_OPS, ops, "utf8");
  console.log(`op_tables.gd 写出：${String(ops.split("\n").length)} 行`);
}
