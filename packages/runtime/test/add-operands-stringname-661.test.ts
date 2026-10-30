// `StringName + int` 走运行期那一句（S661，读数 `tmp/probe661/D_sn_variant.gd`：引擎给
// `Invalid operands 'StringName' and 'int' in operator '+'.`，此前我们发的是自己的 `[add-operands]` 自述）。
// 六型之外只登**量过的那一对**：反过来放的那一格没量，仍走响亮拒。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { ops } from "@gds2js/runtime/runtime/ops";
import { V } from "@gds2js/runtime/runtime/tags";
import { GdNodePath } from "@gds2js/runtime/runtime/class/identity/node-path";

const say = (a: Parameters<typeof ops.add>[0], b: Parameters<typeof ops.add>[1]): string => {
  try {
    return `值 ${JSON.stringify(ops.add(a, b))}`;
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code ?? "?"}] ${err.message ?? ""}`;
  }
};

describe("runtime/ops · StringName 掺 int 的加", () => {
  it("量过的那一对给引擎那句", () => {
    eq("661", "StringName + int", say(V.stringName("ab"), V.int(1)), "[add-operands] Invalid operands 'StringName' and 'int' in operator '+'.");
  });

  it("反向那一格没量过，仍响亮拒", () => {
    eq("661", "int + StringName", say(V.int(1), V.stringName("ab")), "[add-operands] + 不支持 int + StringName");
  });

  it("NodePath 掺 String 那一句不变", () => {
    eq("661", "NodePath + String", say(V.object(new GdNodePath(false, ["a"], [], false)), V.str("z")), "[add-operands] Invalid operands 'NodePath' and 'String' in operator '+'.");
  });
});
