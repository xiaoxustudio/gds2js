// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare member: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.member = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(7)])), "int", true);
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
      rt.frameLine(7);
      let a = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(2.5), rt.V.float((-1.9)), rt.V.bool(true)])), "int", true);
      rt.frameLine(8);
      print(rt.showArgs([a]));
      rt.frameLine(9);
      rt.method(a, "append", [rt.V.int(3)]);
      rt.frameLine(10);
      rt.method(a, "append", [rt.V.float(4.9)]);
      rt.frameLine(11);
      rt.method(a, "append", [rt.V.str("s")]);
      rt.frameLine(12);
      rt.method(a, "append", [rt.V.nil()]);
      rt.frameLine(13);
      print(rt.showArgs([a]));
      rt.frameLine(14);
      print(rt.showArgs([rt.method(a, "pop_front", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.method(a, "pop_back", [])]));
      rt.frameLine(16);
      print(rt.showArgs([a]));
      rt.frameLine(17);
      print(rt.showArgs([rt.method(a, "count", [rt.V.int(1)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.method(a, "find", [rt.V.float(1)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.method(a, "has", [rt.V.float(1)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.method(a, "rfind", [rt.V.int(1)])]));
      rt.frameLine(21);
      rt.method(a, "insert", [rt.V.int(0), rt.V.float(2.2)]);
      rt.frameLine(22);
      print(rt.showArgs([a]));
      rt.frameLine(23);
      rt.method(a, "insert", [rt.V.int(0), rt.V.str("x")]);
      rt.frameLine(24);
      print(rt.showArgs([a]));
      rt.frameLine(25);
      let alias = a;
      rt.frameLine(26);
      {
        const _nv = rt.writeIdx(alias, rt.V.int(0), rt.V.float(9.8));
        if (_nv !== null) alias = _nv;
      }
      rt.frameLine(27);
      print(rt.showArgs([a]));
      rt.frameLine(28);
      {
        const _nv = rt.writeIdx(alias, rt.V.int(0), rt.V.str("no"));
        if (_nv !== null) alias = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([a]));
      rt.frameLine(30);
      rt.method(a, "resize", [rt.V.int(6)]);
      rt.frameLine(31);
      print(rt.showArgs([a]));
      rt.frameLine(32);
      rt.method(a, "resize", [rt.V.int(2)]);
      rt.frameLine(33);
      print(rt.showArgs([a]));
      rt.frameLine(34);
      rt.method(a, "fill", [rt.V.float(5.7)]);
      rt.frameLine(35);
      print(rt.showArgs([a]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(rt.method(a, "duplicate", [rt.V.bool(true)]), "pop_back", [])]));
      rt.frameLine(37);
      print(rt.showArgs([a]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(rt.method(a, "slice", [rt.V.int(0), rt.V.int(2)]), "pop_back", [])]));
      rt.frameLine(39);
      print(rt.showArgs([a]));
      rt.frameLine(40);
      let f = rt.stampArray(rt.V.array(rt.GArray.of([])), "float", true);
      rt.frameLine(41);
      rt.method(f, "append", [rt.V.int(1)]);
      rt.frameLine(42);
      rt.method(f, "append", [rt.V.bool(true)]);
      rt.frameLine(43);
      rt.method(f, "append", [rt.V.float(2.5)]);
      rt.frameLine(44);
      print(rt.showArgs([f]));
      rt.frameLine(45);
      let s = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.stringName("b")])), "String", true);
      rt.frameLine(46);
      print(rt.showArgs([s]));
      rt.frameLine(47);
      rt.method(s, "append", [rt.V.int(3)]);
      rt.frameLine(48);
      print(rt.showArgs([s]));
      rt.frameLine(49);
      let nm = rt.stampArray(rt.V.array(rt.GArray.of([])), "StringName", true);
      rt.frameLine(50);
      rt.method(nm, "append", [rt.V.str("x")]);
      rt.frameLine(51);
      rt.method(nm, "resize", [rt.V.int(3)]);
      rt.frameLine(52);
      print(rt.showArgs([nm]));
      rt.frameLine(53);
      let b = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), "bool", true);
      rt.frameLine(54);
      print(rt.showArgs([b]));
      rt.frameLine(55);
      rt.method(b, "append", [rt.V.str("t")]);
      rt.frameLine(56);
      rt.method(b, "append", [rt.V.float(2.5)]);
      rt.frameLine(57);
      print(rt.showArgs([b]));
      rt.frameLine(58);
      let v = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector2", true);
      rt.frameLine(59);
      rt.method(v, "resize", [rt.V.int(2)]);
      rt.frameLine(60);
      print(rt.showArgs([v]));
      rt.frameLine(61);
      rt.method(v, "append", [rt.V.int(1)]);
      rt.frameLine(62);
      print(rt.showArgs([v]));
      rt.frameLine(63);
      let na = rt.stampArray(rt.V.array(rt.GArray.of([])), "Array", true);
      rt.frameLine(64);
      rt.method(na, "resize", [rt.V.int(2)]);
      rt.frameLine(65);
      print(rt.showArgs([na]));
      rt.frameLine(66);
      let nd = rt.stampArray(rt.V.array(rt.GArray.of([])), "Dictionary", true);
      rt.frameLine(67);
      rt.method(nd, "resize", [rt.V.int(1)]);
      rt.frameLine(68);
      print(rt.showArgs([nd]));
      rt.frameLine(70);
      let filtered = rt.method(a, "filter", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(70);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)]);
      rt.frameLine(71);
      rt.method(filtered, "append", [rt.V.str("s")]);
      rt.frameLine(72);
      print(rt.showArgs([filtered]));
      rt.frameLine(73);
      let mapped = rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(73);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)]);
      rt.frameLine(74);
      rt.method(mapped, "append", [rt.V.str("s")]);
      rt.frameLine(75);
      print(rt.showArgs([mapped]));
      rt.frameLine(76);
      let joined = rt.ops.add(a, rt.V.array(rt.GArray.of([rt.V.int(1)])));
      rt.frameLine(77);
      rt.method(joined, "append", [rt.V.str("s")]);
      rt.frameLine(78);
      print(rt.showArgs([joined]));
      rt.frameLine(80);
      rt.method(a, "assign", [rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.float(3.5)]))]);
      rt.frameLine(81);
      print(rt.showArgs([a]));
      rt.frameLine(82);
      rt.method(a, "assign", [rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.str("s")]))]);
      rt.frameLine(83);
      print(rt.showArgs([a]));
      rt.frameLine(84);
      rt.method(a, "append_array", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("s")]))]);
      rt.frameLine(85);
      print(rt.showArgs([a]));
      rt.frameLine(86);
      rt.method(a, "append_array", [rt.V.array(rt.GArray.of([rt.V.float(6.5), rt.V.float(7.5)]))]);
      rt.frameLine(87);
      print(rt.showArgs([a]));
      rt.frameLine(88);
      rt.method(this.member, "append", [rt.V.float(2.5)]);
      rt.frameLine(89);
      print(rt.showArgs([this.member]));
      rt.frameLine(91);
      let u = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(92);
      rt.method(u, "resize", [rt.V.int(3)]);
      rt.frameLine(93);
      rt.method(u, "append", [rt.V.str("s")]);
      rt.frameLine(94);
      print(rt.showArgs([u]));
      rt.frameLine(96);
      let d = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.float(1.9)]]), "String", "int", true);
      rt.frameLine(97);
      print(rt.showArgs([d]));
      rt.frameLine(98);
      {
        const _nv = rt.writeIdx(d, rt.V.str("b"), rt.V.float(2.7));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(99);
      print(rt.showArgs([d]));
      rt.frameLine(100);
      let dalias = d;
      rt.frameLine(101);
      {
        const _nv = rt.writeIdx(dalias, rt.V.str("c"), rt.V.float(3.5));
        if (_nv !== null) dalias = _nv;
      }
      rt.frameLine(102);
      print(rt.showArgs([d]));
      rt.frameLine(103);
      print(rt.showArgs([rt.method(d, "keys", [])]));
      rt.frameLine(104);
      print(rt.showArgs([rt.method(d, "values", [])]));
      rt.frameLine(105);
      let dc = rt.method(d, "duplicate", []);
      rt.frameLine(106);
      {
        const _nv = rt.writeIdx(dc, rt.V.str("z"), rt.V.float(4.5));
        if (_nv !== null) dc = _nv;
      }
      rt.frameLine(107);
      print(rt.showArgs([dc]));
      rt.frameLine(108);
      print(rt.showArgs([d]));
      rt.frameLine(109);
      let ds = rt.stampDict(rt.dictOf([]), "String", "String", true);
      rt.frameLine(110);
      {
        const _nv = rt.writeIdx(ds, rt.V.str("k"), rt.V.stringName("v"));
        if (_nv !== null) ds = _nv;
      }
      rt.frameLine(111);
      print(rt.showArgs([ds]));
      rt.frameLine(112);
      let dv = rt.stampDict(rt.dictOf([]), "int", "Array", true);
      rt.frameLine(113);
      {
        const _nv = rt.writeIdx(dv, rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2)])));
        if (_nv !== null) dv = _nv;
      }
      rt.frameLine(114);
      print(rt.showArgs([dv]));
      rt.frameLine(116);
      let q = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
      rt.frameLine(117);
      print(rt.showArgs([rt.method(q, "has", [rt.V.float(1)])]));
      rt.frameLine(118);
      print(rt.showArgs([rt.method(q, "count", [rt.V.float(1)])]));
      rt.frameLine(119);
      print(rt.showArgs([rt.method(q, "find", [rt.V.float(1)])]));
      rt.frameLine(120);
      print(rt.showArgs([rt.method(q, "rfind", [rt.V.float(1)])]));
      rt.frameLine(121);
      rt.method(q, "erase", [rt.V.float(2.5)]);
      rt.frameLine(122);
      print(rt.showArgs([q]));
      rt.frameLine(123);
      let qs = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("x")])), "String", true);
      rt.frameLine(124);
      print(rt.showArgs([rt.method(qs, "has", [rt.V.stringName("x")])]));
      rt.frameLine(125);
      print(rt.showArgs([rt.method(qs, "find", [rt.V.stringName("x")])]));
      rt.frameLine(126);
      let qb = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1)])), "int", true);
      rt.frameLine(127);
      print(rt.showArgs([rt.method(qb, "has", [rt.V.bool(true)])]));
      rt.frameLine(128);
      print(rt.showArgs([rt.method(qb, "count", [rt.V.bool(true)])]));
      rt.frameLine(129);
      let dq = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "String", "int", true);
      rt.frameLine(130);
      print(rt.showArgs([rt.method(dq, "has", [rt.V.stringName("a")])]));
      rt.frameLine(131);
      print(rt.showArgs([rt.method(dq, "get", [rt.V.int(1)])]));
      rt.frameLine(132);
      print(rt.showArgs([rt.method(dq, "find_key", [rt.V.float(1)])]));
      rt.frameLine(133);
      rt.method(dq, "erase", [rt.V.str("a")]);
      rt.frameLine(134);
      print(rt.showArgs([dq]));
      rt.frameLine(135);
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
rt.registerScriptProps(__gd_d_Main, ["member"], (o) => { const s = o as Main; return [s.member]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["member"], {}, (o) => { const s = o as Main; return [s.member]; });
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
