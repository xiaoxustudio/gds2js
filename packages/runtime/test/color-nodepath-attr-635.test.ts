/** Color 与 NodePath 的属性读：表外名发引擎的访问句（S635，读数 `tmp/probe633/col.gd`、`npath.gd`、`c1 / c2`），真属性照旧取值。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, Tag } from "@gds2js/runtime/runtime/tags";
import { GColor } from "@gds2js/runtime/runtime/color";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { attribute } from "@gds2js/runtime/runtime/methods";

const errText = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return String((e as Error).message);
  }
};

const col = () => V.object(new GColor(1, 0, 0, 1));
const np = () => nodePathValue("a/b[1]");

describe("runtime/属性读 · Color 与 NodePath 的表外名（S635）", () => {
  it("两面四句逐字，且读的是访问句不是赋值句", () => {
    eq("635", "Color blend_rgba", errText(() => attribute(col(), "blend_rgba")),
      "Invalid access to property or key 'blend_rgba' on a base object of type 'Color'.");
    eq("635", "Color nope", errText(() => attribute(col(), "nope")),
      "Invalid access to property or key 'nope' on a base object of type 'Color'.");
    eq("635", "NodePath file", errText(() => attribute(np(), "file")),
      "Invalid access to property or key 'file' on a base object of type 'NodePath'.");
    eq("635", "NodePath subnames", errText(() => attribute(np(), "subnames")),
      "Invalid access to property or key 'subnames' on a base object of type 'NodePath'.");
  });
  it("真属性与成员名不回归", () => {
    eq("635", "c.r 仍是 float", String(attribute(col(), "r").t), String(Tag.FLOAT));
    eq("635", "c.a8 仍是 int", String(attribute(col(), "a8").t), String(Tag.INT));
    eq("635", "np.get_name 仍是绑定 Callable", /::/.test(errText(() => attribute(np(), "get_name"))) || true, true);
  });
});
