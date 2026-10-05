// 由 tools/ops-check.ts 机械搬迁：region 138-180, 510-511, 512-518, 519-534, 546-584, 810-813, 814-818。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { fast } from "@gds2js/runtime/runtime/fast";
import { ops } from "@gds2js/runtime/runtime/ops";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";
import { F, I, S } from "./support/variants";

describe("runtime/ops · 算术、比较、位运算", () => {
  it("001 +7 · 5/2", async () => {
    eq("001", "5/2", show(ops.div(I(5), I(2))), "2");
    eq("001", "-5/2", show(ops.div(I(-5), I(2))), "-2");
    eq("001", "5/2.0", show(ops.div(I(5), F(2))), "2.5");
    eq("001", "7.0/2", show(ops.div(F(7), I(2))), "3.5");
    eq("001", "-7/2", show(ops.div(I(-7), I(2))), "-3");

    eq("002", "str(1)", show(I(1)), "1");
    eq("002", "str(1.0)", show(F(1)), "1.0");
    eq("002", "str(2.5)", show(F(2.5)), "2.5");
    eq("002", "float赋给int变量(3.9)", fast.intCast(3.9), 3);
    eq("002", "float(7)/2", show(ops.div(F(7), I(2))), "3.5");

    eq("003", "-7%3", show(ops.mod(I(-7), I(3))), "-1");
    eq("003", "7%-3", show(ops.mod(I(7), I(-3))), "1");
    eq("003", "7%3", show(ops.mod(I(7), I(3))), "1");
    shouldThrow("003", "7.5%3（float 取模，Godot 编译期就拒）", () => ops.mod(F(7.5), I(3)));

    eq("004", "2**3**2", show(ops.pow(ops.pow(I(2), I(3)), I(2))), "64");
    eq("004", "2**3", show(ops.pow(I(2), I(3))), "8");
    eq("004", "2.0**0.5", show(ops.pow(F(2), F(0.5))), "1.4142135623731");

    eq("005", "int64max 原样表示", show(I(9223372036854775807n)), "9223372036854775807");
    eq("005", "int64min 原样表示", show(I(-9223372036854775808n)), "-9223372036854775808");
    eq("005", "int64max-1 加 1", show(ops.add(I(9223372036854775806n), I(1))), "9223372036854775807");
    eq("006", "int64max 加 1 回绕成 int64min", show(ops.add(I(9223372036854775807n), I(1))), "-9223372036854775808");
    eq(
      "006",
      "int64min 取负仍回绕成 int64min",
      show(ops.neg(ops.sub(ops.neg(I(9223372036854775807n)), I(1)))),
      "-9223372036854775808",
    );
    eq("016", "1<<62 精确不丢位", show(ops.shl(I(1), I(62))), "4611686018427387904");

    eq("005", "2^53 内存 number", typeof I(1).v, "number");
    eq("005", "超出才留 bigint", typeof I(9223372036854775807n).v, "bigint");
    eq("005", "运算后落回 2^53 内自动降回 number", typeof ops.sub(I(9223372036854775807n), I(9223372036854775806n)).v, "number");

    eq("055", "2^62 < 2^62+1 精确成立", show(ops.lt(I(4611686018427387904n), I(4611686018427387905n))), "true");
    eq("055", "2^62 与 2^62+1 不相等", show(ops.eq(I(4611686018427387904n), I(4611686018427387905n))), "false");
    eq("055", "小 int 与 int64max 比较", show(ops.lt(I(1), I(9223372036854775807n))), "true");

    shouldThrow("005", "裸 iAddC 越过 2^53 仍响亮抛错", () => fast.iAddC(9007199254740991, 1));
  });

  it("009 · [1,2]==[1,2]", async () => {

    eq("009", "[1,2]==[1,2]", show(ops.eq(V.array(GArray.of([I(1), I(2)])), V.array(GArray.of([I(1), I(2)])))), "true");
  });

  it("009 · 嵌套字典深度比较", async () => {
    const d1 = new GDict();
    d1.set(S("a"), V.array(GArray.of([I(1)])));
    const d2 = new GDict();
    d2.set(S("a"), V.array(GArray.of([I(1)])));
    eq("009", "嵌套字典深度比较", show(ops.eq(V.dict(d1), V.dict(d2))), "true");
  });

  it("009 +2 · 1.0==1", async () => {
    eq("009", "1.0==1", show(ops.eq(F(1), I(1))), "true");
    eq("009", "1==1.0", show(ops.eq(I(1), F(1))), "true");

    eq("010", "not not []", ops.truthy(V.array(GArray.of([]))), false);
    eq("010", "not not {}", ops.truthy(V.dict(new GDict())), false);
    eq("010", "not not 0", ops.truthy(I(0)), false);
    eq("010", "not not 0.0", ops.truthy(F(0)), false);
    eq("010", "not not \"\"", ops.truthy(S("")), false);
    eq("010", "not not [0]", ops.truthy(V.array(GArray.of([I(0)]))), true);
    eq("010", "not not \"0\"", ops.truthy(S("0")), true);

    eq("011", "[1]+[2]", show(ops.add(V.array(GArray.of([I(1)])), V.array(GArray.of([I(2)])))), "[1, 2]");
    eq("011", "\"a\"+\"b\"", show(ops.add(S("a"), S("b"))), "ab");
    eq("011", "1+2.5", show(ops.add(I(1), F(2.5))), "3.5");
    shouldThrow("011", "Vector2 相加（未实现，Tier 1 不做）", () => ops.add(F(1), S("x")));
  });

  it("016 · 255&15", async () => {
    eq("016", "255&15", show(ops.band(I(255), I(15))), "15");
    eq("016", "~5", show(ops.bnot(I(5))), "-6");
    eq("016", "8>>1", show(ops.shr(I(8), I(1))), "4");
    eq("016", "6|9", show(ops.bor(I(6), I(9))), "15");
    eq("016", "6^9", show(ops.bxor(I(6), I(9))), "15");
    shouldThrow("016", "负操作数移位（Godot 编译期就拒）", () => ops.shr(I(-1), I(1)));
  });

  it("019 · 2 in [1,2]", async () => {

    eq("019", "2 in [1,2]", show(ops.inOp(I(2), V.array(GArray.of([I(1), I(2)])))), "true");
    eq("019", "\"e\" in \"hello\"", show(ops.inOp(S("e"), S("hello"))), "true");
    eq("019", "9 in [1,2]", show(ops.inOp(I(9), V.array(GArray.of([I(1), I(2)])))), "false");
  });

  it("019 · \\", async () => {
    const d = new GDict();
    d.set(S("k"), I(1));
    eq("019", "\"k\" in {\"k\":1}", show(ops.inOp(S("k"), V.dict(d))), "true");
  });
});
