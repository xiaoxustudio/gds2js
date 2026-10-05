// 由 tools/ops-check.ts 机械搬迁：region 198-212, 213-224, 280-390, 819-826。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { fast } from "@gds2js/runtime/runtime/fast";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";
import { F, I } from "./support/variants";

describe("runtime/fast · 单态快路", () => {
  it("057 · 裸 a[-1] 读末格", async () => {
    eq("057", "裸 a[-1] 读末格", fast.rawArrGetNum([1, 2, 3], -1), 3);
    shouldThrow("057", "裸 a[3] 读越界", () => fast.rawArrGetNum([1, 2, 3], 3));
    const r = [1, 2, 3];
    fast.rawArrSetNum(r, -1, 9);
    eq("057", "裸 a[-1]=9", JSON.stringify(r), "[1,2,9]");
    const r2 = [1, 2, 3];
    shouldThrow("057", "裸 a[5]=9 写越界", () => fast.rawArrSetNum(r2, 5, 9));
    eq("057", "裸写越界后没被撑长", r2.length, 3);
    eq("057", "裸 g[-1][-1] 两层负索引", fast.rawArrGetNum2([[1, 2], [3, 4]], -1, -1), 4);
    const gg: number[][] = [[1, 2], [3, 4]];
    fast.rawArrSetNum2(gg, -1, 0, 7);
    eq("057", "裸 g[-1][0]=7", JSON.stringify(gg), "[[1,2],[7,4]]");
    shouldThrow("057", "裸网格内层写越界", () => fast.rawArrSetNum2([[1, 2]], 0, 5, 0));
  });

  it("147 · 字符串元素的读/写 helper 必须与数值那族共用同一套越界口径", async () => {
    eq("147", "裸字符串数组 a[-1] 读末格", fast.rawArrGetStr(["a", "b"], -1), "b");
    shouldThrow("147", "裸字符串数组 a[2] 读越界", () => fast.rawArrGetStr(["a", "b"], 2));
    const st = ["a", "b"];
    fast.rawArrSetStr(st, -1, "z");
    eq("147", "裸字符串数组 a[-1]=z", JSON.stringify(st), '["a","z"]');
    const st2 = ["a", "b"];
    shouldThrow("147", "裸字符串数组 a[5]=x 写越界", () => fast.rawArrSetStr(st2, 5, "x"));
    eq("147", "裸字符串数组写越界后没被撑长", st2.length, 2);
    eq("147", "裸字符串网格 g[-1][-1] 两层负索引", fast.rawArrGetStr2([["a", "b"], ["c", "d"]], -1, -1), "d");
  });

  it("step56 · 裸 get(k,def) 与装箱同值（命中）", async () => {
    type MutOp = { op: string; i?: number; v?: number };
    const runMut = (title: string, prog: MutOp[]): void => {
      const g = V.array(GArray.of([1, 2, 3].map((n) => V.int(n))));
      const a = [1, 2, 3];
      const box: string[] = [];
      const raw: string[] = [];
      for (const s of prog) {
        switch (s.op) {
          case "insert":
            box.push(show(method(g, "insert", [V.int(s.i!), V.int(s.v!)])));
            raw.push(String(fast.rawArrInsertNum(a, s.i!, s.v!)));
            break;
          case "remove_at":
            method(g, "remove_at", [V.int(s.i!)]);
            fast.rawArrRemoveAtNum(a, s.i!);
            box.push("·");
            raw.push("·");
            break;
          case "pop_at":
            method(g, "pop_at", [V.int(s.i!)]);
            fast.rawArrRemoveAtNum(a, s.i!);
            box.push("·");
            raw.push("·");
            break;
          case "pop_back":
            method(g, "pop_back", []);
            a.pop();
            box.push("·");
            raw.push("·");
            break;
          case "pop_front":
            method(g, "pop_front", []);
            a.shift();
            box.push("·");
            raw.push("·");
            break;
          case "push_front":
            method(g, "push_front", [V.int(s.v!)]);
            fast.rawArrPushFrontNum(a, s.v!);
            box.push("·");
            raw.push("·");
            break;
          case "push_back":
            method(g, "push_back", [V.int(s.v!)]);
            a.push(s.v!);
            box.push("·");
            raw.push("·");
            break;
          case "reverse":
            method(g, "reverse", []);
            a.reverse();
            box.push("·");
            raw.push("·");
            break;
          case "fill":
            method(g, "fill", [V.int(s.v!)]);
            a.fill(s.v!);
            box.push("·");
            raw.push("·");
            break;
          case "clear":
            method(g, "clear", []);
            fast.rawArrClearNum(a);
            box.push("·");
            raw.push("·");
            break;
          default:
            throw new Error(`未知的操作 ${s.op}`);
        }
      }
      eq("step56", title, `[${a.join(", ")}] ${raw.join(" ")}`, `${show(g)} ${box.join(" ")}`);
    };

    runMut("insert/remove_at/push_front/fill 混合", [
      { op: "insert", i: 1, v: 9 },
      { op: "push_front", v: 7 },
      { op: "remove_at", i: 0 },
      { op: "insert", i: -1, v: 4 },
      { op: "fill", v: 5 },
    ]);
    runMut("下标折算与越界状态码", [
      { op: "insert", i: 3, v: 4 },
      { op: "insert", i: 99, v: 5 },
      { op: "insert", i: -99, v: 6 },
      { op: "remove_at", i: -1 },
      { op: "remove_at", i: 9 },
      { op: "pop_at", i: -5 },
    ]);
    runMut("清空后再 pop 不炸", [
      { op: "pop_back" },
      { op: "pop_front" },
      { op: "clear" },
      { op: "pop_back" },
      { op: "push_front", v: 1 },
      { op: "clear" },
    ]);
    runMut("负下标折叠、push_back 与 reverse", [
      { op: "insert", i: -1, v: 4 },
      { op: "push_back", v: 5 },
      { op: "reverse" },
      { op: "insert", i: -5, v: 6 },
      { op: "remove_at", i: -1 },
    ]);
    const dm = new Map<string, number>([["k", 5]]);
    const gd = new GDict();
    gd.set(V.str("k"), V.int(5));
    const dg = V.dict(gd);
    eq("step56", "裸 get(k,def) 与装箱同值（命中）", String(fast.rawDictGetOrNum(dm, "k", 0)), show(method(dg, "get", [V.str("k"), V.int(0)])));
    eq("step56", "裸 get(k,def) 与装箱同值（缺键给默认）", String(fast.rawDictGetOrNum(dm, "j", 7)), show(method(dg, "get", [V.str("j"), V.int(7)])));
  });

  it("fast · iDiv 与 ops.div 一致", async () => {

    eq("fast", "iDiv 与 ops.div 一致", fast.iDiv(-7, 2), -3);
    eq("fast", "iMod 与 ops.mod 一致", fast.iMod(-7, 3), -1);
    eq("fast", "strInt vs strFloat", `${fast.strInt(1)}/${fast.strFloat(1)}`, "1/1.0");
    eq("fast", "eqDeep 与 ops.eq 一致", fast.eqDeep(I(1), F(1)), true);
    eq("fast", "truthyArr 与 ops.truthy 一致", fast.truthyArr(GArray.of([])), false);
    shouldThrow("fast", "iDiv 除零", () => fast.iDiv(1, 0));
  });
});
