import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function code(src: string): Promise<string> {
  try {
    analyze(lower(await parseSource(src)));
    return "没抛";
  } catch (e) {
    return e instanceof UnsupportedError ? e.code : `不是响亮拒：${String(e)}`;
  }
}

describe("全局枚举下标", () => {
  it("简单枚举名与点式枚举名的下标都响亮拒", async () => {
    eq("enum-subscript", "简单名", await code('extends SceneTree\nfunc _initialize():\n\tprint(Error["OK"])\n\tquit()\n'), "global-enum-subscript");
    eq("enum-subscript", "点式名", await code('extends SceneTree\nfunc _initialize():\n\tprint(Variant.Type["TYPE_INT"])\n\tquit()\n'), "global-enum-subscript");
  });
});
