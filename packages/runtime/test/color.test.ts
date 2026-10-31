// 由 tools/ops-check.ts 机械搬迁：region 1708-1857。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { index, method, writeIdx, writeProp } from "@gds2js/runtime/runtime/methods";
import { ops, sortLess } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, elemConvert, elemDefault, toStringNameSlot} from "@gds2js/runtime/runtime/values";
import { strColor } from "@gds2js/runtime/runtime/string-ops";
import { asColor, color, colorMethod, colorNew, colorRead, colorStatic, colorWrite, GColor, toColor } from "@gds2js/runtime/runtime/color";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { typeOf } from "@gds2js/runtime/runtime/patterns";

describe("runtime/color", () => {
  it("096 · 零参是黑但 alpha 为 1", async () => {
    const C = (...a: Variant[]) => colorNew(a);
    const g = (name: string, args: Variant[] = []) => colorStatic(name, args);
    const msg = (fn: () => unknown): string => {
      try {
        fn();
        return "没有报错";
      } catch (e) {
        return (e as Error).message;
      }
    };
    const inst = C(V.float(0.1), V.float(0.2), V.float(0.3), V.float(0.4));
    const instOf = () => asColor(inst) as GColor;
    const M = (v: Variant) => (name: string, args: Variant[] = []) =>
      show(colorMethod(asColor(v) as GColor, name, args));
    const A = (v: Variant) => (key: Variant) => show(colorRead(asColor(v) as GColor, key, "prop"));

    eq("096", "零参是黑但 alpha 为 1", show(C()), "(0.0, 0.0, 0.0, 1.0)");
    eq("096", "三参补 alpha 1", show(C(V.int(1), V.int(2), V.int(3))), "(1.0, 2.0, 3.0, 1.0)");
    eq("096", "单参拷贝", show(C(inst)), "(0.1, 0.2, 0.3, 0.4)");
    eq("096", "字符串走名字表", show(C(V.str("red"))), "(1.0, 0.0, 0.0, 1.0)");
    eq("096", "名字表下划线可省、大小写不限", show(C(V.str("MINTCREAM"))), "(0.9608, 1.0, 0.9804, 1.0)");
    eq("096", "认不出来给兜底色（Godot 那边另有一行 stderr，产物不复现）", show(C(V.str("notacolor"))), "(0.0, 0.0, 0.0, 1.0)");
    eq("096", "0x 前缀不认", show(C(V.str("0x80ff0000"))), "(0.0, 0.0, 0.0, 1.0)");
    eq("096", "html 只认十六进制、不认名字", show(g("html", [V.str("red")])), "(0.0, 0.0, 0.0, 1.0)");
    eq("096", "html 的八位是 RGBA（alpha 在后）", show(g("html", [V.str("80ff0000")])), "(0.502, 1.0, 0.0, 0.0)");
    eq("096", "html 的三位会展开", show(g("html", [V.str("f00")])), "(1.0, 0.0, 0.0, 1.0)");
    eq("096", "from_string 认不出来用第二个实参", show(g("from_string", [V.str("bogus"), color(1, 2, 3, 4)])), "(1.0, 2.0, 3.0, 4.0)");
    shouldThrow("096", "from_string 必须两个实参", () => g("from_string", [V.str("red")]));
    eq("096", "from_hsv 三参补 alpha 1", show(g("from_hsv", [V.float(0.5), V.float(0.25), V.float(0.5)])), "(0.375, 0.5, 0.5, 1.0)");
    eq("096", "from_hsv 的扇区号按 6 取模", show(g("from_hsv", [V.float(1), V.float(1), V.float(1)])), "(1.0, 0.0, 0.0, 1.0)");
    eq("096", "常量面与名字表是同一张", show(g("ALICE_BLUE")), "(0.9412, 0.9725, 1.0, 1.0)");
    eq("096", "TRANSPARENT 是白带零 alpha", show(g("TRANSPARENT")), "(1.0, 1.0, 1.0, 0.0)");
    shouldThrow("096", "名单里没有 NAVY（只有 NAVY_BLUE）", () => g("NAVY"));
    shouldThrow("096", "常量只有 UPPER_SNAKE，没有 camelCase", () => g("AliceBlue"));

    eq("096", "打印是 4 位小数", show(color(1 / 3, 0.1, 0.123456789, 1)), "(0.3333, 0.1, 0.1235, 1.0)");
    eq("096", "恰好 -0.0 也保留负号（Vector2 在这里给 0.0）", show(color(1 / 3, 1e-5, -1e-5, -0)), "(0.3333, 0.0, -0.0, -0.0)");
    eq("096", "inf / nan 原样印", show(color(Infinity, NaN, -Infinity, 1)), "(inf, nan, -inf, 1.0)");
    eq("096", "整数分量走 strFloat 的展开", show(color(1e20, 1e-8, -1e-8, 1)), "(100000002004087730000.0, 0.0, -0.0, 1.0)");
    eq("096", "非零但舍到零留负号", strColor(Math.fround(-1e-5)), "-0.0");
    eq("096", "半个单位往上进位", strColor(Math.fround(0.00006)), "0.0001");

    eq("096", "派生 h", A(inst)(V.str("h")), "0.58333331346512");
    eq("096", "派生 s", A(inst)(V.str("s")), "0.66666668653488");
    eq("096", "派生 v 就是最大分量", A(inst)(V.str("v")), "0.30000001192093");
    eq("096", "字节属性 r8 / a8", `${A(inst)(V.str("r8"))}/${A(inst)(V.str("a8"))}`, "26/102");
    const wild = color(NaN, Infinity, -Infinity, 0.4);
    eq(
      "096",
      "字节的三条极端口径（nan 过 int32 给了 INT32_MIN、inf 顶到 255、-inf 落到 0）",
      [A(wild)(V.str("r8")), A(wild)(V.str("g8")), A(wild)(V.str("b8"))].join(" "),
      "-2147483648 255 0",
    );
    eq("096", "0.7 的字节是 179：float32 里积是精确的 178.5", A(color(0, 0, 0, 0.7))(V.str("a8")), "179");
    eq("096", "灰的 h/s 归零", `${A(color(0.5, 0.5, 0.5, 1))(V.str("h"))}/${A(color(0.5, 0.5, 0.5, 1))(V.str("s"))}`, "0.0/0.0");
    eq("096", "负分量的 s 不夹取", A(color(-0.5, 0.2, 0.9, 1))(V.str("s")), "1.55555558204651");
    eq("096", "分量读出来是 float32", A(inst)(V.str("r")), "0.10000000149012");

    eq("096", "to_html 默认就带 alpha", M(color(0.6, 0.4, 0.2, 1))("to_html"), "996633ff");
    eq("096", "to_html(false) 才是 6 位", M(color(0.25, 0.5, 0.75, 0.5))("to_html", [V.bool(false)]), "4080bf");
    eq("096", "to_html(true) 是 8 位", M(color(0.4, 0.5, 0.6, 0.7))("to_html", [V.bool(true)]), "668099b3");
    eq("096", "to_rgba32 按 RGBA 打包", M(color(0.6, 0.4, 0.2, 1))("to_rgba32"), "2573612031");
    eq("096", "to_argb32 / to_abgr32 各按名字排", `${M(color(0.6, 0.4, 0.2, 1))("to_argb32")}/${M(color(0.6, 0.4, 0.2, 1))("to_abgr32")}`, "4288243251/4281558681");
    eq("096", "全 1 打包到 4294967295", M(color(1, 1, 1, 1))("to_rgba32"), "4294967295");
    eq("096", "全 0 打包到 0", M(color(0, 0, 0, 0))("to_rgba32"), "0");
    eq("096", "get_luminance 是 Rec.709 权重", M(color(0.25, 0.5, 0.75, 1))("get_luminance"), "0.46490001678467");
    eq("096", "灰的亮度就是分量本身", M(color(0.5, 0.5, 0.5, 1))("get_luminance"), "0.5");
    eq("096", "lightened 是向白插值、alpha 不动", M(color(0.6, 0.4, 0.2, 0.3))("lightened", [V.float(0.5)]), "(0.8, 0.7, 0.6, 0.3)");
    eq("096", "darkened 是向黑插值", M(color(0.6, 0.4, 0.2, 0.3))("darkened", [V.float(0.5)]), "(0.3, 0.2, 0.1, 0.3)");
    eq("096", "lightened 不会冲过 1", M(color(1, 1, 1, 1))("lightened", [V.float(0.5)]), "(1.0, 1.0, 1.0, 1.0)");
    eq("096", "负的 amount 往回走", M(color(0.6, 0.4, 0.2, 1))("lightened", [V.float(-0.5)]), "(0.4, 0.1, -0.2, 1.0)");
    eq("096", "darkened 的负 amount 往上", M(color(0.6, 0.4, 0.2, 1))("darkened", [V.float(-0.5)]), "(0.9, 0.6, 0.3, 1.0)");
    eq("096", "inverted 保留 alpha", M(color(0.6, 0.4, 0.2, 0.3))("inverted"), "(0.4, 0.6, 0.8, 0.3)");
    eq("096", "lerp 逐分量", M(color(0.1, 0.2, 0.3, 0.4))("lerp", [color(0.7, 0.8, 0.9, 1), V.float(0.333)]), "(0.2998, 0.3998, 0.4998, 0.5998)");
    eq(
      "096",
      "is_equal_approx 与向量共用 1e-5 相对容差",
      `${M(color(1, 2, 3, 4))("is_equal_approx", [color(1.000009, 2, 3, 4)])}/${M(color(1, 2, 3, 4))("is_equal_approx", [color(1.00001, 2, 3, 4)])}`,
      "true/false",
    );
    eq("096", "method 分派接住了 Color", show(method(inst, "inverted", [])), "(0.9, 0.8, 0.7, 0.4)");
    for (const nm of ["clamped", "is_finite", "is_zero_approx", "mix", "blend_rgb", "get_hsv", "snap", "to_rgba8", "to_bgra32"]) {
      shouldThrow("096", `Color.${nm}() 实测不存在`, () => M(inst)(nm));
    }

    eq("096", "index 分派给下标读", show(index(inst, V.int(0))), "0.10000000149012");
    eq("096", "下标读字符串键", show(index(inst, V.str("g"))), "0.20000000298023");
    eq("096", "越界下标的报错文本与 Godot 同字", msg(() => index(inst, V.int(4))), "Invalid access of index '4' on a base object of type: 'Color'.");
    eq("096", "Color+Color", show(ops.add(color(1, 2, 3, 4), color(0.5, 0.5, 0.5, 0.5))), "(1.5, 2.5, 3.5, 4.5)");
    eq("096", "Color-Color", show(ops.sub(color(1, 2, 3, 4), color(0.5, 0.5, 0.5, 0.5))), "(0.5, 1.5, 2.5, 3.5)");
    eq("096", "Color*Color 逐分量", show(ops.mul(color(1, 2, 3, 4), color(2, 3, 4, 5))), "(2.0, 6.0, 12.0, 20.0)");
    eq(
      "096",
      "Color*标量与标量*Color 同值",
      `${show(ops.mul(color(1, 2, 3, 4), V.int(2)))}|${show(ops.mul(V.int(2), color(1, 2, 3, 4)))}`,
      "(2.0, 4.0, 6.0, 8.0)|(2.0, 4.0, 6.0, 8.0)",
    );
    eq("096", "Color/Color", show(ops.div(color(1, 2, 3, 4), color(2, 4, 6, 8))), "(0.5, 0.5, 0.5, 0.5)");
    eq("096", "除 0.0 给 inf 而不是除零错", show(ops.div(color(1, 2, 3, 4), V.float(0))), "(inf, inf, inf, inf)");
    eq("096", "一元负号是反色而不是取负", show(ops.neg(color(1, -2, 0, 0.5))), "(0.0, 3.0, 1.0, 0.5)");
    eq("096", "与 null 比给 false", show(ops.eq(color(1, 2, 3, 4), V.nil())), "false");
    eq("096", "null 在左边也是 false", show(ops.eq(V.nil(), color(1, 2, 3, 4))), "false");
    eq("096", "== 是 float32 分量相等", show(ops.eq(color(0.1, 0, 0, 0), color(0.1, 0, 0, 0))), "true");
    shouldThrow("096", "Color 与 int 混比要炸", () => ops.eq(color(1, 2, 3, 4), V.int(1)));
    shouldThrow("096", "Color 与 Vector2 混比要炸", () => ops.eq(color(1, 2, 3, 4), vector2(1, 2)));
    shouldThrow("096", "Color 没有大小顺序", () => ops.lt(color(1, 2, 3, 4), color(0, 0, 0, 0)));
    shouldThrow("096", "Color 不能跟 int 相加", () => ops.add(color(1, 2, 3, 4), V.int(1)));

    eq("096", "分量写不夹取", show(colorWrite(instOf(), V.str("r"), V.float(2.7), "prop")), "(2.7, 0.2, 0.3, 0.4)");
    eq("096", "写 h 是「转 HSV 换那一格再转回」", show(colorWrite(instOf(), V.str("h"), V.float(0.5), "prop")), "(0.1, 0.3, 0.3, 0.4)");
    eq("096", "写 s", show(colorWrite(instOf(), V.str("s"), V.float(0.5), "prop")), "(0.15, 0.225, 0.3, 0.4)");
    eq("096", "写 v", show(colorWrite(instOf(), V.str("v"), V.float(0.5), "prop")), "(0.1667, 0.3333, 0.5, 0.4)");
    eq("096", "写 r8 落的是字节", show(colorWrite(instOf(), V.str("r8"), V.int(128), "prop")), "(0.502, 0.2, 0.3, 0.4)");
    eq("096", "写 a8 之后 a 是 64/255", show(colorWrite(instOf(), V.str("a8"), V.int(64), "prop")), "(0.1, 0.2, 0.3, 0.251)");
    shouldThrow("096", "字节写越界没探针，响亮报缺", () => colorWrite(instOf(), V.str("r8"), V.int(300), "prop"));
    shouldThrow("096", "String 写分量要炸", () => colorWrite(instOf(), V.str("r"), V.str("x"), "prop"));
    {
      const wd = writeProp(inst, "b", V.float(1)) as Variant;
      eq("096", "写分量产出新值、不动原值（值类型）", `${show(inst)} | ${show(wd)}`, "(0.1, 0.2, 0.3, 0.4) | (0.1, 0.2, 1.0, 0.4)");
    }
    eq("096", "下标写同样回报新值", show(writeIdx(inst, V.int(3), V.float(0.25)) as Variant), "(0.1, 0.2, 0.3, 0.25)");
    {
      const gd = new GDict();
      gd.set(color(1, 0, 0, 1), V.int(7));
      gd.set(color(1, 0, 0, 1.0), V.int(8));
      eq("096", "等值 Color 是同一格", `${gd.size()} ${show(V.dict(gd))}`, "1 { (1.0, 0.0, 0.0, 1.0): 8 }");
      eq("096", "分量不同的 Color 是另一格", String(gd.has(color(1, 0, 1, 1))), "false");
    }
    eq("096", "Array[Color] 的默认元素 alpha 是 1", show(elemDefault("Color")), "(0.0, 0.0, 0.0, 1.0)");
    eq(
      "096",
      "elemConvert 的 Color 槽收 Color / int / String，不收 StringName",
      `${show(elemConvert("Color", V.int(1)) as Variant)}/${show(elemConvert("Color", V.str("f00")) as Variant)}/${elemConvert("Color", V.stringName("x")) === null ? "拒" : "收"}`,
      "(0.0, 0.0, 0.0, 0.0039)/(1.0, 0.0, 0.0, 1.0)/拒",
    );
    eq(
      "096",
      "Color 槽的 int 与 2³² 边界",
      `${show(toColor(V.int(123456789)))}/${show(toColor(V.int(4294967296)))}/${show(toColor(V.int(-1)))}`,
      "(0.0275, 0.3569, 0.8039, 0.0824)/(0.0, 0.0, 0.0, 0.0)/(1.0, 1.0, 1.0, 1.0)",
    );
    eq("096", "Color 槽拷一份是拷贝不是共享", `${show(toColor(color(0.5, 0.5, 0.5, 0.5)))}`, "(0.5, 0.5, 0.5, 0.5)");
    eq("096", "StringName 槽吃 String、不吃 int 与 Color", `${show(toStringNameSlot(V.str("zz")))}/${String(typeOf(toStringNameSlot(V.str("zz"))).v)}`, "zz/21");
    shouldThrow("096", "StringName 槽吃 int 响亮拒", () => toStringNameSlot(V.int(5)));
    shouldThrow("096", "Color 槽吃 StringName 响亮拒", () => toColor(V.stringName("abc")));
    const cs = GArray.of([color(1, 0, 0, 1), color(0, 1, 0, 1)]);
    cs.sort(sortLess);
    eq("096", "Color 数组 sort 比不出：原地不动（引擎两向都钉过）", show(V.array(cs)), "[(1.0, 0.0, 0.0, 1.0), (0.0, 1.0, 0.0, 1.0)]");
  });
});
