/**
 * `and` / `or` 的**值恒为 bool**（S398）：引擎两侧都折成布尔，不把实参原样递出去 —— 出货此前是 Python 式（`1 and 2` 给 `2`）。
 * 尺 `tmp/probe-andor/round4.mts`，读数 `compare65.txt`，出货端到端 27 格对照 `tmp/probe-andor/ours.mts` 不合 0 格。
 * 短路照旧：左支已经定案时右支根本不求值（那六格用 `side()` 的打印凭据钉住）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { and, or } from "@gds2js/runtime/runtime/builtins";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";

const BOOL = 1;

function arr(items: Variant[]): Variant {
  return V.array(GArray.of(items));
}

function dict(pairs: Array<[Variant, Variant]>): Variant {
  return dictOf(pairs);
}

const CELLS: Array<[string, (l: Variant, r: () => Variant) => Variant, Variant, Variant, string]> = [
  ["1 and 2", and, V.int(1), V.int(2), "true"],
  ["2 and 1", and, V.int(2), V.int(1), "true"],
  ["0 and 3", and, V.int(0), V.int(3), "false"],
  ["1 and 0", and, V.int(1), V.int(0), "false"],
  ["0 or 3", or, V.int(0), V.int(3), "true"],
  ["3 or 0", or, V.int(3), V.int(0), "true"],
  ["1.5 and 0", and, V.float(1.5), V.int(0), "false"],
  ["0.0 or 1.5", or, V.float(0), V.float(1.5), "true"],
  ["\"ab\" and 1", and, V.str("ab"), V.int(1), "true"],
  ["\"\" or 1", or, V.str(""), V.int(1), "true"],
  ["[1] and {1: 1}", and, arr([V.int(1)]), dict([[V.int(1), V.int(1)]]), "true"],
  ["[] or {}", or, arr([]), V.dict(new GDict()), "false"],
  ["true and 7", and, V.bool(true), V.int(7), "true"],
  ["0.0 and 7", and, V.float(0), V.int(7), "false"],
];

describe("and / or 的值是 bool", () => {
  for (const [label, fn, l, r, want] of CELLS) {
    it(label, () => {
      const v = fn(l, () => r);
      eq("398", `${label} 的打印`, show(v), want);
      eq("398", `${label} 的 typeof`, Number(typeOf(v).v), BOOL);
    });
  }
});

describe("短路那一侧", () => {
  const S: Array<[string, (l: Variant, r: () => Variant) => Variant, Variant, string, boolean]> = [
    ["0 and side()", and, V.int(0), "false", false],
    ["1 and side()", and, V.int(1), "true", true],
    ["1 or side()", or, V.int(1), "true", false],
    ["0 or side()", or, V.int(0), "true", true],
    ["false and side()", and, V.bool(false), "false", false],
    ["true or side()", or, V.bool(true), "true", false],
  ];
  for (const [label, fn, l, want, ran] of S) {
    it(label, () => {
      let calls = 0;
      const v = fn(l, () => {
        calls++;
        return V.int(1);
      });
      eq("398", `${label} 的打印`, show(v), want);
      eq("398", `${label} 的 typeof`, Number(typeOf(v).v), BOOL);
      eq("398", `${label} 右支求值次数`, calls, ran ? 1 : 0);
    });
  }
});
