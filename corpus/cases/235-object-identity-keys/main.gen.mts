// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare fired: rt.Signal;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.fired = new rt.Signal("fired");
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
      rt.frameLine(11);
      let p = rt.V.object(new Thing());
      rt.frameLine(12);
      let q = p;
      rt.frameLine(13);
      let a = rt.V.object(new Thing());
      rt.frameLine(14);
      let b = rt.V.object(new Thing());
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("1|"), rt.ops.eq(p, q), rt.V.str("|"), rt.ops.eq(p, p), rt.V.str("|"), rt.ops.eq(a, b), rt.V.str("|"), rt.ops.neq(p, a), rt.V.str("|"), rt.ops.eq(p, rt.V.nil()), rt.V.str("|"), rt.ops.eq(rt.V.nil(), p)]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("2|"), rt.ops.eq(rt.method(p, "get_instance_id", []), rt.method(q, "get_instance_id", [])), rt.V.str("|"), rt.ops.eq(rt.method(a, "get_instance_id", []), rt.method(b, "get_instance_id", [])), rt.V.str("|"), rt.ops.eq(rt.method(p, "get_instance_id", []), rt.method(p, "get_instance_id", [])), rt.V.str("|"), rt.typeOf(rt.method(p, "get_instance_id", []))]));
      rt.frameLine(17);
      let d = rt.dictOf([]);
      rt.frameLine(18);
      {
        const _nv = rt.writeIdx(d, p, rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(19);
      {
        const _nv = rt.writeIdx(d, q, rt.V.int(2));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("3|"), rt.method(d, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(d, p)), rt.V.str("|"), rt.method(d, "has", [p]), rt.V.str("|"), rt.method(d, "has", [rt.V.object(new Thing())])]));
      rt.frameLine(21);
      {
        const _nv = rt.writeIdx(d, a, rt.V.int(3));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("4|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [p]), rt.V.str("|"), rt.method(d, "has", [a]), rt.V.str("|"), rt.method(d, "has", [b])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("5|"), rt.ops.eq(rt.wrapValue(rt.index(rt.method(d, "keys", []), rt.V.int(0))), p), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(rt.method(d, "keys", []), rt.V.int(1))), a)]));
      rt.frameLine(24);
      {
        const _nv = rt.writeProp(p, "n", rt.V.int(99));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("6|"), rt.method(d, "has", [q]), rt.V.str("|"), rt.wrapValue(rt.index(d, q))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("7|"), rt.method(d, "erase", [p]), rt.V.str("|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [a]), rt.V.str("|"), rt.method(d, "erase", [b])]));
      rt.frameLine(27);
      let e = rt.dictOf([]);
      rt.frameLine(28);
      {
        const _nv = rt.writeIdx(e, rt.V.nil(), rt.V.int(1));
        if (_nv !== null) e = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("8|"), rt.method(e, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(e, rt.V.nil())), rt.V.str("|"), rt.method(e, "has", [rt.V.nil()]), rt.V.str("|"), rt.method(e, "has", [p])]));
      rt.frameLine(30);
      let f = rt.dictOf([]);
      rt.frameLine(31);
      {
        const _nv = rt.writeIdx(f, p, rt.V.int(1));
        if (_nv !== null) f = _nv;
      }
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("9|"), rt.method(f, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(f, p)), rt.V.int(1))]));
      rt.frameLine(33);
      let g = rt.dictOf([]);
      rt.frameLine(34);
      {
        const _nv = rt.writeIdx(g, rt.V.object(new Thing()), rt.V.int(1));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(35);
      {
        const _nv = rt.writeIdx(g, rt.V.object(new Thing()), rt.V.int(2));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("10|"), rt.method(g, "size", [])]));
      rt.frameLine(37);
      let arr = rt.V.array(rt.GArray.of([p, a, p]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("11|"), rt.method(arr, "has", [q]), rt.V.str("|"), rt.method(arr, "has", [b]), rt.V.str("|"), rt.method(arr, "count", [p]), rt.V.str("|"), rt.method(arr, "find", [a]), rt.V.str("|"), rt.method(arr, "find", [b])]));
      rt.frameLine(39);
      rt.method(arr, "erase", [q]);
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("12|"), rt.method(arr, "size", []), rt.V.str("|"), rt.method(arr, "has", [p]), rt.V.str("|"), rt.method(arr, "has", [a])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("13|"), rt.ops.eq(rt.V.array(rt.GArray.of([p])), rt.V.array(rt.GArray.of([p]))), rt.V.str("|"), rt.ops.eq(rt.V.array(rt.GArray.of([p])), rt.V.array(rt.GArray.of([q]))), rt.V.str("|"), rt.ops.eq(rt.V.array(rt.GArray.of([p])), rt.V.array(rt.GArray.of([a]))), rt.V.str("|"), rt.ops.eq(rt.V.array(rt.GArray.of([p, a])), rt.V.array(rt.GArray.of([p, a])))]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("14|"), rt.ops.eq(rt.dictOf([[p, rt.V.int(1)]]), rt.dictOf([[p, rt.V.int(1)]])), rt.V.str("|"), rt.ops.eq(rt.dictOf([[p, rt.V.int(1)]]), rt.dictOf([[a, rt.V.int(1)]])), rt.V.str("|"), rt.ops.eq(rt.dictOf([[p, rt.V.int(1)]]), rt.dictOf([[q, rt.V.int(2)]]))]));
      rt.frameLine(43);
      let du = rt.method(rt.V.array(rt.GArray.of([p, a])), "duplicate", []);
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("15|"), rt.method(du, "has", [p]), rt.V.str("|"), rt.ops.eq(du, rt.V.array(rt.GArray.of([p, a])))]));
      rt.frameLine(45);
      let c1 = rt.wrapValue(rt.attribute(p, "m"));
      rt.frameLine(46);
      let c2 = rt.wrapValue(rt.attribute(p, "m"));
      rt.frameLine(47);
      let ca = rt.wrapValue(rt.attribute(a, "m"));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("16|"), rt.ops.eq(c1, c2), rt.V.str("|"), rt.ops.eq(c1, rt.wrapValue(rt.attribute(p, "m"))), rt.V.str("|"), rt.ops.eq(c1, ca), rt.V.str("|"), rt.typeOf(c1)]));
      rt.frameLine(49);
      let cd = rt.dictOf([]);
      rt.frameLine(50);
      {
        const _nv = rt.writeIdx(cd, c1, rt.V.int(1));
        if (_nv !== null) cd = _nv;
      }
      rt.frameLine(51);
      {
        const _nv = rt.writeIdx(cd, c2, rt.V.int(2));
        if (_nv !== null) cd = _nv;
      }
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("17|"), rt.method(cd, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(cd, c1)), rt.V.str("|"), rt.method(cd, "has", [ca])]));
      rt.frameLine(53);
      {
        const _nv = rt.writeIdx(cd, ca, rt.V.int(3));
        if (_nv !== null) cd = _nv;
      }
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("18|"), rt.method(cd, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(cd, c1)), rt.V.str("|"), rt.wrapValue(rt.index(cd, ca))]));
      rt.frameLine(55);
      let s1 = rt.method(c1, "bind", [rt.V.int(1)]);
      rt.frameLine(56);
      let s2 = rt.method(c1, "bind", [rt.V.int(2)]);
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("19|"), rt.ops.eq(s1, s2), rt.V.str("|"), rt.ops.eq(c1, s1), rt.V.str("|"), rt.ops.eq(s1, c1)]));
      rt.frameLine(58);
      let ce = rt.dictOf([]);
      rt.frameLine(59);
      {
        const _nv = rt.writeIdx(ce, s1, rt.V.int(1));
        if (_nv !== null) ce = _nv;
      }
      rt.frameLine(60);
      {
        const _nv = rt.writeIdx(ce, s2, rt.V.int(2));
        if (_nv !== null) ce = _nv;
      }
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("20|"), rt.method(ce, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(ce, s1)), rt.V.str("|"), rt.method(ce, "has", [c1])]));
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("21|"), rt.method(c1, "call", [rt.V.int(3)]), rt.V.str("|"), rt.method(s2, "call", [])]));
      rt.frameLine(63);
      let l = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(64);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("22|"), rt.ops.eq(l, l), rt.V.str("|"), rt.ops.eq(l, rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const y = __a[0] as rt.Variant;
          rt.frameLine(66);
          return y;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1))]));
      rt.frameLine(67);
      let le = rt.dictOf([]);
      rt.frameLine(68);
      {
        const _nv = rt.writeIdx(le, l, rt.V.int(1));
        if (_nv !== null) le = _nv;
      }
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("23|"), rt.method(le, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(le, l)), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([l])), "has", [l])]));
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("24|"), rt.ops.eq(rt.wrapValue(this.fired), rt.wrapValue(this.fired)), rt.V.str("|"), rt.typeOf(rt.wrapValue(this.fired)), rt.V.str("|"), rt.ops.neq(rt.wrapValue(this.fired), rt.wrapValue(this.fired))]));
      rt.frameLine(71);
      let sd = rt.dictOf([]);
      rt.frameLine(72);
      {
        const _nv = rt.writeIdx(sd, rt.wrapValue(this.fired), rt.V.int(1));
        if (_nv !== null) sd = _nv;
      }
      rt.frameLine(73);
      print(rt.showArgs([rt.V.str("25|"), rt.method(sd, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(sd, rt.wrapValue(this.fired))), rt.V.str("|"), rt.method(sd, "has", [rt.wrapValue(this.fired)])]));
      rt.frameLine(74);
      {
        const _nv = rt.writeIdx(sd, p, rt.V.int(2));
        if (_nv !== null) sd = _nv;
      }
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("26|"), rt.method(sd, "size", []), rt.V.str("|"), rt.method(sd, "has", [rt.wrapValue(this.fired)]), rt.V.str("|"), rt.method(sd, "has", [p])]));
      rt.frameLine(76);
      print(rt.showArgs([rt.V.str("27|"), rt.method(rt.V.array(rt.GArray.of([rt.wrapValue(this.fired)])), "has", [rt.wrapValue(this.fired)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.wrapValue(this.fired), p])), "has", [p])]));
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("28|"), rt.ops.eq(rt.dictOf([[rt.wrapValue(this.fired), rt.V.int(1)]]), rt.dictOf([[rt.wrapValue(this.fired), rt.V.int(1)]])), rt.V.str("|"), rt.ops.eq(rt.dictOf([[rt.wrapValue(this.fired), rt.V.int(1)]]), rt.dictOf([[p, rt.V.int(1)]]))]));
      rt.frameLine(78);
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
class Thing extends rt.GdScriptObject {
  declare n: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(6);
      this.n = rt.V.int(1);
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

  m(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "m");
    try {
      rt.frameLine(8);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "m": return rt.wrapValue(this.m(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerScriptProps(__gd_d_Thing, ["n"], (o) => { const s = o as Thing; return [s.n]; });
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", ["n"], {}, (o) => { const s = o as Thing; return [s.n]; });
rt.registerMethodArities(__gd_d_Thing, { "m": [1, 1] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
