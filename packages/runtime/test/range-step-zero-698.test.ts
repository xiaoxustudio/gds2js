// `range()` 的步长为零那一句用的是引擎原文（S698，尺 `tmp/probe723/v.gd` 十五格 + 语料 074）：
// `Error calling GDScript utility function "range()": 步长参数为零！` —— 带实用函数名的包装前缀与全角叹号，
// 且它是量过的唯一一支**作废当前那支函数**的全局函数：`posmod(x,0)` 给非致命那块并回 0、`wrapi(5,0,0)` 静默回 0、
// `snapped(5,0)` 回 5、`fmod(5,0)` 回 nan、`inverse_lerp(2,2,1)` 回 -inf、`remap(1,0,0,0,1)` 回 inf、
// `wrap(-1,0,0)` 回 0、`smoothstep(1,1,0.5)` 回 0.0、`linear_to_db(0)` 回 -inf、`randfn(0,-1)` 照出数、
// `type_convert(1,99)` 回 1、`inst_to_dict(null)` 与 `bytes_to_var(空)` 回 null（后两者另有非致命那块）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { range } from "@gds2js/runtime/runtime/builtins";
import { GodotRuntimeError } from "@gds2js/runtime/runtime/errors";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";

const F = (x: number): Variant => V.float(x);
const I = (x: number): Variant => V.int(x);

function caught(vs: Variant[]): { code: string; message: string; engine: boolean } {
  try {
    range(vs);
    return { code: "没抛", message: "", engine: false };
  } catch (e) {
    const err = e as GodotRuntimeError;
    return { code: String(err.code ?? ""), message: String(err.message), engine: err instanceof GodotRuntimeError };
  }
}

describe("builtins · range() 步长为零那一句用引擎原文（S698）", () => {
  it("int 与 float 的零步长同句，且走的是作废当前那支函数的那一类错", () => {
    const a = caught([I(0), I(1), I(0)]);
    eq("698", "int 零步长的句子", a.message, `Error calling GDScript utility function "range()": 步长参数为零！`);
    eq("698", "int 零步长的类型", `${a.code}|${a.engine}`, "range-step-zero|true");
    eq("698", "float 零步长同句", caught([I(0), I(1), F(0)]).message, a.message);
    eq("698", "截断后为 0 的步长同句", caught([I(0), I(1), F(0.5)]).message, a.message);
  });
});
