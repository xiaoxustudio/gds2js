// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare m: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.m = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
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

  bump(p: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "bump");
    try {
      p = rt.paramSlot(p, "Vector2", 1, "bump", this);
      rt.frameLine(6);
      {
        const _nv = rt.writeProp(p, "x", rt.V.int(7));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(7);
      print(rt.showArgs([p]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  make(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "make");
    try {
      rt.frameLine(10);
      let t = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(11);
      return t;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.vector2(0, 0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(14);
      let v = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(15);
      {
        const _nv = rt.writeProp(v, "x", rt.V.int(9));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(16);
      print(rt.showArgs([v]));
      rt.frameLine(17);
      {
        const _nv = rt.writeIdx(v, rt.V.int(0), rt.V.int(1));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(18);
      print(rt.showArgs([v]));
      rt.frameLine(19);
      {
        const _nv = rt.writeIdx(v, rt.V.str("y"), rt.V.int(5));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(20);
      print(rt.showArgs([v]));
      rt.frameLine(21);
      {
        const _nv = rt.writeIdx(v, rt.V.int(1), rt.V.int(6));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(22);
      print(rt.showArgs([v]));
      rt.frameLine(23);
      let w = v;
      rt.frameLine(24);
      {
        const _nv = rt.writeProp(w, "x", rt.V.int(100));
        if (_nv !== null) w = _nv;
      }
      rt.frameLine(25);
      print(rt.showArgs([v, rt.V.str(" "), w]));
      rt.frameLine(26);
      {
        const _nv = rt.writeIdx(w, rt.V.int(0), rt.V.int(50));
        if (_nv !== null) w = _nv;
      }
      rt.frameLine(27);
      print(rt.showArgs([v, rt.V.str(" "), w]));
      rt.frameLine(28);
      let a = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(29);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeProp(rt.index(a, _w0), "x", rt.V.int(5));
        if (_nv !== null) rt.setIndex(a, _w0, _nv);
      }
      rt.frameLine(30);
      print(rt.showArgs([a]));
      rt.frameLine(31);
      let ta = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "Vector2", true);
      rt.frameLine(32);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeProp(rt.index(ta, _w0), "y", rt.V.int(9));
        if (_nv !== null) rt.setIndex(ta, _w0, _nv);
      }
      rt.frameLine(33);
      print(rt.showArgs([ta]));
      rt.frameLine(34);
      let d = rt.dictOf([[rt.V.str("k"), rt.vector2New([rt.V.int(1), rt.V.int(2)])]]);
      rt.frameLine(35);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeProp(rt.index(d, _w0), "x", rt.V.int(8));
        if (_nv !== null) rt.setIndex(d, _w0, _nv);
      }
      rt.frameLine(36);
      print(rt.showArgs([d]));
      rt.frameLine(37);
      let dn = rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]]);
      rt.frameLine(38);
      {
      const _w0 = rt.V.str("k");
      const _w1 = rt.V.int(0);
        const _nv = rt.writeProp(rt.index(rt.index(dn, _w0), _w1), "y", rt.V.int(4));
        if (_nv !== null) rt.setIndex(rt.index(dn, _w0), _w1, _nv);
      }
      rt.frameLine(39);
      print(rt.showArgs([dn]));
      rt.frameLine(40);
      for (let x of rt.iter(a)) {
        rt.frameLine(41);
        {
          const _nv = rt.writeProp(x, "x", rt.V.int(100));
          if (_nv !== null) x = _nv;
        }
      }
      rt.frameLine(42);
      print(rt.showArgs([a]));
      rt.frameLine(43);
      let r = this.make();
      rt.frameLine(44);
      {
        const _nv = rt.writeProp(r, "x", rt.V.int(3));
        if (_nv !== null) r = _nv;
      }
      rt.frameLine(45);
      print(rt.showArgs([r, rt.V.str(" "), this.make()]));
      rt.frameLine(46);
      this.bump(v);
      rt.frameLine(47);
      print(rt.showArgs([v]));
      rt.frameLine(48);
      v = rt.ops.add(v, rt.vector2New([rt.V.int(1), rt.V.int(1)]));
      rt.frameLine(49);
      print(rt.showArgs([v]));
      rt.frameLine(50);
      {
        const _nv = rt.writeProp(v, "y", rt.ops.add(rt.wrapValue(rt.attribute(v, "y")), rt.V.float(2.5)));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(51);
      print(rt.showArgs([v]));
      rt.frameLine(52);
      {
        const _nv = rt.writeProp(this.m, "x", rt.V.int(3));
        if (_nv !== null) this.m = _nv;
      }
      rt.frameLine(53);
      print(rt.showArgs([this.m]));
      rt.frameLine(54);
      let f = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(55);
      {
        const _nv = rt.writeProp(f, "x", rt.V.float(0.1));
        if (_nv !== null) f = _nv;
      }
      rt.frameLine(56);
      print(rt.showArgs([rt.wrapValue(rt.attribute(f, "x"))]));
      rt.frameLine(57);
      print(rt.showArgs([f]));
      rt.frameLine(58);
      let big = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(59);
      {
        const _nv = rt.writeProp(big, "x", rt.V.float(100000000000000000000));
        if (_nv !== null) big = _nv;
      }
      rt.frameLine(60);
      print(rt.showArgs([big]));
      rt.frameLine(61);
      let neg = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(62);
      {
        const _nv = rt.writeProp(neg, "x", rt.V.float((-2.5)));
        if (_nv !== null) neg = _nv;
      }
      rt.frameLine(63);
      print(rt.showArgs([neg]));
      rt.frameLine(64);
      print(rt.showArgs([rt.ops.eq(v, rt.V.nil())]));
      rt.frameLine(65);
      print(rt.showArgs([rt.ops.eq(rt.V.nil(), v)]));
      rt.frameLine(66);
      print(rt.showArgs([rt.ops.eq(v, rt.vector2New([rt.V.int(2), rt.V.int(6)]))]));
      rt.frameLine(67);
      print(rt.showArgs([rt.ops.neq(v, rt.vector2New([rt.V.int(2), rt.V.int(6)]))]));
      rt.frameLine(68);
      let kv = rt.dictOf([[rt.V.str("x"), rt.vector2New([rt.V.int(1), rt.V.int(2)])]]);
      rt.frameLine(69);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(kv, rt.V.str("x"))), rt.vector2New([rt.V.int(1), rt.V.int(2)]))]));
      rt.frameLine(70);
      let store = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(71);
      let arr = rt.V.array(rt.GArray.of([store]));
      rt.frameLine(72);
      {
        const _nv = rt.writeProp(store, "x", rt.V.int(3));
        if (_nv !== null) store = _nv;
      }
      rt.frameLine(73);
      print(rt.showArgs([arr, rt.V.str(" "), store]));
      rt.frameLine(74);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(arr, rt.V.int(0))), "x")), rt.V.str(" "), rt.wrapValue(rt.index(rt.wrapValue(rt.index(arr, rt.V.int(0))), rt.V.int(0)))]));
      rt.frameLine(75);
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
      case "bump": return rt.wrapValue(this.bump(args[0] as rt.Variant));
      case "make": return rt.wrapValue(this.make());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"m": "Vector2"});
rt.registerScriptProps(__gd_d_Main, ["m"], (o) => { const s = o as Main; return [s.m]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["m"], {}, (o) => { const s = o as Main; return [s.m]; });
rt.registerMethodArities(__gd_d_Main, { "bump": [1, 1], "make": [0, 0], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "bump": ["Vector2"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
