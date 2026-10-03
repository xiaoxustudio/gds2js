// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.V.object(new Inner());
    {
      const _nv = rt.writeProp(p, "prop", rt.V.int(3));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m1 "), rt.wrapValue(rt.attribute(p, "prop")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "raw"))]));
    {
      const _nv = rt.writeProp(p, "prop", rt.ops.add(rt.wrapValue(rt.attribute(p, "prop")), rt.V.int(1)));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m2 "), rt.wrapValue(rt.attribute(p, "prop")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "raw"))]));
    print(rt.showArgs([rt.V.str("m3 "), rt.wrapValue(rt.attribute(p, "ro"))]));
    {
      const _nv = rt.writeProp(p, "ro", rt.V.int(9));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m4 "), rt.wrapValue(rt.attribute(p, "ro"))]));
    print(rt.showArgs([rt.V.str("m5 "), rt.method(p, "setvia", [rt.V.float(2.7)]), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "raw"))]));
    {
      const _nv = rt.writeProp(p, "ref", rt.V.int(4));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m6 "), rt.wrapValue(rt.attribute(p, "ref")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "rraw"))]));
    {
      const _nv = rt.writeProp(p, "ref", rt.ops.add(rt.wrapValue(rt.attribute(p, "ref")), rt.V.int(1)));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m7 "), rt.wrapValue(rt.attribute(p, "ref")), rt.V.str(" "), rt.wrapValue(rt.attribute(p, "rraw"))]));
    let q = 8;
    {
      const _nv = rt.writeProp(p, "ref", rt.V.int(q));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m8 "), rt.wrapValue(rt.attribute(p, "rraw"))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
class Inner extends rt.GdScriptObject {
  raw = rt.V.int(0);
  get prop() {
    print(rt.showArgs([rt.V.str("g")]));
    return this.raw;
  }
  set prop(value) {
    print(rt.showArgs([rt.V.str("s "), rt.ops.mul(value, rt.V.int(2))]));
    this.raw = rt.ops.mul(value, rt.V.int(2));
  }
  get ro() {
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
  rraw = rt.V.int(0);

  _getr(): rt.Variant {
    print(rt.showArgs([rt.V.str("G")]));
    return this.rraw;
  }
  
  _setr(v: rt.Variant): void {
    print(rt.showArgs([rt.V.str("S "), v]));
    this.rraw = v;
  }
  
  setvia(v: rt.Variant): rt.Variant {
    this.prop = rt.toInt(v);
    return this.raw;
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
rt.registerMethodArities(__gd_d_Inner, { "_getr": [0, 0], "_setr": [1, 1], "setvia": [1, 1] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
