import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ARRAY_METHOD_ARITY, DICT_METHOD_ARITY, NODE_PATH_METHOD_ARITY, STRING_METHOD_ARITY, STRING_NAME_METHOD_ARITY, VALUE_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";
import { BUILTIN_ARITY, BUILTIN_INSTANCE_MEMBERS, BUILTIN_MEMBER_TYPES, BUILTIN_METHOD_RETURNS, BUILTIN_NEW_ABSENT_FACES, FACE_CTOR_LITERAL, UTILITY_ARITY } from "../../../packages/compiler/src/semantics/builtin-members";
import { ANNOT_SOURCES, PACK_APPEND_ARRAY_AS, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES } from "../../../packages/compiler/src/semantics/elem-faces";
import { STATIC_FACE } from "../../../packages/compiler/src/semantics/faces";
import { COLOR_NAMED } from "@gds2js/runtime/runtime/class/color/named";
import { ROOT } from "../../support/lib-bridge";
import { renderArityTables, renderOpTables } from "../../../tools/gdsrc-arity";

const OUT = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "arity_tables.gd");
const OUT_OPS = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "op_tables.gd");
const rows = (chunk: string): number => chunk.split("\n").filter((l) => l.startsWith('\t"')).length;
const section = (text: string, name: string, next: string): string => text.split(`const ${name} =`)[1]!.split(`const ${next} =`)[0]!;

describe("bootstrap · 移植树的元数表 = 读数重算", () => {
  it("① arity_tables.gd 逐字节等于生成器重算", () => {
    expect(existsSync(OUT), "缺 arity_tables.gd：先跑 pnpm regen:gdsrc-arity").toBe(true);
    expect(readFileSync(OUT, "utf8")).toBe(renderArityTables());
  });

  it("② 十张表都没有缩水", () => {
    const text = readFileSync(OUT, "utf8");
    expect(rows(section(text, "ARRAY_ARITY", "DICT_ARITY"))).toBe(Object.keys(ARRAY_METHOD_ARITY).length);
    expect(rows(section(text, "DICT_ARITY", "STRING_ARITY"))).toBe(Object.keys(DICT_METHOD_ARITY).length);
    expect(rows(section(text, "STRING_ARITY", "STRING_NAME_ARITY"))).toBe(Object.keys(STRING_METHOD_ARITY).length);
    expect(rows(section(text, "STRING_NAME_ARITY", "NODE_PATH_ARITY"))).toBe(Object.keys(STRING_NAME_METHOD_ARITY).length);
    expect(rows(section(text, "NODE_PATH_ARITY", "VALUE_ARITY"))).toBe(Object.keys(NODE_PATH_METHOD_ARITY).length);
    expect(rows(section(text, "VALUE_ARITY", "BUILTIN_ARITY"))).toBe(Object.keys(VALUE_METHOD_ARITY).length);
    expect(rows(section(text, "BUILTIN_ARITY", "UTILITY_ARITY"))).toBe(Object.keys(BUILTIN_ARITY).length);
    expect(rows(section(text, "UTILITY_ARITY", "FACE_CTOR_LITERAL"))).toBe(Object.keys(UTILITY_ARITY).length);
    expect(rows(section(text, "FACE_CTOR_LITERAL", "PACK_TYPE_NAMES"))).toBe(Object.keys(FACE_CTOR_LITERAL).length);
    expect(rows(section(text, "BUILTIN_METHOD_RETURNS", "BUILTIN_MEMBER_TYPES"))).toBe(Object.keys(BUILTIN_METHOD_RETURNS).length);
    expect(rows(section(text, "BUILTIN_MEMBER_TYPES", "BUILTIN_INSTANCE_MEMBERS"))).toBe(Object.keys(BUILTIN_MEMBER_TYPES).length);
    expect(rows(section(text, "BUILTIN_INSTANCE_MEMBERS", "PACK_IS_AS_NAMES"))).toBe(Object.keys(BUILTIN_INSTANCE_MEMBERS).length);
    expect(rows(section(text, "PACK_IS_AS_NAMES", "ANNOT_SOURCES"))).toBe(PACK_IS_AS_NAMES.size);
    expect(rows(section(text, "ANNOT_SOURCES", "PACK_APPEND_ARRAY_AS"))).toBe(ANNOT_SOURCES.size);
    expect(rows(section(text, "PACK_APPEND_ARRAY_AS", "PACK_INT_SLOT_OK"))).toBe(PACK_APPEND_ARRAY_AS.length);
    expect(rows(section(text, "PACK_INT_SLOT_OK", "PACK_BOOL_SLOT_OK"))).toBe(PACK_INT_SLOT_OK.length);
    expect(rows(section(text, "PACK_BOOL_SLOT_OK", "PACK_ARG_SLOTS"))).toBe(PACK_BOOL_SLOT_OK.length);
    expect(rows(section(text, "PACK_ARG_SLOTS", "PACK_ARG_POSITIONS"))).toBe(Object.keys(PACK_ARG_SLOTS).length);
    expect(rows(section(text, "PACK_ARG_POSITIONS", "BUILTIN_NEW_ABSENT_FACES"))).toBe(Object.keys(PACK_ARG_POSITIONS).length);
    expect(rows(section(text, "BUILTIN_NEW_ABSENT_FACES", "STATIC_FACE"))).toBe(BUILTIN_NEW_ABSENT_FACES.size);
    expect(rows(section(text, "STATIC_FACE", "COLOR_NAMED"))).toBe(Object.keys(STATIC_FACE).length);
    expect(rows(section(text, "COLOR_NAMED", "\n"))).toBe(Object.keys(COLOR_NAMED).length);
  });

  it("③ op_tables.gd 逐字节等于生成器重算", () => {
    expect(existsSync(OUT_OPS), "缺 op_tables.gd：先跑 pnpm regen:gdsrc-arity").toBe(true);
    expect(readFileSync(OUT_OPS, "utf8")).toBe(renderOpTables());
  });
});
