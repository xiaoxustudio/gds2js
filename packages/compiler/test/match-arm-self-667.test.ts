// 手臂里的 `self.<名>`（S667，尺 `tmp/probe669/{t_self,t_selfprop}.gd` 与 `tmp/probe671/b_varattr.gd`）：
// 引擎在解析期发「必须是常量式」那句 —— 有这个名字、没这个名字、是方法，三格同句；此前我们收下并在运行期取值（`self.x` 还能匹中，掩盖型）。
// 基是变量的那一形量过是**放行**（`tmp/probe671/{a_dictvar,a_strvar,a_intvar}.gd`：引擎走到运行期才开口），`A.B` 与类常量也放行，闸门只拦 `self`。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const ARM_PATTERN = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';
const HEAD = "extends SceneTree\n\nenum Side { LEFT = 0, RIGHT = 1 }\n\nconst G = 3\n\nclass H:\n\tconst K = 7\n\nvar x = 1\n\nfunc foo():\n\treturn 1\n\nfunc _init():\n\tvar d: Dictionary = {}\n\tvar s: String = \"ab\"\n\tvar n = 1\n\tmatch 1:\n\t\t";
const src = (arm: string): string => `${HEAD}${arm}:\n\t\t\tprint(\"arm\")\n\t\t_:\n\t\t\tprint(\"default\")\n\tquit()\n`;

const REFUSED = ["self.x", "self.zzz", "self.foo"];
const PASSED = ["H.K", "Color.RED", "Vector2.ONE", "Side.RIGHT", "x", "G", "PI", "d.size", "s.length", "n.zzz"];

describe("lower · 手臂里的 self 属性读解析期拒", () => {
  it.each(REFUSED)("%s 发引擎那一句", async (arm) => {
    const tree = await parseSource(src(arm));
    let code = "";
    let message = "";
    try {
      lower(tree);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      code = err.code ?? "";
      message = err.message ?? "";
    }
    expect(code, arm).toBe("pattern-arm-runtime");
    expect(message, arm).toBe(ARM_PATTERN);
  });

  it.each(PASSED)("%s 不由这道闸拦（收下来或走别的判据）", async (arm) => {
    const tree = await parseSource(src(arm));
    let message = "(收)";
    try {
      lower(tree);
    } catch (e) {
      message = (e as Error).message ?? "";
    }
    expect(message === ARM_PATTERN, `${arm} -> ${message}`).toBe(false);
  });

  it("掺在式子里的 self 属性读照旧是 S666 那一格（同一句，别的判据）", async () => {
    const tree = await parseSource(src("1 + self.x"));
    let message = "(收)";
    try {
      lower(tree);
    } catch (e) {
      message = (e as Error).message ?? "";
    }
    expect(message).toBe(ARM_PATTERN);
  });
});
