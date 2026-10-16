/**
 * 只读容器那一族的写面（S403，§6 第 65 条结清）：`make_read_only()` 之后引擎分三种反应 ——
 * (a) 下标赋值打断脚本（字典那句之前还多一块 ERROR，数组没有），
 * (b) 方法写只推一块 `ERROR: <面> is in read-only state.`、不打断、内容不变（`at:` 那行按每支自己的 C++ 文件与行号），
 * (c) 三件意外：`assign` 照样整个换掉内容、`get_or_add` 返回默认值但不写入、`Array.resize` 除推 ERROR 还返回 23（`ERR_READ_ONLY`）。
 * 尺 `tmp/probe-readonly/round1.mts` 与 `tmp/probe-readonly2/{round1,round2,round3,round4}.mts`，读数 `tmp/probe-readonly2/compare{71,72,73}.txt`，
 * 出货端到端 11 格对照 `tmp/probe-readonly2/ours.mts` 不合 0 格。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { index, method, setIndex, writeIdx } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";

function arr(items: Variant[]): GArray {
  return GArray.of(items);
}

function capture(fn: () => unknown): { got: unknown; err: string; threw: string } {
  const chunks: string[] = [];
  const write = process.stderr.write.bind(process.stderr);
  let threw = "";
  process.stderr.write = ((s: string | Uint8Array): boolean => {
    chunks.push(String(s));
    return true;
  }) as typeof process.stderr.write;
  try {
    var got = fn();
  } catch (e) {
    threw = e instanceof Error ? e.message : String(e);
  } finally {
    process.stderr.write = write;
  }
  return { got, err: chunks.join("").replace(/\r/g, ""), threw };
}

const RO_ARR = (): Variant => {
  const a = V.array(arr([V.int(1), V.int(2)]));
  method(a, "make_read_only", []);
  return a;
};

const RO_DICT = (): Variant => {
  const d = V.dict(new GDict());
  d.v instanceof GDict && (d.v as GDict).set(V.str("a"), V.int(1));
  method(d, "make_read_only", []);
  return d;
};

const BLOCKS: Array<[string, Variant[], string, string]> = [
  ["append", [V.int(3)], "push_back (core/variant/array.cpp:283)", "[1, 2]"],
  ["push_back", [V.int(3)], "push_back (core/variant/array.cpp:283)", "[1, 2]"],
  ["push_front", [V.int(3)], "push_front (core/variant/array.cpp:775)", "[1, 2]"],
  ["insert", [V.int(0), V.int(3)], "insert (core/variant/array.cpp:326)", "[1, 2]"],
  ["erase", [V.int(1)], "erase (core/variant/array.cpp:348)", "[1, 2]"],
  ["remove_at", [V.int(0)], "remove_at (core/variant/array.cpp:505)", "[1, 2]"],
  ["pop_back", [], "pop_back (core/variant/array.cpp:782)", "[1, 2]"],
  ["pop_front", [], "pop_front (core/variant/array.cpp:793)", "[1, 2]"],
  ["pop_at", [V.int(0)], "pop_at (core/variant/array.cpp:803)", "[1, 2]"],
  ["clear", [], "clear (core/variant/array.cpp:125)", "[1, 2]"],
  ["resize", [V.int(4)], "resize (core/variant/array.cpp:307)", "[1, 2]"],
  ["sort", [], "sort (core/variant/array.cpp:734)", "[1, 2]"],
  ["reverse", [], "reverse (core/variant/array.cpp:770)", "[1, 2]"],
  ["shuffle", [], "shuffle (core/variant/array.cpp:744)", "[1, 2]"],
  ["fill", [V.int(9)], "fill (core/variant/array.cpp:341)", "[1, 2]"],
  ["append_array", [V.array(arr([V.int(3)]))], "append_array (core/variant/array.cpp:290)", "[1, 2]"],
];

const RET23 = new Set(["resize", "insert"]);

describe("只读数组的方法写", () => {
  for (const [name, args, at, after] of BLOCKS) {
    it(`${name}() 只推一块 ERROR`, () => {
      const a = RO_ARR();
      const r = capture(() => method(a, name, args));
      eq("403", `${name} 那句原文`, r.err.includes(`ERROR: Array is in read-only state.\n   at: ${at}`), true);
      eq("403", `${name} 的返回`, show(r.got as Variant), RET23.has(name) ? "23" : "<null>");
      eq("403", `${name} 之后内容不变`, show(a), after);
      eq("403", `${name} 不中断`, r.threw, "");
    });
  }
});

const DICT_BLOCKS: Array<[string, Variant[], string, string]> = [
  ["clear", [], "clear (core/variant/dictionary.cpp:315)", '{ "a": 1 }'],
  ["erase", [V.str("a")], "erase (core/variant/dictionary.cpp:255)", '{ "a": 1 }'],
  ["merge", [V.dict(new GDict())], "merge (core/variant/dictionary.cpp:337)", '{ "a": 1 }'],
  ["sort", [], "sort (core/variant/dictionary.cpp:332)", '{ "a": 1 }'],
  ["set", [V.str("a"), V.int(2)], "set (core/variant/dictionary.cpp:207)", '{ "a": 1 }'],
];

describe("只读字典的方法写", () => {
  for (const [name, args, at, after] of DICT_BLOCKS) {
    it(`${name}() 只推一块 ERROR`, () => {
      const d = RO_DICT();
      const r = capture(() => method(d, name, args));
      eq("403", `${name} 那句原文`, r.err.includes(`ERROR: Dictionary is in read-only state.\n   at: ${at}`), true);
      eq("403", `${name} 之后内容不变`, show(d), after);
    });
  }
});

describe("三件意外", () => {
  it("字典 assign 照样整个换掉内容，换完仍只读", () => {
    const d = RO_DICT();
    const next = V.dict(new GDict());
    (next.v as GDict).set(V.str("z"), V.int(2));
    const r = capture(() => method(d, "assign", [next]));
    eq("403", "assign 不打断也不推句", r.threw + r.err, "");
    eq("403", "assign 之后的内容", show(d), '{ "z": 2 }');
    eq("403", "assign 之后仍只读", show(method(d, "is_read_only", [])), "true");
  });
  it("数组 assign 照样整个换掉内容，换完仍只读", () => {
    const a = RO_ARR();
    const r = capture(() => method(a, "assign", [V.array(arr([V.int(3)]))]));
    eq("403", "assign 不打断也不推句", r.threw + r.err, "");
    eq("403", "assign 之后的内容", show(a), "[3]");
    eq("403", "assign 之后仍只读", show(method(a, "is_read_only", [])), "true");
  });
  it("get_or_add 返回默认值但不写入", () => {
    const d = RO_DICT();
    const r = capture(() => method(d, "get_or_add", [V.str("z"), V.int(2)]));
    eq("403", "返回值是默认值", show(r.got as Variant), "2");
    eq("403", "没推句也没打断", r.threw + r.err, "");
    eq("403", "size 仍是 1", show(method(d, "size", [])), "1");
    eq("403", "内容不变", show(d), '{ "a": 1 }');
  });
  it("get_or_add 命中已有键照旧给值", () => {
    const d = RO_DICT();
    eq("403", "已有键给的是原值", show(method(d, "get_or_add", [V.str("a"), V.int(9)])), "1");
  });
});

describe("下标赋值那两支", () => {
  it("数组只读：只有 SCRIPT ERROR 那一句，脚本打断", () => {
    const a = RO_ARR();
    const r = capture(() => setIndex(a, V.int(0), V.int(9)));
    eq("403", "数组那句", r.threw, "Invalid assignment on read-only value (on base: 'Array').");
    eq("403", "数组不推 ERROR 块", r.err, "");
    eq("403", "内容不变", show(a), "[1, 2]");
  });
  it("字典只读：先一块 ERROR 再那一句，脚本打断", () => {
    const d = RO_DICT();
    const r = capture(() => setIndex(d, V.str("a"), V.int(2)));
    eq("403", "字典那句", r.threw, "Invalid assignment on read-only value (on base: 'Dictionary').");
    eq("403", "字典先推 ERROR 块", r.err.startsWith("ERROR: Dictionary is in read-only state.\n   at: set (core/variant/dictionary.cpp:207)"), true);
    eq("403", "内容不变", show(d), '{ "a": 1 }');
  });
  it("只读数组的越界写给的是只读那句，不是越界那句", () => {
    const a = RO_ARR();
    eq("403", "越界写的句", capture(() => setIndex(a, V.int(2), V.int(5))).threw, "Invalid assignment on read-only value (on base: 'Array').");
  });
});

describe("数组下标越界那两句", () => {
  it("读：Invalid access of index", () => {
    const a = V.array(arr([V.int(1), V.int(2)]));
    eq("403", "正越界", capture(() => index(a, V.int(5))).threw, "Invalid access of index '5' on a base object of type: 'Array'.");
    eq("403", "负越界", capture(() => index(a, V.int(-3))).threw, "Invalid access of index '-3' on a base object of type: 'Array'.");
    eq("403", "负合法照读", show(index(a, V.int(-1))), "2");
  });
  it("写：Invalid assignment of index 带写入值的型", () => {
    const a = V.array(arr([V.int(1), V.int(2)]));
    eq("403", "写 int", capture(() => writeIdx(a, V.int(2), V.int(5))).threw, "Invalid assignment of index '2' (on base: 'Array') with value of type 'int'.");
    eq("403", "写 float", capture(() => writeIdx(a, V.int(5), V.float(2.5))).threw, "Invalid assignment of index '5' (on base: 'Array') with value of type 'float'.");
    eq("403", "写 bool", capture(() => writeIdx(a, V.int(5), V.bool(true))).threw, "Invalid assignment of index '5' (on base: 'Array') with value of type 'bool'.");
    eq("403", "写负越界", capture(() => writeIdx(a, V.int(-3), V.int(9))).threw, "Invalid assignment of index '-3' (on base: 'Array') with value of type 'int'.");
    const t = V.array(arr([V.str("x")]));
    (t.v as GArray).stampElem("String");
    eq("403", "定形数组的基名带元素型", capture(() => writeIdx(t, V.int(3), V.str("yy"))).threw, "Invalid assignment of index '3' (on base: 'Array[String]') with value of type 'String'.");
  });
});

describe("只读是浅的、拷贝出去都可写", () => {
  it("默认 false，置位后 true，重复置位不响", () => {
    const a = V.array(arr([V.int(1)]));
    eq("403", "默认", show(method(a, "is_read_only", [])), "false");
    method(a, "make_read_only", []);
    method(a, "make_read_only", []);
    eq("403", "置位两次仍 true", show(method(a, "is_read_only", [])), "true");
  });
  it("嵌套那层不受影响", () => {
    const inner = arr([V.int(1)]);
    const d = V.dict(new GDict());
    (d.v as GDict).set(V.str("a"), V.array(inner));
    method(d, "make_read_only", []);
    const innerV = V.array(inner);
    const r = capture(() => method(innerV, "append", [V.int(2)]));
    eq("403", "内层写不推句也不打断", r.threw + r.err, "");
    eq("403", "内层写进去的内容", show(innerV), "[1, 2]");
    eq("403", "内层自己不是只读", show(method(innerV, "is_read_only", [])), "false");
  });
  it("duplicate 与 slice 出去都可写", () => {
    const roOf = (v: Variant): boolean => method(v, "is_read_only", []).v === true;
    const a = RO_ARR();
    eq("403", "duplicate() 的副本可写", roOf(method(a, "duplicate", [])), false);
    eq("403", "duplicate(true) 的副本可写", roOf(method(a, "duplicate", [V.bool(true)])), false);
    eq("403", "slice() 的结果可写", roOf(method(a, "slice", [V.int(0)])), false);
    eq("403", "原件仍只读", roOf(a), true);
  });
});
