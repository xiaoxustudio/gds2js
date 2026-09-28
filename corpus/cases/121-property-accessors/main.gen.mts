// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let p = rt.V.object(new Inner());
    {
      const _nv = rt.writeProp(p, "prop", rt.V.int(3));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m1 "), rt.attribute(p, "prop"), rt.V.str(" "), rt.attribute(p, "raw")]));
    {
      const _nv = rt.writeProp(p, "prop", rt.ops.add(rt.attribute(p, "prop"), rt.V.int(1)));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m2 "), rt.attribute(p, "prop"), rt.V.str(" "), rt.attribute(p, "raw")]));
    print(rt.showArgs([rt.V.str("m3 "), rt.attribute(p, "ro")]));
    {
      const _nv = rt.writeProp(p, "ro", rt.V.int(9));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m4 "), rt.attribute(p, "ro")]));
    print(rt.showArgs([rt.V.str("m5 "), rt.method(p, "setvia", [rt.V.float(2.7)]), rt.V.str(" "), rt.attribute(p, "raw")]));
    {
      const _nv = rt.writeProp(p, "ref", rt.V.int(4));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m6 "), rt.attribute(p, "ref"), rt.V.str(" "), rt.attribute(p, "rraw")]));
    {
      const _nv = rt.writeProp(p, "ref", rt.ops.add(rt.attribute(p, "ref"), rt.V.int(1)));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m7 "), rt.attribute(p, "ref"), rt.V.str(" "), rt.attribute(p, "rraw")]));
    let q = 8;
    {
      const _nv = rt.writeProp(p, "ref", rt.V.int(q));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("m8 "), rt.attribute(p, "rraw")]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class Inner {
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
    // 只读属性：Godot 实测写它是静默无操作（S152），不是报错
  }
  get ref() {
    return this._getr();
  }
  set ref(value) {
    this._setr(value);
  }
  rraw = rt.V.int(0);

  _getr(): unknown {
    print(rt.showArgs([rt.V.str("G")]));
    return this.rraw;
  }
  
  _setr(v): void {
    print(rt.showArgs([rt.V.str("S "), v]));
    this.rraw = v;
  }
  
  setvia(v): unknown {
    this.prop = rt.toInt(v);
    return this.raw;
  }
  
}
rt.registerClass("Inner", Inner);
rt.registerFieldTypes(Inner, {"prop": "int", "ro": "int", "ref": "int"});
rt.registerNativeBase(Inner, "RefCounted");

await new Main().run();
