// var_to_bytes / bytes_to_var（语料 274 / 275 / 276 钉了逐字节形状；本门钉语料看不见的那些：四形坏字节都回 NIL、
// 没量过的那一批形状一律响亮拒、窄身判据的边界格、九种 pack 与定型容器的解回来那侧、身份那一支的盒子。
// 读数：`tmp/probe-varbytes/`，S282 / S283 / S284）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, showArgs } from "@gds2js/runtime/runtime/values";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { GVector3i } from "@gds2js/runtime/runtime/vector3i";
import { GVector2i } from "@gds2js/runtime/runtime/vector2i";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector3 } from "@gds2js/runtime/runtime/vector3";
import { GColor } from "@gds2js/runtime/runtime/color";
import { GdRid } from "@gds2js/runtime/runtime/rid";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { nullCallable } from "@gds2js/runtime/runtime/callable";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { GdScriptObject } from "@gds2js/runtime/runtime/object";
import { method } from "@gds2js/runtime/runtime/methods";
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
/** 编出来的字节串（期望值全部取语料里引擎自己打的那一列）。 */
const vb = (v: Variant): string => showArgs([gVarToBytes(v)]);
/** 编完再解回来：拿引擎打的值形态作对照。 */
const rt = (v: Variant): string => showArgs([gBytesToVar(gVarToBytes(v))]);

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
      ["Signal", V.object(new Signal())],
      ["空 Callable", nullCallable()],
    ];
    eq(
      "282",
      "三支各归各的拒答码（NodePath、九种 pack、Vector3i 都按 275 的读数出货了）",
      refused.map(([n, v]) => `${n}:${code(() => gVarToBytes(v))}`).join("|"),
      "RID:[var-to-bytes-object]|Signal:[var-to-bytes-object]|空 Callable:[var-to-bytes-object]",
    );
    eq("282", "bytes_to_var 的第一参要 PackedByteArray（给了 int）", code(() => gBytesToVar(V.int(5))), "[bytes-to-var-arg]");
  });

  it("浮点只看一条：float32 折回来还是它自己就走窄身（更正 S282 那两条）", () => {
    eq("283", "2^-126 与 2^-149 都是 float32 直写（窄身四字节）", `${vb(V.float(2 ** -126))}|${vb(V.float(2 ** -149))}`, "[3, 0, 0, 0, 0, 0, 128, 0]|[3, 0, 0, 0, 1, 0, 0, 0]");
    eq("283", "2^-1022 与 2^-1074 折不回自己 —— 挂宽位写八字节（S282 那条 DBL_MIN 特判撤了）", `${vb(V.float(2 ** -1022))}|${vb(V.float(2 ** -1074))}`, "[3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 16, 0]|[3, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0]");
    eq("283", "负零的号写进 float32 的符号位（语料 274 的 t29 用的是运行期取负）", `${vb(V.float(-0))}|${vb(V.float(0))}`, "[3, 0, 0, 0, 0, 0, 0, 128]|[3, 0, 0, 0, 0, 0, 0, 0]");
    eq("283", "NaN 因为 NaN != NaN 自然落宽身、±inf 在窄身那侧", `${vb(V.float(NaN))}|${vb(V.float(Infinity))}|${vb(V.float(-Infinity))}`, "[3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 248, 127]|[3, 0, 0, 0, 0, 0, 128, 127]|[3, 0, 0, 0, 0, 0, 128, 255]");
    eq("283", "2^-1075 在双精度就已经是 0，窄身全零", vb(V.float(2 ** -1075)), "[3, 0, 0, 0, 0, 0, 0, 0]");
    eq("283", "解回来：窄身那两支是同一个值、宽身那两支按 double 复现", `${rt(V.float(2 ** -149))}|${rt(V.float(2 ** -1022))}|${rt(V.float(0.1))}`, "0.0|0.0|0.1");
  });

  it("实例那一支：身份直写 12 字节，解回来是 EncodedObjectAsID 的盒子（S284 ①，语料 276 钉掩码后的打印）", () => {
    const inst = V.object(new GdScriptObject());
    const enc = gVarToBytes(inst);
    eq("284", "头部是 24,0,1,0（类型 24 挂宽位），整支 12 字节", `${showArgs([enc]).slice(1).split(", ").slice(0, 4).join(", ")}|${String((enc.v as GBytes).raw().length)}`, "24, 0, 1, 0|12");
    const box = gBytesToVar(enc);
    const text = showArgs([box]);
    eq("284", "打印是 <EncodedObjectAsID#号>，号是盒子自己另占的那一个", `${text.startsWith("<EncodedObjectAsID#") && text.endsWith(">") ? "形对" : "走样"}|${text.includes(String((inst.v as GdScriptObject).gdObjectId)) ? "漏了实例的号" : "没漏"}`, "形对|没漏");
    eq("284", "get_object_id() 给的是字节里那个号，与实例自己的号同一个数", showArgs([method(box, "get_object_id", [])]), showArgs([V.int((inst.v as GdScriptObject).gdObjectId)]));
    eq("284", "两次解出来的盒子是两个不同对象（实测 == 假）", String(gBytesToVar(enc).v === box.v), "false");
    eq("284", "盒子上没量过的成员响亮拒", code(() => method(box, "get_ref", [])), "[encoded-object-id-method]");
  });

  it("内联条目那一支：没开对象表的解码器给 <null>（引擎那两句 ERROR 没有 at: 行，进不了语料）", () => {
    const tableForm = bytes([24, 0, 0, 0, 10, 0, 0, 0, 82, 101, 102, 67, 111, 117, 110, 116, 101, 100, 0, 0, 1, 0, 0, 0]);
    eq("284", "读得不完整也算读不通", showArgs([gBytesToVar(tableForm)]), "<null>");
    eq("284", "整条目补全也一样：<null>（引擎那句是 ERR_UNAUTHORIZED）", showArgs([gBytesToVar(bytes([24, 0, 0, 0, 4, 0, 0, 0, 79, 98, 106, 0, 0, 0, 0, 0]))]), "<null>");
  });

  it("九种 pack 的字节与解回来（期望全取语料 275 引擎那一列）", () => {
    eq("283", "int32 / int64 / float32 三种整数的字节", `${vb(V.object(GBytes.of([1, -2], "int32")))}|${vb(V.object(GBytes.of([1, -2], "int64")))}|${vb(V.object(GBytes.of([1.5, -2.5], "float32")))}`, "[30, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 254, 255, 255, 255]|[31, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 254, 255, 255, 255, 255, 255, 255, 255]|[32, 0, 0, 0, 2, 0, 0, 0, 0, 0, 192, 63, 0, 0, 32, 192]");
    eq("283", "vector2 / vector3 / color 的分量按 float32 原样写", `${vb(V.object(GBytes.of([new GVector2(1, 2)], "vector2")))}|${vb(V.object(GBytes.of([new GVector3(1, 2, 3)], "vector3")))}|${vb(V.object(GBytes.of([new GColor(0.25, 0.5, 0.75, 1)], "color")))}`, "[35, 0, 0, 0, 1, 0, 0, 0, 0, 0, 128, 63, 0, 0, 0, 64]|[36, 0, 0, 0, 1, 0, 0, 0, 0, 0, 128, 63, 0, 0, 0, 64, 0, 0, 64, 64]|[37, 0, 0, 0, 1, 0, 0, 0, 0, 0, 128, 62, 0, 0, 0, 63, 0, 0, 64, 63, 0, 0, 128, 63]");
    eq("283", "pack 里的字符串长度带终止符：\"a\" 写 2、\"abc\" 写 4、\"é\" 写 3", `${vb(V.object(GBytes.of(["a", "abc"], "string")))}|${vb(V.object(GBytes.of(["é"], "string")))}`, "[34, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 97, 0, 0, 0, 4, 0, 0, 0, 97, 98, 99, 0]|[34, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 195, 169, 0, 0]");
    eq("283", "空 pack 只有头部与个数", vb(V.object(GBytes.of([], "int32"))), "[30, 0, 0, 0, 0, 0, 0, 0]");
    eq(
      "283",
      "九种各解回自己的形状",
      [
        rt(V.object(GBytes.of([1, -2], "int32"))),
        rt(V.object(GBytes.of([1, -2], "int64"))),
        rt(V.object(GBytes.of([1.5, -2.5], "float32"))),
        rt(V.object(GBytes.of(["a", "abc"], "string"))),
        rt(V.object(GBytes.of(["é"], "string"))),
        rt(V.object(GBytes.of([1, 2, 3], "byte"))),
        rt(V.object(GBytes.of([1.5], "float64"))),
      ].join("|"),
      "[1, -2]|[1, -2]|[1.5, -2.5]|[\"a\", \"abc\"]|[\"é\"]|[1, 2, 3]|[1.5]",
    );
  });

  it("NodePath 的三段计数字与解回来", () => {
    eq("283", "a/b:0 —— 名数挂 1<<31、子名数、绝对位，然后每段「长度 + UTF-8 补零」", vb(nodePathValue("a/b:0")), "[22, 0, 0, 0, 2, 0, 0, 128, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 97, 0, 0, 0, 1, 0, 0, 0, 98, 0, 0, 0, 1, 0, 0, 0, 48, 0, 0, 0]");
    eq("283", "/a/b 的绝对位是 1", vb(nodePathValue("/a/b")), "[22, 0, 0, 0, 2, 0, 0, 128, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 97, 0, 0, 0, 1, 0, 0, 0, 98, 0, 0, 0]");
    eq("283", "四支路径各解回自己的文本", `${rt(nodePathValue("a/b:0"))}|${rt(nodePathValue("/a/b"))}|${rt(nodePathValue(":1"))}|${rt(nodePathValue(""))}`, "a/b:0|/a/b|:1|");
  });

  it("整数向量的两支都是 int32 补码（Vector3i 的第三格今天量到）", () => {
    eq("283", "Vector3i(1, -2, 3) 的字节", vb(V.object(new GVector3i(1, -2, 3))), "[10, 0, 0, 0, 1, 0, 0, 0, 254, 255, 255, 255, 3, 0, 0, 0]");
    eq("283", "解回来还是那三格", rt(V.object(new GVector3i(1, -2, 3))), "(1, -2, 3)");
    eq("283", "Vector2i(1, 2) 只有两格", vb(V.object(new GVector2i(1, 2))), "[6, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0]");
  });

  it("定型容器：头部挂宽位与类型码，解回来标注还在", () => {
    const ai = V.array(GArray.of([V.int(1), V.int(2)]));
    (ai.v as GArray).stampElem("int");
    eq("283", "Array[int] 的头部 28,0,1,0 后跟一枚类型码 2、再个数", vb(ai), "[28, 0, 1, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0]");
    const back = gBytesToVar(gVarToBytes(ai));
    eq("283", "解回来的数组仍带 int 标注", `${showArgs([back])}|${String((back.v as GArray).elemKind())}`, "[1, 2]|int");
    const di = new GDict();
    di.set(V.str("a"), V.int(1));
    const dict = V.dict(di);
    (dict.v as GDict).stampElem("String", "int");
    eq("283", "Dictionary[String, int] 的头部挂 5（键 1、值 4），两枚类型码在个数之前", vb(dict), "[27, 0, 5, 0, 4, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 97, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0]");
    const d2 = gBytesToVar(gVarToBytes(dict));
    eq("283", "解回来的字典两端标注都在", `${String((d2.v as GDict).keyKind)}|${String((d2.v as GDict).valKind)}`, "String|int");
  });

  it("往返过的两支：int64 走宽头部、pack 的填充只补到四倍数", () => {
    eq("282", "4294967296 的头部挂 1<<16 且按 int64 写", vb(V.int(4294967296)), "[2, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]");
    eq("282", "三个字的 pack 补一个零、长度字段仍是 3", vb(V.object(GBytes.of([1, 2, 3], "byte"))), "[29, 0, 0, 0, 3, 0, 0, 0, 1, 2, 3, 0]");
    eq("282", "解回来还是那三个字节", rt(V.object(GBytes.of([1, 2, 3], "byte"))), "[1, 2, 3]");
  });
});
