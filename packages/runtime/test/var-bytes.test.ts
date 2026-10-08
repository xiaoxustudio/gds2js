// var_to_bytes / bytes_to_var（语料 274 钉了逐字节形状；本门钉语料看不见的那些：四形坏字节都回 NIL、
// 没量过的那一批形状一律响亮拒、定型数组与 bytes_to_var 的第一参。读数：`tmp/probe-varbytes/`，S282）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, showArgs } from "@gds2js/runtime/runtime/values";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GVector3i } from "@gds2js/runtime/runtime/vector3i";
import { GdRid } from "@gds2js/runtime/runtime/rid";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { nullCallable } from "@gds2js/runtime/runtime/callable";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { gBytesToVar, gVarToBytes } from "@gds2js/runtime/runtime/var-bytes";

const bytes = (nums: number[]): Variant => V.object(GBytes.of(nums, "byte"));
const code = (fn: () => unknown): string => {
  try {
    fn();
    return "居然过了";
  } catch (e) {
    return e instanceof UnsupportedError ? `[${e.code}]` : `非 UnsupportedError: ${String(e)}`;
  }
};

describe("runtime/var-bytes · 坏字节与没量过的形状", () => {
  it("bytes_to_var 读到没量过的字节一律给 <null>（实测四形，引擎那句内部报错不进语料）", () => {
    const got = [bytes([]), bytes([0, 0, 0, 0]), bytes([99, 0, 0, 0]), bytes([2, 0, 0, 0, 1, 0])].map(
      (b) => showArgs([gBytesToVar(b)]),
    );
    eq("282", "空 / 头部 0 / 类型码 99 / 截断的 int —— 四形都是 <null>", got.join("|"), "<null>|<null>|<null>|<null>");
  });

  it("没量过的编码形状一支都不发（按红线响亮拒）", () => {
    const refused: Array<[string, Variant]> = [
      ["RID", V.object(new GdRid(5n))],
      ["NodePath", nodePathValue("a/b")],
      ["Signal", V.object(new Signal())],
      ["空 Callable", nullCallable()],
      ["Vector3i", V.object(new GVector3i(1, 2, 3))],
      ["PackedInt32Array", V.object(GBytes.of([1], "int32"))],
      ["NaN", V.float(NaN)],
    ];
    eq(
      "282",
      "七形各归各的拒答码",
      refused.map(([n, v]) => `${n}:${code(() => gVarToBytes(v))}`).join("|"),
      "RID:[var-to-bytes-object]|NodePath:[var-to-bytes-object]|Signal:[var-to-bytes-object]|空 Callable:[var-to-bytes-object]|Vector3i:[var-to-bytes-object]|PackedInt32Array:[var-to-bytes-pack]|NaN:[var-to-bytes-nan]",
    );
  });

  it("定型数组与第一参不合式也响亮拒", () => {
    const ta = V.array(GArray.of([V.int(1)]));
    (ta.v as GArray).stampElem("int");
    eq("282", "Array[int] 的头部要再挂 typed_flags，没接之前拒", code(() => gVarToBytes(ta)), "[var-to-bytes-typed]");
    eq("282", "bytes_to_var 的第一参要 PackedByteArray（给了 int）", code(() => gBytesToVar(V.int(5))), "[bytes-to-var-arg]");
  });

  it("往返过的两支：int64 走宽头部、pack 的填充只补到四倍数", () => {
    eq("282", "4294967296 的头部挂 1<<16 且按 int64 写", showArgs([gVarToBytes(V.int(4294967296))]), "[2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]");
    eq("282", "三个字的 pack 补一个零、长度字段仍是 3", showArgs([gVarToBytes(V.object(GBytes.of([1, 2, 3], "byte")))]), "[29, 0, 0, 0, 3, 0, 0, 0, 1, 2, 3, 0]");
    eq("282", "解回来还是那三个字节", showArgs([gBytesToVar(gVarToBytes(V.object(GBytes.of([1, 2, 3], "byte"))))]), "[1, 2, 3]");
  });
});
