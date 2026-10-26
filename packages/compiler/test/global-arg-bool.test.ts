/**
 * bool 字面量进**全局函数数值位**：引擎拒哪几位、收哪几位（S362）。
 * 尺 `tmp/probe-argtype/fold37.mts`（把 `GLOBAL_ARG_TYPES` 的 64 个函数、101 个数值位逐位塞 `false`，一格一份脚本一次 spawn）
 * 与 `fold38.mts` / `fold39.mts`（补「跟第一参走」的第三位与 bool 当第一参的样子），读数 `tmp/probe-argtype/bool-slot.txt`。
 * 结论两面都钉：**101 位里只有 `max` / `min` 的每一位与 `wrap` 的第一位拒 bool**，其余 97 格引擎照收（`absf(false)` → 0.0），
 * 而 `clamp` 的第一参是 bool 时后续位反过来期望 bool。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function firstDiag(call: string): Promise<string> {
  const src = `extends SceneTree\n\nfunc _initialize():\n\tprint("A|", ${call})\n\tquit()\n`;
  const diags = analyze(lower(await parseSource(src))).diagnostics;
  return diags.length === 0 ? "无诊断" : diags[0]!.message;
}

const SENT = (name: string, pos: number, want: string, got: string): string =>
  `Invalid argument for "${name}()" function: argument ${pos} should be "${want}" but is "${got}".`;

/** 引擎逐格拒的读数（`bool-slot.txt` 的 16 格 + `fold38` / `fold39` 补的位）。 */
const REFUSED: Array<[string, string]> = [
  ["max(false, 1.5)", SENT("max", 1, "float", "bool")],
  ["max(1.5, false)", SENT("max", 2, "float", "bool")],
  ["max(true, 2)", SENT("max", 1, "float", "bool")],
  ["min(1, true)", SENT("min", 2, "float", "bool")],
  ["min(false, false)", SENT("min", 1, "float", "bool")],
  ["wrap(false, 1, 2)", SENT("wrap", 1, "float", "bool")],
  ["wrap(1, false, 1)", SENT("wrap", 2, "int", "bool")],
  ["wrap(1, 2, false)", SENT("wrap", 3, "int", "bool")],
  ["wrap(1.5, 2.5, false)", SENT("wrap", 3, "float", "bool")],
  ["clamp(1, false, 1)", SENT("clamp", 2, "int", "bool")],
  ["clamp(1, 2, false)", SENT("clamp", 3, "int", "bool")],
  ["clamp(1.5, false, 1.5)", SENT("clamp", 2, "float", "bool")],
  ["clamp(1.5, 2.5, false)", SENT("clamp", 3, "float", "bool")],
  ["lerp(1, false, 0.5)", SENT("lerp", 2, "int", "bool")],
  ["lerp(1.5, false, 0.5)", SENT("lerp", 2, "float", "bool")],
  ["clamp(true, 1, 2)", SENT("clamp", 2, "bool", "int")],
  ["clamp(true, 1.5, 2)", SENT("clamp", 2, "bool", "float")],
  ["clamp(true, false, 1)", SENT("clamp", 3, "bool", "int")],
];

/** 引擎照收的那些形：第一行是 101 个数值位里的一种（bool 折成 0 / 1 参与运算），后几行是「跟第一参走」那族的两侧。 */
const ACCEPTED = [
  "absf(false)",
  "absi(false)",
  "acos(false)",
  "sqrt(false)",
  "angle_difference(false, 1.5)",
  "atan2(false, 1.5)",
  "posmod(false, 3)",
  "posmod(5, false)",
  "remap(false, 0, 1, 0, 1)",
  "move_toward(false, 1, 0.5)",
  "is_equal_approx(false, 0)",
  "lerp(1, 2, false)",
  "clamp(true, false, true)",
  "max(1, 2)",
  "wrap(1, 2, 3)",
];

/** 允许集那一族早就逐 kind 量过：bool 在 `abs` / `sign` / `lerp` 的第一位是真拒，句子整固定。 */
const ALLOW_LIST: Array<[string, string]> = [
  [
    "abs(true)",
    'Invalid argument for "abs()" function: Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".',
  ],
  [
    "sign(false)",
    'Invalid argument for "sign()" function: Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".',
  ],
  [
    "lerp(true, 2, 0.5)",
    'Invalid argument for "lerp()" function: Argument "from" must be "int", "float", "Vector2", "Vector3", "Vector4", "Color", "Quaternion", "Basis", "Transform2D", or "Transform3D".',
  ],
];

describe("compiler · bool 字面量在全局函数的数值位上", () => {
  for (const [call, want] of REFUSED) {
    it(`${call} 解析期拒`, async () => {
      eq("365", call, await firstDiag(call), want);
    });
  }

  for (const call of ACCEPTED) {
    it(`${call} 引擎收：一声不出`, async () => {
      eq("365", call, await firstDiag(call), "无诊断");
    });
  }

  for (const [call, want] of ALLOW_LIST) {
    it(`${call} 走允许集那一句`, async () => {
      eq("365", call, await firstDiag(call), want);
    });
  }
});
