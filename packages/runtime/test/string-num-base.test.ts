/**
 * `String.num_int64` / `num_uint64` 的 `base` 与 `capitalize_hex`：读数抄自语料 336 的 golden（那 117 格逐字节钉着同一支实现）。
 * 越界那一支引擎给空串并另 push 一条内部 `ERROR:`（带 `at: … ustring.cpp:1502` 与 GDScript 栈，逐字节复刻不了，所以那几格不进语料），我们只复刻**返回值**。
 */
import { describe, expect, it } from "vitest";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { stringStatic } from "@gds2js/runtime/runtime/values";

const run = (name: string, args: Variant[]): string => {
  const r = stringStatic(name, args);
  return r.t === Tag.STRING ? (r.v as string) : `非字符串：${r.t}`;
};

const i = (n: bigint | number | string): Variant => V.int(BigInt(n));

const CELLS: Array<[string, string, Variant[], string]> = [
  ["num_int64 单参仍是十进制", "num_int64", [i(255)], "255"],
  ["num_int64(255, 2)", "num_int64", [i(255), i(2)], "11111111"],
  ["num_int64(255, 8)", "num_int64", [i(255), i(8)], "377"],
  ["num_int64(255, 36)", "num_int64", [i(255), i(36)], "73"],
  ["num_int64(255, 16)", "num_int64", [i(255), i(16)], "ff"],
  ["num_int64(255, 16, true)", "num_int64", [i(255), i(16), V.bool(true)], "FF"],
  ["num_int64(0, 16)", "num_int64", [i(0), i(16)], "0"],
  ["num_int64(-255, 16)", "num_int64", [i(-255), i(16)], "-ff"],
  ["num_int64(int64 最小, 16)", "num_int64", [i("-9223372036854775808"), i(16)], "-8000000000000000"],
  ["num_int64(-(1<<62), 16)", "num_int64", [i("-4611686018427387904"), i(16)], "-4000000000000000"],
  ["num_int64(2^53+1, 16)", "num_int64", [i("9007199254740993"), i(16)], "20000000000001"],
  ["num_uint64(-1)", "num_uint64", [i(-1)], "18446744073709551615"],
  ["num_uint64(-1, 16)", "num_uint64", [i(-1), i(16)], "ffffffffffffffff"],
  ["num_uint64(-1, 16, true)", "num_uint64", [i(-1), i(16), V.bool(true)], "FFFFFFFFFFFFFFFF"],
  ["num_uint64(-1, 2)", "num_uint64", [i(-1), i(2)], "1".repeat(64)],
  ["num_uint64(1<<63 那一档)", "num_uint64", [i("-9223372036854775808"), i(16)], "8000000000000000"],
];

describe("String.num_int64 / num_uint64 的进制支", () => {
  it.each(CELLS)("%s", (who, name, args, engine) => {
    expect(run(name, args), `${who} 与引擎不一致`).toBe(engine);
  });

  it("base 越界给空串（引擎那侧另 push 一条内部错误，不复刻那条通道）", () => {
    for (const b of [0, 1, 37, -16, 100]) {
      expect(run("num_int64", [i(255), i(b)])).toBe("");
      expect(run("num_uint64", [i(255), i(b)])).toBe("");
    }
  });

  it("float 实参向零截断、bool 当 0/1", () => {
    expect(run("num_int64", [V.float(1.7)])).toBe("1");
    expect(run("num_int64", [V.float(255.9), V.float(16.9), V.bool(true)])).toBe("FF");
    expect(run("num_int64", [V.bool(true), i(2), V.bool(false)])).toBe("1");
  });

  it("缺首参响亮拒", () => {
    expect(() => stringStatic("num_int64", [])).toThrowError(/num_int64/);
    expect(() => stringStatic("num_uint64", [])).toThrowError(/num_uint64/);
  });
});
