// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(4);
      let a: number[] = [];
      rt.frameLine(5);
      for (let i of rt.rangeSeq([rt.V.int(5)])) {
        rt.frameLine(6);
        a.push(i);
      }
      rt.frameLine(7);
      rt.fast.rawArrInsertNum(a, 2, 9);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("n1 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 5))]));
      rt.frameLine(9);
      rt.fast.rawArrPushFrontNum(a, 7);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("n2 "), rt.V.int(rt.fast.rawArrGetNum(a, 0)), rt.V.str(" "), rt.V.int(a.length)]));
      rt.frameLine(11);
      rt.fast.rawArrRemoveAtNum(a, 0);
      rt.frameLine(12);
      a.pop();
      rt.frameLine(13);
      a.shift();
      rt.frameLine(14);
      rt.fast.rawArrRemoveAtNum(a, 1);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("n3 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 2))]));
      rt.frameLine(16);
      rt.fast.rawArrInsertNum(a, 99, 5);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("n4 "), rt.V.int(a.length)]));
      rt.frameLine(18);
      rt.fast.rawArrRemoveAtNum(a, (-1));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("n5 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 1))]));
      rt.frameLine(20);
      let s: string[] = [];
      rt.frameLine(21);
      s.push("x");
      rt.frameLine(22);
      s.push("y");
      rt.frameLine(23);
      rt.fast.rawArrInsertStr(s, 1, "z");
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("n6 "), rt.V.int(s.length), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 1)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 2))]));
      rt.frameLine(25);
      s.fill("w");
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("n7 "), rt.V.str(rt.fast.rawArrGetStr(s, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 2))]));
      rt.frameLine(27);
      rt.fast.rawArrClearStr(s);
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("n8 "), rt.V.int(s.length)]));
      rt.frameLine(29);
      let b: number[] = [1, 2];
      rt.frameLine(30);
      let st = rt.fast.rawArrInsertNum(b, 0, 3);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("n9 "), rt.V.int(st), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(b, 0)), rt.V.str(" "), rt.V.int(b.length)]));
      rt.frameLine(32);
      let bad = rt.fast.rawArrInsertNum(b, 9, 4);
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("n10 "), rt.V.int(bad)]));
      rt.frameLine(34);
      let d = rt.dictOf([]);
      rt.frameLine(35);
      {
        const _nv = rt.writeIdx(d, rt.V.int(1), rt.V.int(10));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(36);
      {
        const _nv = rt.writeIdx(d, rt.V.int(2), rt.V.int(20));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("n11 "), rt.method(d, "get", [rt.V.int(1)]), rt.V.str(" "), rt.method(d, "get", [rt.V.int(3), rt.V.int(99)]), rt.V.str(" "), rt.method(d, "get", [rt.V.int(2), rt.V.int(0)]), rt.V.str(" "), rt.method(d, "size", [])]));
      rt.frameLine(38);
      let sd = new Map<unknown, number>([]);
      rt.frameLine(39);
      sd.set("k", 5);
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("n12 "), rt.V.int(rt.fast.rawDictGetOrNum(sd, "k", 0)), rt.V.str(" "), rt.V.int(rt.fast.rawDictGetOrNum(sd, "j", 7))]));
      rt.frameLine(41);
      let mixed = rt.dictOf([]);
      rt.frameLine(42);
      {
        const _nv = rt.writeIdx(mixed, rt.V.int(1), rt.V.int(2));
        if (_nv !== null) mixed = _nv;
      }
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("n13 "), rt.method(mixed, "get", [rt.V.str("nope")]), rt.V.str(" "), rt.method(mixed, "size", [])]));
      rt.frameLine(44);
      let q: number[] = [1, 2, 3];
      rt.frameLine(45);
      rt.fast.rawArrInsertNum(q, (-1), 4);
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("n14 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 3))]));
      rt.frameLine(47);
      rt.fast.rawArrInsertNum(q, (-4), 5);
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("n15 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 1))]));
      rt.frameLine(49);
      rt.fast.rawArrRemoveAtNum(q, (-1));
      rt.frameLine(50);
      rt.fast.rawArrRemoveAtNum(q, (-2));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("n16 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 1))]));
      rt.frameLine(52);
      let only: number[] = [1];
      rt.frameLine(53);
      only.pop();
      rt.frameLine(54);
      only.shift();
      rt.frameLine(55);
      rt.fast.rawArrRemoveAtNum(only, 0);
      rt.frameLine(56);
      rt.fast.rawArrRemoveAtNum(only, 0);
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("n17 "), rt.V.int(only.length)]));
      rt.frameLine(58);
      let r: number[] = [1, 2, 3];
      rt.frameLine(59);
      r.push(4);
      rt.frameLine(60);
      r.reverse();
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("n18 "), rt.V.int(rt.fast.rawArrGetNum(r, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(r, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(r, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(r, 3))]));
      rt.frameLine(62);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
