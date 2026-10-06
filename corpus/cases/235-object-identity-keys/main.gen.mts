// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fired = new rt.Signal("fired");

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.V.object(new Thing());
    let q = p;
    let a = rt.V.object(new Thing());
    let b = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("1|"), rt.ops.eq(p, q), rt.V.str("|"), rt.ops.eq(p, p), rt.V.str("|"), rt.ops.eq(a, b), rt.V.str("|"), rt.ops.neq(p, a), rt.V.str("|"), rt.ops.eq(p, rt.V.nil()), rt.V.str("|"), rt.ops.eq(rt.V.nil(), p)]));
    print(rt.showArgs([rt.V.str("2|"), rt.ops.eq(rt.method(p, "get_instance_id", []), rt.method(q, "get_instance_id", [])), rt.V.str("|"), rt.ops.eq(rt.method(a, "get_instance_id", []), rt.method(b, "get_instance_id", [])), rt.V.str("|"), rt.ops.eq(rt.method(p, "get_instance_id", []), rt.method(p, "get_instance_id", [])), rt.V.str("|"), rt.typeOf(rt.method(p, "get_instance_id", []))]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, p, rt.V.int(1));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, q, rt.V.int(2));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("3|"), rt.method(d, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(d, p)), rt.V.str("|"), rt.method(d, "has", [p]), rt.V.str("|"), rt.method(d, "has", [rt.V.object(new Thing())])]));
    {
      const _nv = rt.writeIdx(d, a, rt.V.int(3));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("4|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [p]), rt.V.str("|"), rt.method(d, "has", [a]), rt.V.str("|"), rt.method(d, "has", [b])]));
    print(rt.showArgs([rt.V.str("5|"), rt.ops.eq(rt.wrapValue(rt.index(rt.method(d, "keys", []), rt.V.int(0))), p), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(rt.method(d, "keys", []), rt.V.int(1))), a)]));
    {
      const _nv = rt.writeProp(p, "n", rt.V.int(99));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("6|"), rt.method(d, "has", [q]), rt.V.str("|"), rt.wrapValue(rt.index(d, q))]));
    print(rt.showArgs([rt.V.str("7|"), rt.method(d, "erase", [p]), rt.V.str("|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [a]), rt.V.str("|"), rt.method(d, "erase", [b])]));
    let e = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(e, rt.V.nil(), rt.V.int(1));
      if (_nv !== null) e = _nv;
    }
    print(rt.showArgs([rt.V.str("8|"), rt.method(e, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(e, rt.V.nil())), rt.V.str("|"), rt.method(e, "has", [rt.V.nil()]), rt.V.str("|"), rt.method(e, "has", [p])]));
    let f = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(f, p, rt.V.int(1));
      if (_nv !== null) f = _nv;
    }
    print(rt.showArgs([rt.V.str("9|"), rt.method(f, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(f, p)), rt.V.int(1))]));
    let g = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(g, rt.V.object(new Thing()), rt.V.int(1));
      if (_nv !== null) g = _nv;
    }
    {
      const _nv = rt.writeIdx(g, rt.V.object(new Thing()), rt.V.int(2));
      if (_nv !== null) g = _nv;
    }
    print(rt.showArgs([rt.V.str("10|"), rt.method(g, "size", [])]));
    let arr = rt.V.array(rt.GArray.of([p, a, p]));
    print(rt.showArgs([rt.V.str("11|"), rt.method(arr, "has", [q]), rt.V.str("|"), rt.method(arr, "has", [b]), rt.V.str("|"), rt.method(arr, "count", [p]), rt.V.str("|"), rt.method(arr, "find", [a]), rt.V.str("|"), rt.method(arr, "find", [b])]));
    rt.method(arr, "erase", [q]);
    print(rt.showArgs([rt.V.str("12|"), rt.method(arr, "size", []), rt.V.str("|"), rt.method(arr, "has", [p]), rt.V.str("|"), rt.method(arr, "has", [a])]));
    print(rt.showArgs([rt.V.str("13|"), rt.ops.eq(rt.V.array(rt.GArray.of([p])), rt.V.array(rt.GArray.of([p]))), rt.V.str("|"), rt.ops.eq(rt.V.array(rt.GArray.of([p])), rt.V.array(rt.GArray.of([q]))), rt.V.str("|"), rt.ops.eq(rt.V.array(rt.GArray.of([p])), rt.V.array(rt.GArray.of([a]))), rt.V.str("|"), rt.ops.eq(rt.V.array(rt.GArray.of([p, a])), rt.V.array(rt.GArray.of([p, a])))]));
    print(rt.showArgs([rt.V.str("14|"), rt.ops.eq(rt.dictOf([[p, rt.V.int(1)]]), rt.dictOf([[p, rt.V.int(1)]])), rt.V.str("|"), rt.ops.eq(rt.dictOf([[p, rt.V.int(1)]]), rt.dictOf([[a, rt.V.int(1)]])), rt.V.str("|"), rt.ops.eq(rt.dictOf([[p, rt.V.int(1)]]), rt.dictOf([[q, rt.V.int(2)]]))]));
    let du = rt.method(rt.V.array(rt.GArray.of([p, a])), "duplicate", []);
    print(rt.showArgs([rt.V.str("15|"), rt.method(du, "has", [p]), rt.V.str("|"), rt.ops.eq(du, rt.V.array(rt.GArray.of([p, a])))]));
    let c1 = rt.wrapValue(rt.attribute(p, "m"));
    let c2 = rt.wrapValue(rt.attribute(p, "m"));
    let ca = rt.wrapValue(rt.attribute(a, "m"));
    print(rt.showArgs([rt.V.str("16|"), rt.ops.eq(c1, c2), rt.V.str("|"), rt.ops.eq(c1, rt.wrapValue(rt.attribute(p, "m"))), rt.V.str("|"), rt.ops.eq(c1, ca), rt.V.str("|"), rt.typeOf(c1)]));
    let cd = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(cd, c1, rt.V.int(1));
      if (_nv !== null) cd = _nv;
    }
    {
      const _nv = rt.writeIdx(cd, c2, rt.V.int(2));
      if (_nv !== null) cd = _nv;
    }
    print(rt.showArgs([rt.V.str("17|"), rt.method(cd, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(cd, c1)), rt.V.str("|"), rt.method(cd, "has", [ca])]));
    {
      const _nv = rt.writeIdx(cd, ca, rt.V.int(3));
      if (_nv !== null) cd = _nv;
    }
    print(rt.showArgs([rt.V.str("18|"), rt.method(cd, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(cd, c1)), rt.V.str("|"), rt.wrapValue(rt.index(cd, ca))]));
    let s1 = rt.method(c1, "bind", [rt.V.int(1)]);
    let s2 = rt.method(c1, "bind", [rt.V.int(2)]);
    print(rt.showArgs([rt.V.str("19|"), rt.ops.eq(s1, s2), rt.V.str("|"), rt.ops.eq(c1, s1), rt.V.str("|"), rt.ops.eq(s1, c1)]));
    let ce = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(ce, s1, rt.V.int(1));
      if (_nv !== null) ce = _nv;
    }
    {
      const _nv = rt.writeIdx(ce, s2, rt.V.int(2));
      if (_nv !== null) ce = _nv;
    }
    print(rt.showArgs([rt.V.str("20|"), rt.method(ce, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(ce, s1)), rt.V.str("|"), rt.method(ce, "has", [c1])]));
    print(rt.showArgs([rt.V.str("21|"), rt.method(c1, "call", [rt.V.int(3)]), rt.V.str("|"), rt.method(s2, "call", [])]));
    let l = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1);
    print(rt.showArgs([rt.V.str("22|"), rt.ops.eq(l, l), rt.V.str("|"), rt.ops.eq(l, rt.callable((__a: rt.Variant[]) => {
      const y = __a[0] as rt.Variant;
      return y;
    }, 1))]));
    let le = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(le, l, rt.V.int(1));
      if (_nv !== null) le = _nv;
    }
    print(rt.showArgs([rt.V.str("23|"), rt.method(le, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(le, l)), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([l])), "has", [l])]));
    print(rt.showArgs([rt.V.str("24|"), rt.ops.eq(rt.wrapValue(this.fired), rt.wrapValue(this.fired)), rt.V.str("|"), rt.typeOf(rt.wrapValue(this.fired)), rt.V.str("|"), rt.ops.neq(rt.wrapValue(this.fired), rt.wrapValue(this.fired))]));
    let sd = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(sd, rt.wrapValue(this.fired), rt.V.int(1));
      if (_nv !== null) sd = _nv;
    }
    print(rt.showArgs([rt.V.str("25|"), rt.method(sd, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(sd, rt.wrapValue(this.fired))), rt.V.str("|"), rt.method(sd, "has", [rt.wrapValue(this.fired)])]));
    {
      const _nv = rt.writeIdx(sd, p, rt.V.int(2));
      if (_nv !== null) sd = _nv;
    }
    print(rt.showArgs([rt.V.str("26|"), rt.method(sd, "size", []), rt.V.str("|"), rt.method(sd, "has", [rt.wrapValue(this.fired)]), rt.V.str("|"), rt.method(sd, "has", [p])]));
    print(rt.showArgs([rt.V.str("27|"), rt.method(rt.V.array(rt.GArray.of([rt.wrapValue(this.fired)])), "has", [rt.wrapValue(this.fired)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.wrapValue(this.fired), p])), "has", [p])]));
    print(rt.showArgs([rt.V.str("28|"), rt.ops.eq(rt.dictOf([[rt.wrapValue(this.fired), rt.V.int(1)]]), rt.dictOf([[rt.wrapValue(this.fired), rt.V.int(1)]])), rt.V.str("|"), rt.ops.eq(rt.dictOf([[rt.wrapValue(this.fired), rt.V.int(1)]]), rt.dictOf([[p, rt.V.int(1)]]))]));
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
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Thing extends rt.GdScriptObject {
  n = rt.V.int(1);

  m(a: rt.Variant): rt.Variant {
    return a;
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
rt.registerScriptProps(__gd_d_Thing, ["n"]);
rt.registerMethodArities(__gd_d_Thing, { "m": [1, 1] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
