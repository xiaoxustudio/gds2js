// 由 tools/ops-check.ts 机械搬迁：region 2881-3033。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { index, method, writeIdx, writeProp } from "@gds2js/runtime/runtime/methods";
import { isLess, ops } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, stampArray, valueEq } from "@gds2js/runtime/runtime/values";
import { GVector2, vector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector3, vector3 } from "@gds2js/runtime/runtime/vector3";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { vector2i } from "@gds2js/runtime/runtime/vector2i";
import { asVec3i, GVector3i, toVec3, toVec3i, vector3i, vector3iConst, vector3iMethod, vector3iNew } from "@gds2js/runtime/runtime/vector3i";
import { toVec2i } from "@gds2js/runtime/runtime/vector2i";
import { I } from "./support/variants";

describe("runtime/vector3i", () => {
  it("step85 · ===== Vector3i（int32 值类型）与值类型槽的换算矩阵 ====…", async () => {
    // ===== Vector3i（int32 值类型）与值类型槽的换算矩阵 =====
    const Z3 = (x: number | bigint, y: number | bigint, z: number | bigint) => vector3i(x, y, z);
    const z3 = (v: Variant) => show(v);
    const z3m = (v: Variant, name: string, ...args: Variant[]) => vector3iMethod(asVec3i(v) as GVector3i, name, args);
    const A3 = Z3(3, -4, 12);
    const B3 = Z3(1, 2, 3);
    /** 断言抛出的正是期望那句错误文本。 */
    const perr = (caseId: string, what: string, fn: () => unknown, expected: string): void => {
      let got = "(没有抛错)";
      try {
        fn();
      } catch (e) {
        got = (e as Error).message;
      }
      eq(caseId, what, got, expected);
    };

    eq("step85", "构造：0 参零向量、float 实参逐分量向零截断、超 int32 回绕、单参收 Vector3 与 Vector3i",
      `${z3(vector3iNew([]))}/${z3(vector3iNew([V.float(1.9), V.float(-2.9), V.float(3.5)]))}/${z3(vector3iNew([V.int(2147483648), V.int(-2147483649), V.int(4294967296)]))}/${z3(vector3iNew([vector3(1.7, -2.2, 3.5)]))}/${z3(vector3iNew([B3]))}`,
      "(0, 0, 0)/(1, -2, 3)/(-2147483648, 2147483647, 0)/(1, -2, 3)/(1, 2, 3)");
    eq("step85", "bool 实参收（`Vector3i(true, false, true)` → `(1, 0, 1)`），nan / ±inf 折成 0（t70-ctor-nan / inf）",
      `${z3(vector3iNew([V.bool(true), V.bool(false), V.bool(true)]))}/${z3(vector3iNew([V.float(Number.NaN), V.float(1), V.float(2)]))}/${z3(vector3iNew([V.float(Infinity), V.float(-Infinity), V.float(3)]))}`,
      "(1, 0, 1)/(0, 1, 2)/(0, 0, 3)");
    shouldThrow("step85", "一个数的构造式 Godot 是解析期拒（`No constructor ... Vector3i(int)`），我们编不出产物", () =>
      vector3iNew([V.int(7)]));
    shouldThrow("step85", "两参构造同样没有（`Vector3i(int, int)` 解析期拒）", () =>
      vector3iNew([V.int(1), V.int(2)]));
    shouldThrow("step85", "Vector2 / Color 进构造器实测都是解析期拒，不照 Vector3 那一格推", () =>
      vector3iNew([vector2(1, 2)]));

    eq("step85", "逐分量整数算式（六行 + 语料 165 的 arith / scalar / wrap 三行）",
      `${z3(ops.add(A3, B3))} ${z3(ops.sub(A3, B3))} ${z3(ops.mul(A3, B3))} ${z3(ops.div(A3, B3))} ${z3(ops.mod(A3, B3, true))} ${z3(ops.neg(A3))}`,
      "(4, -2, 15) (2, -6, 9) (3, -8, 36) (3, -2, 4) (0, 0, 0) (-3, 4, -12)");
    eq("step85", "标量在左在右同式，除法向零、模的符号跟被除数（ u / n 两行）",
      `${z3(ops.mul(A3, V.int(2)))} ${z3(ops.mul(V.int(2), A3))} ${z3(ops.div(A3, V.int(-2)))} ${z3(ops.mod(A3, V.int(-2), true))}`,
      "(6, -8, 24) (6, -8, 24) (-1, 2, -6) (1, 0, 0)");
    eq("step85", "加减越界回绕 int32",
      `${z3(ops.add(Z3(2147483647, 0, 0), Z3(1, 0, 0)))} ${z3(ops.sub(Z3(-2147483648, 0, 0), Z3(1, 0, 0)))}`,
      "(-2147483648, 0, 0) (2147483647, 0, 0)");
    eq("step85", "右边掺 float 升级成 Vector3",
      `${show(ops.div(A3, V.float(4)))} ${show(ops.mul(A3, V.float(0.5)))} ${typeOf(ops.div(A3, V.float(4))).v}`,
      "(0.75, -1.0, 3.0) (1.5, -2.0, 6.0) 9");
    shouldThrow("step85", "标量在左放 int 的除法实测是解析期拒（`4 / Vector3i`），不猜结果", () =>
      ops.div(V.int(4), A3));
    shouldThrow("step85", "向量与向量混算（Vector3i + Vector3）实测解析期拒", () =>
      ops.add(A3, vector3(1, 1, 1)));
    perr("step85", "逐分量除零的文本与 int 那一族同一句", () => ops.div(A3, Z3(0, 2, 2)), "Division by zero error in operator '/'.");
    perr("step85", "逐分量取模零", () => ops.mod(A3, Z3(0, 2, 2), true), "Modulo by zero error in operator '%'.");

    eq("step85", "比较按字典序 x→y→z（ cmp 行：a<b 假、a<=a 真、a>b 真）",
      `${isLess(A3, B3)} ${!isLess(A3, Z3(3, -4, 12))} ${isLess(B3, A3)}`,
      "false true true");
    eq("step85", "同型相等与不等；跨形状（Vector3i == Vector3）实测是解析期拒 → 我们运行期也响",
      `${valueEq(A3, Z3(3, -4, 12))} ${valueEq(A3, B3)} ${ops.eq(vector3(1, 2, 3), vector3(1, 2, 3)).v}`,
      "true false true");
    shouldThrow("step85", "Vector3i == Vector3 不静默给 false", () => valueEq(A3, vector3(3, -4, 12)));

    eq("step85", "方法面",
      `${z3(z3m(A3, "abs"))} ${z3(z3m(A3, "sign"))} ${show(z3m(A3, "length"))} ${show(z3m(A3, "length_squared"))} ${z3(z3m(A3, "min", B3))} ${z3(z3m(A3, "max", B3))}`,
      "(3, 4, 12) (1, -1, 1) 13.0 169 (1, -4, 3) (3, 2, 12)");
    eq("step85", "clamp / snapped / 轴下标",
      `${z3(z3m(A3, "clamp", Z3(0, 0, 0), Z3(5, 5, 5)))} ${z3(z3m(A3, "snapped", Z3(5, 5, 5)))} ${z3(z3m(A3, "snapped", Z3(-5, 2, 5)))} ${z3(z3m(A3, "snapped", Z3(0, 0, 0)))} ${show(z3m(A3, "min_axis_index"))} ${show(z3m(A3, "max_axis_index"))}`,
      "(3, 0, 5) (5, -5, 10) (5, -4, 10) (3, -4, 12) 1 2");
    eq("step85", "distance_to 给 float、distance_squared_to 给 int（重跑）",
      `${show(z3m(A3, "distance_to", Z3(0, 0, 0)))} ${show(z3m(A3, "distance_squared_to", Z3(1, 1, 1)))} ${typeOf(z3m(A3, "distance_to", Z3(0, 0, 0))).v}`,
      "13.0 150 3");
    shouldThrow("step85", "零参的 max()/min() 实测是解析期错，不发近似值", () => z3m(A3, "max"));
    shouldThrow("step85", "max 收两个实参也是解析期错（`Expected at most 1`）", () => z3m(A3, "max", B3, B3));
    shouldThrow("step85", "min 的实参必须是 Vector3i（实测 `Cannot pass a value of type \"int\" as \"Vector3i\"`）", () =>
      z3m(A3, "min", V.int(2)));
    for (const n of ["dot", "cross", "axis_get", "axis_set", "hash", "normalized", "direction_to", "move_toward", "lerp", "aspect", "floor", "ceilf", "roundf", "is_zero_approx", "is_equal_approx", "snappedf", "snapn", "posmod", "floordiv", "ceildiv", "signwrapping", "pow", "same_sign", "octant", "count_zeros", "to_vector3"]) {
      shouldThrow("step85", `Vector3i.${n}() 实测不存在（①–④ 组逐格量到 Nonexistent function）`, () => z3m(A3, n));
    }

    eq("step85", "静态常量表（ 16 支：INF 没有，AXIS_* 是**整数**不是向量）",
      `${z3(vector3iConst("ZERO"))} ${z3(vector3iConst("ONE"))} ${z3(vector3iConst("UP"))} ${z3(vector3iConst("DOWN"))} ${z3(vector3iConst("LEFT"))} ${z3(vector3iConst("RIGHT"))} ${z3(vector3iConst("FORWARD"))} ${z3(vector3iConst("BACK"))} ${z3(vector3iConst("MAX"))} ${z3(vector3iConst("MIN"))}`,
      "(0, 0, 0) (1, 1, 1) (0, 1, 0) (0, -1, 0) (-1, 0, 0) (1, 0, 0) (0, 0, -1) (0, 0, 1) (2147483647, 2147483647, 2147483647) (-2147483648, -2147483648, -2147483648)");
    eq("step85", "AXIS_X / AXIS_Y / AXIS_Z 是 int 0 / 1 / 2（实测 `print(Vector3i.AXIS_X)` 给 0、typeof 给 2）",
      `${show(vector3iConst("AXIS_X"))} ${show(vector3iConst("AXIS_Y"))} ${show(vector3iConst("AXIS_Z"))} ${typeOf(vector3iConst("AXIS_Y")).v}`,
      "0 1 2 2");
    shouldThrow("step85", "Vector3i.INF 实测不存在（而 Vector3 有 —— 照抄就错）", () => vector3iConst("INF"));

    eq("step85", "下标与字符串键读分量（`v[0..2]` 与 `v[\"x\"]`/`v[\"z\"]` 同格）",
      `${show(index(A3, I(0)))} ${show(index(Z3(7, 8, 9), I(1)))} ${show(index(Z3(7, 8, 9), V.str("y")))}`,
      "3 8 8");
    perr("step85", "下标越界读：实测 `Invalid access of index '3' on a base object of type: 'Vector3i'.`", () =>
      index(A3, I(3)), "Invalid access of index '3' on a base object of type: 'Vector3i'.");
    perr("step85", "负下标读**不绕到尾部**（与数组两套口径）", () => index(A3, I(-1)), "Invalid access of index '-1' on a base object of type: 'Vector3i'.");
    perr("step85", "写越界是另一句文本", () => writeIdx(A3, I(5), V.int(1)), "Invalid assignment of index '5' (on base: 'Vector3i') with value of type 'int'.");
    perr("step85", "分量写 bool 拒", () => writeProp(A3, "z", V.bool(true)), "Invalid assignment of property or key 'z' with value of type 'bool' on a base object of type 'Vector3i'.");
    eq("step85", "分量写：float 向零截断、超界回绕（语料 165 的 write 行）",
      (() => {
        let v = Z3(1, 2, 3);
        v = writeIdx(v, I(1), V.float(7.9)) as Variant;
        v = writeProp(v, "z", V.float(-0.9)) as Variant;
        v = writeProp(v, "x", V.int(7000000000)) as Variant;
        return show(v);
      })(),
      "(-1589934592, 7, 0)");

    eq("step85", "打印是三个整数、typeof 给 10",
      `${show(A3)} ${typeOf(A3).v}`,
      "(3, -4, 12) 10");
    eq("step85", "当字典键：内容分格，`Vector3` 与 `Vector3i` 是**两个**键（实测 has → false）",
      (() => {
        const d = new GDict();
        d.set(B3, V.str("a"));
        return `${show(V.dict(d))} ${d.has(vector3(1, 2, 3))} ${d.has(B3)}`;
      })(),
      "{ (1, 2, 3): \"a\" } false true");

    eq("step85", "pack 的**读侧**升格：Vector3i → Vector3、Vector2i → Vector3 补 0（语料 165 的 pack 行）",
      (() => {
        const p = V.object(GBytes.of([], "vector3"));
        method(p, "append", [Z3(1, 2, 3)]);
        method(p, "append", [vector2i(4, 5)]);
        method(p, "append", [Z3(7, 8, 9)]);
        return `${show(p)} ${typeOf(index(p, I(0))).v} ${show(method(p, "count", [Z3(1, 2, 3)]))} ${show(method(p, "has", [Z3(7, 8, 9)]))} ${show(method(p, "find", [Z3(7, 8, 9)]))}`;
      })(),
      "[(1.0, 2.0, 3.0), (4.0, 5.0, 0.0), (7.0, 8.0, 9.0)] 9 1 true 2");
    perr("step85", "pack 的**写这一侧只收同形状**：`p[0] = Vector3i(...)` 实测报 `Invalid assignment of property or key '0' …`", () =>
      writeIdx(V.object(GBytes.of([new GVector3(1, 2, 3)], "vector3")), I(0), Z3(7, 8, 9)),
      "Invalid assignment of property or key '0' with value of type 'Vector3i' on a base object of type 'PackedVector3Array'.");
    perr("step85", "同一格在 Vector2 pack 上给 Vector2i 也拒", () =>
      writeIdx(V.object(GBytes.of([new GVector2(1, 2)], "vector2")), I(0), vector2i(7, 8)),
      "Invalid assignment of property or key '0' with value of type 'Vector2i' on a base object of type 'PackedVector2Array'.");
    perr("step85", "Vector2 进 Vector3 pack 的写也拒", () =>
      writeIdx(V.object(GBytes.of([new GVector3(1, 2, 3)], "vector3")), I(0), vector2(7, 8)),
      "Invalid assignment of property or key '0' with value of type 'Vector2' on a base object of type 'PackedVector3Array'.");

    eq("step85", "定型容器的元素换算（Vector3i 槽吃 Vector3 截断、Vector2i 槽吃 Vector2 截断、Vector2/Vector3 槽吃整型向量升格、int 槽不收向量）",
      (() => {
        const a = stampArray(V.array(new GArray()), "Vector3i", true);
        method(a, "append", [vector3(4.7, 5.2, 6.9)]);
        const g = new GArray();
        const b = stampArray(V.array(g), "Vector2i", true);
        method(b, "append", [vector2(1.7, -2.9)]);
        const c = new GArray();
        const d = stampArray(V.array(c), "Vector2", true);
        method(d, "append", [vector2i(1, 2)]);
        const e = new GArray();
        const f = stampArray(V.array(e), "int", true);
        method(f, "append", [B3]);
        return `${show(a)} ${show(b)} ${show(d)} ${show(f)}`;
      })(),
      "[(4, 5, 6)] [(1, -2)] [(1.0, 2.0)] []");
    eq("step85", "值类型变量槽：`var wv: Vector3 = Vector3i(4,5,6)` 升 float、`var wi: Vector3i = Vector3(...)` 截断、`var v2i: Vector2i = Vector2(...)` 截断（语料 165 的 slot 行）",
      `${show(toVec3(Z3(4, 5, 6)))} ${typeOf(toVec3(Z3(4, 5, 6))).v} ${show(toVec3i(vector3(1.7, 2.2, 3.9)))} ${typeOf(toVec3i(vector3(1.7, 2.2, 3.9))).v} ${show(toVec2i(vector2(1.7, -2.9)))} ${typeOf(toVec2i(vector2(1.7, -2.9))).v}`,
      "(4.0, 5.0, 6.0) 9 (1, 2, 3) 10 (1, -2) 6");
    shouldThrow("step85", "Vector3 槽吃 Vector2 实测是解析期拒，不猜转换", () => toVec3(vector2(1, 2)));
    shouldThrow("step85", "Vector3i 槽吃 int 实测是解析期拒（两句）", () => toVec3i(V.int(5)));
  });
});
