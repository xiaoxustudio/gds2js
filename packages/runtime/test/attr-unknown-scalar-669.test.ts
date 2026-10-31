// 装箱轨属性读的**四型基**（S669，尺 `tmp/probe672/unknown.mts` 十一格两侧对读）：
// int / float / bool / Nil 的表外名此前发的是自述（`[attribute] 取属性 zzz 未实现（对象模型还没做完）` / `对 null 取属性 zzz`），
// 引擎四型同一句 `Invalid access to property or key 'zzz' on a base object of type 'T'.`；
// 同尺复验 String / StringName / NodePath / Vector2 / Color / Array / Dictionary 七型本就一字一样（不回归），
// 对象 / Callable / RID 那几型没量过，照旧响亮拒。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GColor } from "@gds2js/runtime/runtime/color";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { attribute } from "@gds2js/runtime/runtime/methods";

const SAY = (t: string): string => `Invalid access to property or key 'zzz' on a base object of type '${t}'.`;

const errText = (f: () => unknown): string => {
  try {
    return String(f());
  } catch (e) {
    return e instanceof UnsupportedError ? `[拒] ${String((e as Error).message)}` : String((e as Error).message);
  }
};

describe("runtime/属性读 · 四型基发引擎那句（S669）", () => {
  it("int / float / bool / Nil 四格逐字", () => {
    eq("669", "int 基", errText(() => attribute(V.int(1), "zzz")), SAY("int"));
    eq("669", "float 基", errText(() => attribute(V.float(1.5), "zzz")), SAY("float"));
    eq("669", "bool 基", errText(() => attribute(V.bool(true), "zzz")), SAY("bool"));
    eq("669", "Nil 基", errText(() => attribute(V.nil(), "zzz")), SAY("Nil"));
  });

  it("越出 2^53 的 int 载荷同一句", () => {
    eq("669", "bigint int", errText(() => attribute(V.int(2n ** 62n), "zzz")), SAY("int"));
  });

  it("量过同款句的七型不回归", () => {
    eq("669", "String 基", errText(() => attribute(V.str("ab"), "zzz")), SAY("String"));
    eq("669", "StringName 基", errText(() => attribute(V.stringName("ab"), "zzz")), SAY("StringName"));
    eq("669", "NodePath 基", errText(() => attribute(nodePathValue("a/b"), "zzz")), SAY("NodePath"));
    eq("669", "Vector2 基", errText(() => attribute(V.object(new GVector2(1, 2)), "zzz")), SAY("Vector2"));
    eq("669", "Color 基", errText(() => attribute(V.object(new GColor(1, 0, 0, 1)), "zzz")), SAY("Color"));
    eq("669", "Array 基", errText(() => attribute(V.array(GArray.of([])), "zzz")), SAY("Array"));
    eq("669", "Dictionary 基", errText(() => attribute(V.dict(new GDict()), "zzz")), SAY("Dictionary"));
  });
});
