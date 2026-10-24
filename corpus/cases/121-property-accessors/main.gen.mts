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
      rt.frameLine(30);
      let p = rt.V.object(new Inner());
      rt.frameLine(31);
      {
        const _nv = rt.writeProp(p, "prop", rt.V.int(3));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("m1 "), rt.wrapValue(rt.attribute(p, "prop")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "raw"))]));
      rt.frameLine(33);
      {
        const _nv = rt.writeProp(p, "prop", rt.ops.add(rt.wrapValue(rt.attribute(p, "prop")), rt.V.int(1)));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("m2 "), rt.wrapValue(rt.attribute(p, "prop")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "raw"))]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("m3 "), rt.wrapValue(rt.attribute(p, "ro"))]));
      rt.frameLine(36);
      {
        const _nv = rt.writeProp(p, "ro", rt.V.int(9));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("m4 "), rt.wrapValue(rt.attribute(p, "ro"))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("m5 "), rt.method(p, "setvia", [rt.V.float(2.7)]), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "raw"))]));
      rt.frameLine(39);
      {
        const _nv = rt.writeProp(p, "ref", rt.V.int(4));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("m6 "), rt.wrapValue(rt.attribute(p, "ref")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "rraw"))]));
      rt.frameLine(41);
      {
        const _nv = rt.writeProp(p, "ref", rt.ops.add(rt.wrapValue(rt.attribute(p, "ref")), rt.V.int(1)));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("m7 "), rt.wrapValue(rt.attribute(p, "ref")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "rraw"))]));
      rt.frameLine(43);
      let q = 8;
      rt.frameLine(44);
      {
        const _nv = rt.writeProp(p, "ref", rt.V.int(q));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("m8 "), rt.wrapValue(rt.attribute(p, "rraw"))]));
      rt.frameLine(46);
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
class Inner extends rt.GdScriptObject {
  declare raw: rt.Variant;
  declare rraw: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.raw = rt.V.int(0);
      rt.frameLine(18);
      this.rraw = rt.V.int(0);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  get prop() {
    rt.frameLine(7);
    print(rt.showArgs([rt.V.str("g")]));
    rt.frameLine(8);
    return this.raw;
  }
  set prop(value) {
    rt.frameLine(10);
    print(rt.showArgs([rt.V.str("s "), rt.ops.mul(value, rt.V.int(2))]));
    rt.frameLine(11);
    this.raw = rt.ops.mul(value, rt.V.int(2));
  }
  get ro() {
    rt.frameLine(14);
    return rt.V.int(7);
  }
  set ro(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get ref() {
    return this._getr();
  }
  set ref(value) {
    this._setr(value);
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

  _getr(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_getr");
    try {
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("G")]));
      rt.frameLine(21);
      return this.rraw;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  _setr(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_setr");
    try {
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("S "), v]));
      rt.frameLine(24);
      this.rraw = v;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  setvia(v: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "setvia");
    try {
      rt.frameLine(26);
      rt.frameLine(26);
      this.prop = rt.toInt(v);
      rt.frameLine(27);
      return this.raw;
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
      case "_getr": return rt.wrapValue(this._getr());
      case "_setr": return rt.wrapValue(this._setr(args[0] as rt.Variant));
      case "setvia": return rt.wrapValue(this.setvia(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"prop": "int", "ro": "int", "ref": "int"});
rt.registerScriptProps(__gd_d_Inner, ["raw","prop","ro","ref","rraw"], (o) => { const s = o as Inner; return [s.raw, s.prop, s.ro, s.ref, s.rraw]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["raw","prop","ro","ref","rraw"], {"prop": "int", "ro": "int", "ref": "int"}, (o) => { const s = o as Inner; return [s.raw, rt.V.nil(), rt.V.nil(), rt.V.nil(), s.rraw]; });
rt.registerMethodArities(__gd_d_Inner, { "_getr": [0, 0], "_setr": [1, 1], "setvia": [1, 1] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
