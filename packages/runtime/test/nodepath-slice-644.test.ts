/** `NodePath.slice()` 发货（S643 ⑥ 留的那一笔）。读数 `tmp/probe644/`：两轮共 342 形装箱直调 + 20 形解析期，
 *  式子取 4.6.3 的 `NodePath::slice` —— 两界先夹到 `[-total, total]` 再折负，`extension_api` 给 `end` 的缺省是
 *  `2147483647`（不是 -1），所以缺省与显式 -1 是两形；绝对位只在 `begin === 0` 时保留。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { method } from "@gds2js/runtime/runtime/methods";
import { nodePathText, nodePathValue } from "@gds2js/runtime/runtime/class/identity/node-path";
import { F, I, S } from "./support/variants";

const say = (path: string, args: Variant[]): string => {
  try {
    const r = method(nodePathValue(path), "slice", args);
    const np = r.v as never;
    return `${nodePathText(np)}|n=${String(Number(method(r, "get_name_count", []).v))}|s=${String(Number(method(r, "get_subname_count", []).v))}|abs=${String(method(r, "is_absolute", []).v)}|empty=${String(method(r, "is_empty", []).v)}`;
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code}] ${err.message ?? ""}`;
  }
};

describe("runtime/methods · NodePath.slice 按 4.6.3 的整条算法（S644）", () => {
  it("begin > end 给空路径：引擎那一句是 core/templates/vector.h 的 ERROR，按口径不复刻", () => {
    eq("644", "a/b/c 的 (2,1)", say("a/b/c", [I(2), I(1)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "a/b/c 的 (3,1)", say("a/b/c", [I(3), I(1)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "a/b:1/2 的 (3,-1)", say("a/b:1/2", [I(3), I(-1)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "/a/b/c 的 (4,0) 连绝对位一起丢", say("/a/b/c", [I(4), I(0)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "a 的 (1,-1)", say("a", [I(1), I(-1)]), "|n=0|s=0|abs=false|empty=true");
  });

  it("绝对位只在 begin === 0 保留；空名字表 + 绝对位就是 /", () => {
    eq("644", "/a/b/c 的 (0)", say("/a/b/c", [I(0)]), "/a/b/c|n=3|s=0|abs=true|empty=false");
    eq("644", "/a/b/c 的 (1) 掉绝对位", say("/a/b/c", [I(1)]), "b/c|n=2|s=0|abs=false|empty=false");
    eq("644", "/a/b/c 的 (0,0) 只剩绝对位", say("/a/b/c", [I(0), I(0)]), "/|n=0|s=0|abs=true|empty=false");
    eq("644", "/a/b/c 的 (1,1) 是空路径", say("/a/b/c", [I(1), I(1)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "/a/b/c 的 (0,1)", say("/a/b/c", [I(0), I(1)]), "/a|n=1|s=0|abs=true|empty=false");
    eq("644", "/a/b/c 的 (-3) 折回 0，绝对位保住", say("/a/b/c", [I(-3)]), "/a/b/c|n=3|s=0|abs=true|empty=false");
    eq("644", "空路径怎么切都还是空", say("", [I(1)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "/ 怎么切都还是 /", say("/", [I(5)]), "/|n=0|s=0|abs=true|empty=false");
    eq("644", "/ 的 (0,-1)", say("/", [I(0), I(-1)]), "/|n=0|s=0|abs=true|empty=false");
  });

  it("名字与子名共用一条下标轴，按 name_count 断两段", () => {
    eq("644", "a/b:1/2 的 (0) 缺省到 total", say("a/b:1/2", [I(0)]), "a/b:1/2|n=2|s=1|abs=false|empty=false");
    eq("644", "a/b:1/2 的 (0,-1) 显式 -1 少一格", say("a/b:1/2", [I(0), I(-1)]), "a/b|n=2|s=0|abs=false|empty=false");
    eq("644", "a/b:1/2 的 (2) 只剩子名", say("a/b:1/2", [I(2)]), ":1/2|n=0|s=1|abs=false|empty=false");
    eq("644", "a/b:1/2 的 (1,3)", say("a/b:1/2", [I(1), I(3)]), "b:1/2|n=1|s=1|abs=false|empty=false");
    eq("644", "a/b:1/2 的 (1,2) 不落进子名", say("a/b:1/2", [I(1), I(2)]), "b|n=1|s=0|abs=false|empty=false");
    eq("644", "/a/b/c:1/2 的 (0,3) 切掉子名也切掉绝对位", say("/a/b/c:1/2", [I(0), I(3)]), "/a/b/c|n=3|s=0|abs=true|empty=false");
    eq("644", "/a/b/c:1/2 的 (3)", say("/a/b/c:1/2", [I(3)]), ":1/2|n=0|s=1|abs=false|empty=false");
    eq("644", "aa/bb/cc:dd/ee 的 (2,4)", say("aa/bb/cc:dd/ee", [I(2), I(4)]), "cc:dd/ee|n=1|s=1|abs=false|empty=false");
  });

  it("越出总长一律夹住；负数先夹再折", () => {
    eq("644", "a/b/c 的 (4)", say("a/b/c", [I(4)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "a/b/c 的 (0,4)", say("a/b/c", [I(0), I(4)]), "a/b/c|n=3|s=0|abs=false|empty=false");
    eq("644", "a/b/c 的 (-4) 夹到 0", say("a/b/c", [I(-4)]), "a/b/c|n=3|s=0|abs=false|empty=false");
    eq("644", "a/b/c 的 (-2,-1)", say("a/b/c", [I(-2), I(-1)]), "b|n=1|s=0|abs=false|empty=false");
    eq("644", "a 的 (0,-2) 夹到 0", say("a", [I(0), I(-2)]), "|n=0|s=0|abs=false|empty=true");
    eq("644", "a/b[1] 的名字原样带着方括号", say("a/b[1]", [I(1)]), "b[1]|n=1|s=0|abs=false|empty=false");
  });

  it("装箱实参位：int / bool / float 收下，五源给运行期那一句、位号取第一个坏位", () => {
    eq("644", "bool 折 1", say("a/b/c", [V.bool(true)]), "b/c|n=2|s=0|abs=false|empty=false");
    eq("644", "float 截断", say("a/b/c", [F(1.5)]), "b/c|n=2|s=0|abs=false|empty=false");
    eq("644", "第二界 float 截断", say("a/b/c", [I(0), F(2.7)]), "a/b|n=2|s=0|abs=false|empty=false");
    eq("644", "String 第一坏位", say("a/b/c", [S("a"), S("b")]), "[node-path-slice-arg] Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument 1 from String to int.");
    eq("644", "第二位的 String", say("a/b/c", [I(1), S("b")]), "[node-path-slice-arg] Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument 2 from String to int.");
    eq("644", "Nil", say("a/b/c", [V.nil()]), "[node-path-slice-arg] Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument 1 from Nil to int.");
    eq("644", "StringName", say("a/b/c", [V.stringName("a")]), "[node-path-slice-arg] Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument 1 from StringName to int.");
    eq("644", "NodePath", say("a/b/c", [nodePathValue("a")]), "[node-path-slice-arg] Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument 1 from NodePath to int.");
  });

  it("元数句仍是声明的全部数（S642 那一条的 slice 形）", () => {
    eq("644", "零支", say("a/b/c", []), "[node-path-arity] Invalid call to function 'slice' in base 'NodePath'. Expected 2 argument(s).");
    eq("644", "三支", say("a/b/c", [I(1), I(2), I(3)]), "[node-path-arity] Invalid call to function 'slice' in base 'NodePath'. Expected 2 argument(s).");
  });
});
