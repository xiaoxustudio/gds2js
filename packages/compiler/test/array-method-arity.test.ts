/**
 * Array 方法的元数在解析期就拦（S379）：51 名过裁判，存在的 49 名两侧都量到，不存在的（`is_same`）归运行期那句。
 * 尺 `tmp/probe-arr/{round1,round2}.mts`（一格一份脚本一次 spawn），读数 `tmp/probe-arr/{compare23,compare24}.txt` + 逐格原文 `tmp/probe-arr/arity*.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message);
}

const H = "extends SceneTree\n\n";
const MOD = (body: string): string => `${H}func _initialize():\n\tvar a = [1, 2, 3]\n${body}\n\tquit()\n`;
const FEW = (n: string, min: number, got: number): string => `Too few arguments for "${n}()" call. Expected at least ${min} but received ${got}.`;
const MANY = (n: string, max: number, got: number): string => `Too many arguments for "${n}()" call. Expected at most ${max} but received ${got}.`;

// 一律用语句形：Array 这一面 void 方法多（`clear` / `sort` / `shuffle` …），套进 print 会先撞上取值那一句（那一族由 `VOID_ARRAY_METHODS` 管，不在本门）
const ZERO = ["back", "clear", "front", "get_typed_builtin", "get_typed_class_name", "get_typed_script", "hash", "is_empty", "is_read_only", "is_typed", "make_read_only", "max", "min", "pick_random", "pop_back", "pop_front", "reverse", "shuffle", "size", "sort"];
const ONE = ["all", "any", "append", "append_array", "assign", "count", "erase", "fill", "filter", "get", "has", "is_same_typed", "map", "pop_at", "push_back", "push_front", "remove_at", "resize", "sort_custom"];
const ONE_OR_TWO = ["bsearch", "find", "find_custom", "reduce", "rfind", "rfind_custom"];
// 实参**类型**那两句本门不管（`instance-arg-type` 那一族早就接了），所以「合法」那一格要给类型也对得上的实参
const P1 = "func(_x): return true";
const P2 = "func(_x, _y): return 0";
const LEGAL: Record<string, string[]> = {
  all: [P1], any: [P1], filter: [P1], map: [P1], reduce: [P1, "1"], find_custom: [P1, "1"], rfind_custom: [P1, "1"],
  sort_custom: [P2], append_array: ["[]"], assign: ["[]"], is_same_typed: ["[]"],
};
const legs = (n: string, k: number): string => {
  const l = LEGAL[n];
  if (l === undefined) return String(k);
  return l[Math.min(k, l.length) - 1] as string;
};

describe("零参那一族：多给就拦", () => {
  it("逐名钉住", async () => {
    for (const n of ZERO) {
      eq("379", `${n} 一参`, (await diags(MOD(`\ta.${n}(1)`)))[0] ?? "没拒", MANY(n, 0, 1));
      eq("379", `${n} 零参合法`, await diags(MOD(`\ta.${n}()`)), []);
    }
  });
});

describe("恰好一参那一族：两头都拦", () => {
  it("逐名钉住", async () => {
    for (const n of ONE) {
      eq("379", `${n} 零参`, (await diags(MOD(`\ta.${n}()`)))[0] ?? "没拒", FEW(n, 1, 0));
      eq("379", `${n} 一参合法`, await diags(MOD(`\ta.${n}(${legs(n, 1)})`)), []);
      eq("379", `${n} 三参`, (await diags(MOD(`\ta.${n}(1, 2, 3)`)))[0] ?? "没拒", MANY(n, 1, 3));
    }
  });
});

describe("带默认实参那一族：[1,2]", () => {
  it("逐名钉住", async () => {
    for (const n of ONE_OR_TWO) {
      eq("379", `${n} 零参`, (await diags(MOD(`\ta.${n}()`)))[0] ?? "没拒", FEW(n, 1, 0));
      eq("379", `${n} 一参合法`, await diags(MOD(`\ta.${n}(${legs(n, 1)})`)), []);
      eq("379", `${n} 两参合法`, await diags(MOD(`\ta.${n}(${legs(n, 1)}, ${legs(n, 2)})`)), []);
      eq("379", `${n} 四参`, (await diags(MOD(`\ta.${n}(1, 2, 3, 4)`)))[0] ?? "没拒", MANY(n, 2, 4));
    }
  });

  it("bsearch_custom 是 [2,3]", async () => {
    eq("379", "零参", (await diags(MOD("\ta.bsearch_custom()")))[0] ?? "没拒", FEW("bsearch_custom", 2, 0));
    eq("379", "一参", (await diags(MOD("\ta.bsearch_custom(1)")))[0] ?? "没拒", FEW("bsearch_custom", 2, 1));
    eq("379", "两参合法", await diags(MOD("\ta.bsearch_custom(1, func(x, y): return 0)")), []);
    eq("379", "三参合法", await diags(MOD("\ta.bsearch_custom(1, func(x, y): return 0, true)")), []);
    eq("379", "四参", (await diags(MOD("\ta.bsearch_custom(1, 2, 3, 4)")))[0] ?? "没拒", MANY("bsearch_custom", 3, 4));
  });
});

describe("其余三个区间", () => {
  it("insert 是 [2,2]", async () => {
    eq("379", "零参", (await diags(MOD("\ta.insert()")))[0] ?? "没拒", FEW("insert", 2, 0));
    eq("379", "一参", (await diags(MOD("\ta.insert(0)")))[0] ?? "没拒", FEW("insert", 2, 1));
    eq("379", "两参合法", await diags(MOD("\ta.insert(0, 9)")), []);
    eq("379", "三参", (await diags(MOD("\ta.insert(0, 9, 9)")))[0] ?? "没拒", MANY("insert", 2, 3));
  });

  it("duplicate 是 [0,1]", async () => {
    eq("379", "零参合法", await diags(MOD("\ta.duplicate()")), []);
    eq("379", "一参合法", await diags(MOD("\ta.duplicate(true)")), []);
    eq("379", "两参", (await diags(MOD("\ta.duplicate(true, true)")))[0] ?? "没拒", MANY("duplicate", 1, 2));
  });

  it("slice 是 [1,4]：上界比字典那族宽，`step` 与 `deep` 都在内", async () => {
    eq("379", "零参", (await diags(MOD("\ta.slice()")))[0] ?? "没拒", FEW("slice", 1, 0));
    for (const args of ["(1)", "(1, 2)", "(1, 2, 3)", "(1, 2, 3, 4)"]) {
      eq("379", `${args} 合法`, await diags(MOD(`\ta.slice${args}`)), []);
    }
    eq("379", "五参", (await diags(MOD("\ta.slice(1, 2, 3, 4, 5)")))[0] ?? "没拒", MANY("slice", 4, 5));
  });
});

describe("接收者的两种静态证明", () => {
  it("字面量直接当接收者", async () => {
    eq("379", "字面量接收者", (await diags(MOD("\ta = [1]\n\tprint([1, 2].size(1))")))[0] ?? "没拒", MANY("size", 0, 1));
  });

  it("带标注的局部 var（含带元素型的那一形）", async () => {
    eq("379", "标注接收者", (await diags(`${H}func _initialize():\n\tvar a: Array = []\n\ta.size(1)\n\tquit()\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("379", "带元素型的标注", (await diags(`${H}func _initialize():\n\tvar a: Array[int] = []\n\ta.size(1)\n\tquit()\n`))[0] ?? "没拒", MANY("size", 0, 1));
  });

  it("证不出来就不报：重新赋值过的名字与推断不出类型的接收者", async () => {
    eq("379", "被重新赋值过", await diags(MOD("\tvar x = [1]\n\tx = [2]\n\tx.size(1)")), []);
    eq("379", "形参接收者", await diags(`${H}func f(a) -> void:\n\ta.size(1)\n\nfunc _initialize():\n\tf([])\n\tquit()\n`), []);
  });

  it("表里没有的名字不猜元数", async () => {
    eq("379", "没量过的名字", await diags(MOD("\ta.frobnicate(1, 2, 3)")), []);
  });

  it("形参标注与内部类字段同样在解析期拦（S391，读数 compare47/48）", async () => {
    eq("391", "形参标注 Array", (await diags(`${H}func f(x: Array):\n\tx.size(1)\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("391", "形参标注定形 Array[int]", (await diags(`${H}func f(x: Array[int]):\n\tx.size(1)\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("391", "内部类字段标注", (await diags(`${H}class Inner:\n\tvar x: Array = []\n\tfunc g():\n\t\tx.size(1)\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("391", "内部类字段初值推断", (await diags(`${H}class Inner:\n\tvar x = []\n\tfunc g():\n\t\tx.size(1)\n`))[0] ?? "没拒", MANY("size", 0, 1));
  });
});
