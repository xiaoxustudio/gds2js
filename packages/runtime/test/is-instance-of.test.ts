// `is_instance_of`（语料 267 钉了 50 格引擎读数；本门钉语料看不见的那些：两句运行期失败原文、越界 int 那一形、
// 表外引擎类值的自家拒，以及 `is` 那七支链在第二参上的用法）。读数：`tmp/probe-is/`（S274，失败原文靠 `--language en`）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { defineClass, registerNativeBase, setClassBase, GdScriptObject, type ClassDesc } from "@gds2js/runtime/runtime/object";
import { nativeClass } from "@gds2js/runtime/runtime/native-class";
import { gIsInstanceOf } from "@gds2js/runtime/runtime/patterns";
import { I, S, F } from "./support/variants";

class Pack extends GdScriptObject {
  a = I(1);
}
const packDesc: ClassDesc = defineClass(Pack, () => new Pack(), (o: object) => o instanceof Pack);
registerNativeBase(packDesc, "RefCounted");

class PackSub extends Pack {
  b = I(2);
}
const subDesc: ClassDesc = defineClass(PackSub, () => new PackSub(), (o: object) => o instanceof PackSub);
registerNativeBase(subDesc, "RefCounted");
setClassBase(subDesc, packDesc);

class Other extends GdScriptObject {
  z = I(3);
}
const otherDesc: ClassDesc = defineClass(Other, () => new Other(), (o: object) => o instanceof Other);
registerNativeBase(otherDesc, "RefCounted");

/** 第二参是 String / 实例 / null 都归到引擎那一句（三格都量过，实测 c00 / c04 / c06）。 */
const ARG = '[is-instance-of-arg] Error calling GDScript utility function "is_instance_of()": Invalid type argument for is_instance_of(), should be a TYPE_* constant, a class or a script.';
/** 越界的 int：39 就是 TYPE_MAX 那一格（实测 38 有读数、39 起是这一句，字面量与变量两形同句）。 */
const TYPE = '[is-instance-of-type] Error calling GDScript utility function "is_instance_of()": Invalid type argument for is_instance_of(), use TYPE_* constants for built-in types.';

const b = (v: Variant): string => String((v.v as boolean));
const code = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return `[${(e as { code?: string }).code ?? "?"}] ${(e as Error).message}`;
  }
};

describe("runtime · is_instance_of 一族", () => {
  it("三形各有实测口径", () => {
    const inst = V.object(new Pack());
    const sub = V.object(new PackSub());
    eq("267", "脚本类值：自己真、别人家假、基类真",
      `${b(gIsInstanceOf(inst, V.object(packDesc)))}|${b(gIsInstanceOf(inst, V.object(otherDesc)))}|${b(gIsInstanceOf(sub, V.object(packDesc)))}`,
      "true|false|true");
    eq("267", "TYPE_* 那一族比的是严格同型（24 = TYPE_OBJECT）",
      `${b(gIsInstanceOf(inst, I(24)))}|${b(gIsInstanceOf(inst, I(27)))}|${b(gIsInstanceOf(I(5), I(2)))}|${b(gIsInstanceOf(F(1.5), I(3)))}`,
      "true|false|true|true");
    eq("267", "引擎类值走 is 量过的那七支链",
      `${b(gIsInstanceOf(inst, nativeClass("RefCounted")))}|${b(gIsInstanceOf(inst, nativeClass("Object")))}|${b(gIsInstanceOf(inst, nativeClass("SceneTree")))}|${b(gIsInstanceOf(inst, nativeClass("MainLoop")))}`,
      "true|true|false|false");
    eq("267", "类值自己也能当第一参：GDScript 那份链（实测 p02 / p03 / p04）",
      `${b(gIsInstanceOf(V.object(packDesc), nativeClass("RefCounted")))}|${b(gIsInstanceOf(V.object(packDesc), nativeClass("GDScript")))}|${b(gIsInstanceOf(V.object(packDesc), nativeClass("SceneTree")))}`,
      "true|true|false");
    eq("267", "第一参不是对象一律假（null / int / String / RID 四格都量过）",
      `${b(gIsInstanceOf(V.nil(), V.object(packDesc)))}|${b(gIsInstanceOf(I(5), V.object(packDesc)))}|${b(gIsInstanceOf(S("x"), V.object(packDesc)))}`,
      "false|false|false");
  });

  it("失败的四形按实测走", () => {
    const inst = V.object(new Pack());
    eq("267", "第二参给 String 是运行期那一句", code(() => gIsInstanceOf(inst, S("A"))), ARG);
    eq("267", "第二参给 null 同句", code(() => gIsInstanceOf(inst, V.nil())), ARG);
    eq("267", "第二参给实例（自己的或别人的）同句",
      `${code(() => gIsInstanceOf(inst, inst)) === ARG}|${code(() => gIsInstanceOf(inst, V.object(new Other()))) === ARG}`,
      "true|true");
    eq("267", "TYPE_MAX（39）起就越界", code(() => gIsInstanceOf(inst, I(39))), TYPE);
    eq("267", "999 与 -1 同一句", `${code(() => gIsInstanceOf(inst, I(999))) === TYPE}|${code(() => gIsInstanceOf(inst, I(-1))) === TYPE}`, "true|true");
    eq("267", "38 那一格还在界内（实测读数是 false，不是报错）", b(gIsInstanceOf(inst, I(38))), "false");
    eq("267", "表外的引擎类值不猜", code(() => gIsInstanceOf(inst, nativeClass("Label"))),
      "[is-instance-of-class] is_instance_of() 的引擎类值只量过 is 那七支（收到 Label），不猜");
  });
});

class RootLike extends GdScriptObject {}
const rootDesc: ClassDesc = defineClass(RootLike, () => new RootLike(), (o: object) => o instanceof RootLike);
registerNativeBase(rootDesc, "SceneTree");
