import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GLOBAL_CALLABLES } from "@gds2js/runtime/runtime/global-names";
import { VALUE_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";
import { CTOR_ARMS } from "@gds2js/compiler/semantics/ctor-arms";
import { NUMERIC_VALUE_CTORS } from "../../../packages/compiler/src/semantics/elem-faces";
import { NODE_SELF_METHODS, NODE_SELF_PROPS } from "../../../packages/compiler/src/semantics/node-face";
import { GLOBAL_CONSTANTS } from "@gds2js/compiler/lower/globals";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";
import { HOST_VALUE_METHODS, VIRTUAL_HOST_NAMES } from "../../../packages/compiler/src/semantics/void-methods";
import { HOST_MEMBERS } from "../../../packages/compiler/src/emit/surface";
import { BUILTIN_TYPE_NAMES } from "../../../packages/compiler/src/semantics/builtin-members";
import { ROOT } from "../../support/lib-bridge";
import { renderGlobals } from "../../../tools/gdsrc-globals";

const OUT = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "globals.gd");

const rows = (chunk: string): number => chunk.split("\n").filter((l) => l.startsWith('\t"')).length;

describe("bootstrap · 移植树的生成表 = 读数重算", () => {
  it("① globals.gd 逐字节等于生成器重算", () => {
    expect(existsSync(OUT), "缺 globals.gd：先跑 pnpm regen:gdsrc-globals").toBe(true);
    expect(readFileSync(OUT, "utf8")).toBe(renderGlobals());
  });

  it("② 十二张表都没有缩水", () => {
    const text = readFileSync(OUT, "utf8");
    const callables = text.split("const CTOR_ARMS = {")[0]!;
    const rest = text.split("const CTOR_ARMS = {")[1]!;
    const ctorArms = rest.split("const GLOBAL_CONSTANTS = {")[0]!;
    const tail = rest.split("const GLOBAL_CONSTANTS = {")[1]!;
    const consts = tail.split("const VALUE_CTOR_NAMES = {")[0]!;
    const ctorNames = tail.split("const VALUE_CTOR_NAMES = {")[1]!.split("const NUMERIC_VALUE_CTORS = {")[0]!;
    const numeric = tail.split("const NUMERIC_VALUE_CTORS = {")[1]!.split("const NODE_SELF_METHODS = {")[0]!;
    const methods = tail.split("const NODE_SELF_METHODS = {")[1]!.split("const NODE_SELF_PROPS = {")[0]!;
    const props = tail.split("const NODE_SELF_PROPS = {")[1]!.split("const ENGINE_CLASS_NAMES = {")[0]!;
    const engine = tail.split("const ENGINE_CLASS_NAMES = {")[1]!.split("const VIRTUAL_HOST_NAMES = {")[0]!;
    const virtualHost = tail.split("const VIRTUAL_HOST_NAMES = {")[1]!.split("const BUILTIN_TYPE_NAMES = {")[0]!;
    const builtin = tail.split("const BUILTIN_TYPE_NAMES = {")[1]!.split("const HOST_VALUE_METHODS = {")[0]!;
    const hostVal = tail.split("const HOST_VALUE_METHODS = {")[1]!.split("const HOST_MEMBERS = {")[0]!;
    const hostMembers = tail.split("const HOST_MEMBERS = {")[1]!.split("static func is_engine_self_base(")[0]!;
    expect(rows(callables)).toBe(Object.keys(GLOBAL_CALLABLES).length);
    expect(rows(ctorArms)).toBe(Object.keys(CTOR_ARMS).length);
    expect(rows(consts)).toBe(Object.keys(GLOBAL_CONSTANTS).length);
    expect(rows(ctorNames)).toBe(Object.keys(VALUE_METHOD_ARITY).length);
    expect(rows(numeric)).toBe(NUMERIC_VALUE_CTORS.size);
    expect(rows(methods)).toBe(NODE_SELF_METHODS.size);
    expect(rows(props)).toBe(NODE_SELF_PROPS.size);
    expect(rows(engine)).toBe(ENGINE_CLASS_NAMES.size);
    expect(rows(virtualHost)).toBe(VIRTUAL_HOST_NAMES.size);
    expect(rows(builtin)).toBe(BUILTIN_TYPE_NAMES.size);
    expect(rows(hostVal)).toBe(HOST_VALUE_METHODS.size);
    expect(rows(hostMembers)).toBe(HOST_MEMBERS.length);
    expect(props.split("\n").filter((l) => l.startsWith('\t\t"')).length).toBe([...NODE_SELF_PROPS.values()].reduce((a, s) => a + s.size, 0));
  });
});
