/**
 * `clamp` / `lerp` / `wrap` 的容器字面量让位（S532）：这三支的槽是 Variant 型（「跟第一参走」），
 * 任一实参是 Array / Dictionary 字面量时引擎**整体 defer 到运行期**（`clamp(1,[],2)` / `wrap(1,[],2)` /
 * `lerp(1,[],0.5)` 都是 SCRIPT ERROR、解析期一句不发），我们此前在解析期发 `argument N should be …`。
 * 尺 `tmp/d6/s532.py` 十五格逐格比解析期句；加 `followContainer` 守卫后 0 分歧。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(expr: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc c():\n\tvar r = ${expr}\n`))).diagnostics.map((d) => d.message).sort();
}

const DEFER = [
  "clamp(1, [], 2)", "clamp(1, 2, [])", "clamp([], 1, 2)", "clamp(1, {}, 2)",
  "wrap(1, [], 2)", "wrap(1, 2, [])", "wrap([], 1, 2)", "wrap(1, {}, 2)",
  "lerp(1, [], 0.5)", "lerp(1, 2, [])", "lerp([], 2, 0.5)", "lerp(1, {}, 0.5)",
];

describe("clamp/wrap/lerp：容器字面量引擎 defer 到运行期，解析期不开口（S532）", () => {
  for (const expr of DEFER) {
    it(`${expr}：解析期收`, async () => {
      eq("532", expr, await msgs(expr), []);
    });
  }
});
