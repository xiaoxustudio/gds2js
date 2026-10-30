/** 名册对账补出来的四处（S639）：StringName 与 String 差的那九名、`NodePath.slice`、`Color.from_rgba8`。
 *  读数 `tmp/probe639/names.gd`（二十一格）与 `call.gd`（三格），尺 `gen639.mjs` / `diff639.mts`（与本机 4.6.3 的 `--dump-extension-api` 导出逐名对账）。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { nodePathValue } from "@gds2js/runtime/runtime/class/identity/node-path";
import { GColor } from "@gds2js/runtime/runtime/class/color/color";
import { attribute, method } from "@gds2js/runtime/runtime/methods";

const read = (v: Variant, name: string): string => {
  try {
    return show(attribute(v, name) as Variant);
  } catch (e) {
    return (e as Error).message;
  }
};

const sn = () => V.stringName("a b");
const col = () => V.object(new GColor(1, 0, 0, 1));

describe("runtime/faces · 名册对账补的四处（S639）", () => {
  it("StringName 的属性读：三名给绑定 Callable，六名给表外那句", () => {
    eq("639", "uri_file_decode", read(sn(), "uri_file_decode"), "StringName::uri_file_decode");
    eq("639", "is_valid_ascii_identifier", read(sn(), "is_valid_ascii_identifier"), "StringName::is_valid_ascii_identifier");
    eq("639", "is_valid_unicode_identifier", read(sn(), "is_valid_unicode_identifier"), "StringName::is_valid_unicode_identifier");
    for (const n of ["chr", "num", "num_int64", "num_scientific", "num_uint64", "humanize_size"]) {
      eq("639", `${n} 是表外名`, read(sn(), n), `Invalid access to property or key '${n}' on a base object of type 'StringName'.`);
    }
  });
  it("六名的调用给 Nonexistent，不再拿 String 的派发凑", () => {
    const say = (name: string, args: Variant[]): string => {
      try {
        method(sn(), name, args);
        return "没抛";
      } catch (e) {
        return (e as Error).message;
      }
    };
    eq("639", "num", say("num", [V.int(65)]), "Invalid call. Nonexistent function 'num' in base 'StringName'.");
    eq("639", "humanize_size", say("humanize_size", [V.int(1)]), "Invalid call. Nonexistent function 'humanize_size' in base 'StringName'.");
    eq("639", "chr", say("chr", []), "Invalid call. Nonexistent function 'chr' in base 'StringName'.");
  });
  it("NodePath.slice 与 Color.from_rgba8 的成员名当值照引擎给", () => {
    eq("639", "np.slice", read(nodePathValue("a/b[1]"), "slice"), "NodePath::slice");
    eq("639", "c.from_rgba8", read(col(), "from_rgba8"), "Color::from_rgba8");
  });
});
