/**
 * Dictionary 方法的元数在解析期就拦（S378）：49 名过裁判，存在的 20 名两侧都量到，不存在的 29 名归运行时那句。
 * 尺 `tmp/probe-dict/arity.mts`（一格一份脚本一次 spawn），读数 `tmp/probe-dict/compare22.txt` + 逐格原文 `tmp/probe-dict/arity-*.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).map((d) => d.message);
}

const H = "extends SceneTree\n\n";
const MOD = (body: string): string => `${H}func _initialize():\n\tvar d = {"k": 1}\n${body}\n\tquit()\n`;
const FEW = (n: string, min: number, got: number): string => `Too few arguments for "${n}()" call. Expected at least ${min} but received ${got}.`;
const MANY = (n: string, max: number, got: number): string => `Too many arguments for "${n}()" call. Expected at most ${max} but received ${got}.`;

describe("零参那一族：多给就拦", () => {
  it("逐名钉住", async () => {
    for (const n of ["size", "keys", "values", "is_empty", "hash", "clear", "sort", "is_read_only", "make_read_only"]) {
      // 一律用语句形：`clear` 是 void，套进 print 会先撞上取值那一句（那一格由 `VOID_DICT_METHODS` 管，不在本门）
      eq("378", `${n} 一参`, (await diags(MOD(`\td.${n}(1)`)))[0] ?? "没拒", MANY(n, 0, 1));
      eq("378", `${n} 零参合法`, await diags(MOD(`\td.${n}()`)), []);
    }
  });
});

describe("至少一参那一族：少给就拦", () => {
  it("逐名钉住", async () => {
    for (const n of ["has", "erase", "find_key", "assign", "has_all"]) {
      eq("378", `${n} 零参`, (await diags(MOD(`\tprint(d.${n}())`)))[0] ?? "没拒", FEW(n, 1, 0));
    }
  });
});

describe("带默认实参那一族：区间两头都钉", () => {
  it("get / get_or_add / merge / merged 是 [1,2]", async () => {
    for (const n of ["get", "get_or_add", "merge", "merged"]) {
      // `merge` 是 void：元数合法的那一格撞上的是取值那句（S404 量过），`get` / `get_or_add` / `merged` 有返回值、那一格才真空
      const legal = n === "merge" ? ['Cannot get return value of call to "merge()" because it returns "void".'] : [];
      eq("378", `${n} 零参`, (await diags(MOD(`\tprint(d.${n}())`)))[0] ?? "没拒", FEW(n, 1, 0));
      eq("378", `${n} 三参`, (await diags(MOD(`\tprint(d.${n}({}, true, 1))`)))[0] ?? "没拒", MANY(n, 2, 3));
      eq("378", `${n} 一参合法`, await diags(MOD(`\tprint(d.${n}({}))`)), legal);
      eq("378", `${n} 两参合法`, await diags(MOD(`\tprint(d.${n}({}, true))`)), legal);
    }
  });

  it("duplicate 是 [0,1]", async () => {
    eq("378", "duplicate 零参合法", await diags(MOD("\tprint(d.duplicate())")), []);
    eq("378", "duplicate 一参合法", await diags(MOD("\tprint(d.duplicate(true))")), []);
    eq("378", "duplicate 两参", (await diags(MOD("\tprint(d.duplicate(true, true))")))[0] ?? "没拒", MANY("duplicate", 1, 2));
  });

  it("recursive_equal 是 [2,2]：第二支是递归计数", async () => {
    eq("378", "一参", (await diags(MOD("\tprint(d.recursive_equal({}))")))[0] ?? "没拒", FEW("recursive_equal", 2, 1));
    eq("378", "零参", (await diags(MOD("\tprint(d.recursive_equal())")))[0] ?? "没拒", FEW("recursive_equal", 2, 0));
    eq("378", "三参", (await diags(MOD("\tprint(d.recursive_equal({}, 0, 0))")))[0] ?? "没拒", MANY("recursive_equal", 2, 3));
    eq("378", "两参合法", await diags(MOD("\tprint(d.recursive_equal({}, 0))")), []);
  });
});

describe("接收者的两种静态证明", () => {
  it("字面量直接当接收者", async () => {
    eq("378", "字面量接收者", (await diags(MOD('\tprint({"a": 1}.size(1))')))[0] ?? "没拒", MANY("size", 0, 1));
  });

  it("带标注的局部 var", async () => {
    eq("378", "标注接收者", (await diags(`${H}func _initialize():\n\tvar d: Dictionary = {}\n\tprint(d.size(1))\n\tquit()\n`))[0] ?? "没拒", MANY("size", 0, 1));
  });

  it("证不出来就不报：重新赋值过的名字与推断不出类型的接收者", async () => {
    eq("378", "被重新赋值过", await diags(MOD('\tvar x = {"a": 1}\n\tx = {"b": 2}\n\tprint(x.size(1))')), []);
    eq("378", "形参接收者", await diags(`${H}func f(d) -> void:\n\tprint(d.size(1))\n\nfunc _initialize():\n\tf({})\n\tquit()\n`), []);
  });

  it("表里没有的名字不猜元数", async () => {
    eq("378", "没量过的名字", await diags(MOD("\tprint(d.frobnicate(1, 2, 3))")), []);
  });

  it("形参标注与内部类字段同样在解析期拦（S391，读数 compare47/48）", async () => {
    eq("391", "形参标注 Dictionary", (await diags(`${H}func f(x: Dictionary):\n\tprint(x.size(1))\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("391", "内部类字段标注", (await diags(`${H}class Inner:\n\tvar x: Dictionary = {}\n\tfunc g():\n\t\tprint(x.size(1))\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("391", "内部类字段初值推断", (await diags(`${H}class Inner:\n\tvar x = {}\n\tfunc g():\n\t\tprint(x.size(1))\n`))[0] ?? "没拒", MANY("size", 0, 1));
    eq("391", "形参未标注", await diags(`${H}func f(x):\n\tprint(x.size(1))\n`), []);
  });
});
