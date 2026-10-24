// 作废那支函数交回来的就是 Nil（S695，尺 `tmp/probe718/{u,v,z}.gd` 的 234 格矩阵）：无标注的函数体在运行期作废给 `null`，
// 标了返回型的给该型默认值（`-> int` 给 0、`-> String` 给空串、`-> Array` 给空数组）；那个 Nil 再参与运算时引擎发的是
// 运行期那一句 `Invalid operands 'X' and 'Y' in operator 'op'.`，只有 `==` / `!=` 例外（照实给 false / true，两侧都是 Nil 时 `==` 真）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { ops } from "@gds2js/runtime/runtime/ops";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";

const NIL = V.nil();
const ONE = V.int(1);
const say = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return String((e as Error).message).split("\n")[0] ?? "";
  }
};
const show = (v: unknown): string => ((v as { v?: unknown }).v === null ? "<null>" : JSON.stringify((v as { v?: unknown }).v));
const sayPair = (f: (a: typeof NIL, b: typeof NIL) => unknown): string => {
  const left = say(() => f(NIL, ONE));
  const right = say(() => f(ONE, NIL));
  return `${left}|${right}`;
};

describe("ops · Nil 参与运算时引擎那一句（S695）", () => {
  it("加、减、乘、除、幂：两侧任一是 Nil 都发那一句，左错读左边、右错读右边", () => {
    const want = (op: string): string =>
      `Invalid operands 'Nil' and 'int' in operator '${op}'.|Invalid operands 'int' and 'Nil' in operator '${op}'.`;
    eq("695", "+", sayPair(ops.add), want("+"));
    eq("695", "-", sayPair(ops.sub), want("-"));
    eq("695", "*", sayPair(ops.mul), want("*"));
    eq("695", "/", sayPair(ops.div), want("/"));
    eq("695", "**", sayPair(ops.pow), want("**"));
  });

  it("取模与元运算四支只吃 int，Nil 进来还是那一句", () => {
    const want = (op: string): string =>
      `Invalid operands 'Nil' and 'int' in operator '${op}'.|Invalid operands 'int' and 'Nil' in operator '${op}'.`;
    eq("695", "%", sayPair(ops.mod), want("%"));
    eq("695", "&", sayPair(ops.band), want("&"));
    eq("695", "|", sayPair(ops.bor), want("|"));
    eq("695", "^", sayPair(ops.bxor), want("^"));
  });

  it("比较四支早就发那一句", () => {
    const want = (op: string): string =>
      `Invalid operands 'Nil' and 'int' in operator '${op}'.|Invalid operands 'int' and 'Nil' in operator '${op}'.`;
    eq("695", "<", sayPair(ops.lt), want("<"));
    eq("695", "<=", sayPair(ops.lte), want("<="));
    eq("695", ">", sayPair(ops.gt), want(">"));
    eq("695", ">=", sayPair(ops.gte), want(">="));
  });

  it("`in`：容器是 Nil 给那一句，被找的键是 Nil 照实给 false", () => {
    const arr = V.array(GArray.of([ONE]));
    eq("695", "1 in Nil", say(() => ops.inOp(ONE, NIL)), "Invalid operands 'int' and 'Nil' in operator 'in'.");
    eq("695", "Nil in Nil", say(() => ops.inOp(NIL, NIL)), "Invalid operands 'Nil' and 'Nil' in operator 'in'.");
    eq("695", "null in [1]", show(ops.inOp(NIL, arr)), "false");
    eq("695", "null in {1:2}", show(ops.inOp(NIL, dictOf([[ONE, ONE]]))), "false");
  });

  it("等式两支不抛：null == 1 假、null != 1 真、两侧都是 Nil 时 == 真", () => {
    eq("695", "==", show(ops.eq(NIL, ONE)), "false");
    eq("695", "!=", show(ops.neq(NIL, ONE)), "true");
    eq("695", "== 两侧 Nil", show(ops.eq(NIL, NIL)), "true");
    eq("695", "!= 两侧 Nil", show(ops.neq(NIL, NIL)), "false");
  });
});
