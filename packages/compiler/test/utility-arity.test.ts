/**
 * `range` 与 `str` 的元数走的是**另一条句子通道**（S385）：既不是 `Too few` 也不是 `Too many`，
 * 而是 `Invalid call to [GDScript ]utility function "X()". Expected N argument(s).` —— 少了报下界那一位、多了报上界那一位。
 * 尺 `tmp/probe-void/{round1,round2}.mts`（语句形：上一轮把九支 void 包进 print，全被「取 void 的返回值」那句挡住了），
 * 读数 `tmp/probe-void/{compare33,compare34}.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";

const H = "extends SceneTree\n\n";
const TAIL = "\nfunc _initialize():\n\tquit()\n";

async function refuse(call: string): Promise<string> {
  try {
    emitModule(lower(await parseSource(`${H}func f():\n\t${call}\n${TAIL}`)), { runtimeImport: "rt", hostImport: "host" });
    return "收下了";
  } catch (e) {
    return e instanceof UnsupportedError ? e.message : `非 UnsupportedError: ${String(e)}`;
  }
}

describe("range 的两端", () => {
  it("零实参报下界那一元、四支以上报上界那三元", async () => {
    eq("385", "range()", await refuse("range()"), 'Invalid call to GDScript utility function "range()". Expected 1 argument(s).');
    eq("385", "range(1,2,3,4)", await refuse("range(1, 2, 3, 4)"), 'Invalid call to GDScript utility function "range()". Expected 3 argument(s).');
    eq("385", "range(1,2,3,4,5,6)", await refuse("range(1, 2, 3, 4, 5, 6)"), 'Invalid call to GDScript utility function "range()". Expected 3 argument(s).');
    for (const k of [1, 2, 3]) {
      eq("385", `range 的 ${String(k)} 元合法`, await refuse(`range(${Array.from({ length: k }, (unused, j) => String(j + 1)).join(", ")})`), "收下了");
    }
  });
});

describe("str 只有下界", () => {
  it("零实参那一句的前缀不带 GDScript，八支实参照收", async () => {
    eq("385", "str()", await refuse("str()"), 'Invalid call to utility function "str()". Expected 1 argument(s).');
    eq("385", "str(1)", await refuse("str(1)"), "收下了");
    eq("385", "str 八支", await refuse("str(1, 2, 3, 4, 5, 6, 7, 8)"), "收下了");
  });
});

describe("变元那三支不拦（量到过 8 支全收）", () => {
  it("print / push_error / push_warning 零支到八支都收下", async () => {
    for (const call of ["print()", "print(1, 2, 3, 4, 5)", "push_error()", "push_error(1, 2, 3, 4, 5, 6, 7, 8)", "push_warning()", "push_warning(1, 2, 3)"]) {
      eq("385", call, await refuse(call), "收下了");
    }
  });
});

describe("void 那一族九支的区间与闸门同句", () => {
  it("seed 恰一元，其余八支零元，多给一律 at most", async () => {
    const names = ["print_stack", "randomize", "get_stack", "randf", "randi", "rid_allocate_id"];
    eq("385", "seed 零参", await refuse("seed()"), 'Too few arguments for "seed()" call. Expected at least 1 but received 0.');
    eq("385", "seed 两参", await refuse("seed(1, 2)"), 'Too many arguments for "seed()" call. Expected at most 1 but received 2.');
    eq("385", "seed 一元", await refuse("seed(1)"), "收下了");
    for (const n of names) {
      eq("385", `${n} 一元`, await refuse(`${n}(1)`), `Too many arguments for "${n}()" call. Expected at most 0 but received 1.`);
      eq("385", `${n} 零元`, await refuse(`${n}()`), "收下了");
    }
  });
});
