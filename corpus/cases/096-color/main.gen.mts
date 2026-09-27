// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  c = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
  q = rt.color(0, 0, 0, 1);

  poke(p): void {
    {
      const _nv = rt.writeProp(p, "r", rt.V.float(9));
      if (_nv !== null) p = _nv;
    }
    print(rt.show(p));
  }
  
  async _initialize(): Promise<void> {
    print(rt.show(rt.typeOf(this.c)), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([this.c])), rt.show(rt.V.str(" ")), rt.show(this.q));
    print(rt.show(rt.colorNew([rt.V.str("red")])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.str("#00ff00")])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.str("FF8000")])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.str("f00")])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.str("REBECCA_PURPLE")])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.str("medium_purple")])));
    print(rt.show(rt.colorStatic("html", [rt.V.str("80ff0000")])), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("html", [rt.V.str("f00")])), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("from_string", [rt.V.str("#00ff00"), rt.colorNew([rt.V.int(9), rt.V.int(9), rt.V.int(9), rt.V.int(9)])])), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("from_string", [rt.V.str("alice_blue"), rt.colorNew([rt.V.int(9), rt.V.int(9), rt.V.int(9), rt.V.int(9)])])));
    print(rt.show(rt.colorStatic("from_hsv", [rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5)])), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("from_hsv", [rt.V.int(1), rt.V.int(1), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("from_hsv", [rt.V.int(0), rt.V.int(0), rt.V.int(0)])), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("from_hsv", [rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.125)])));
    print(rt.show(rt.colorStatic("RED")), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("ALICE_BLUE")), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("TRANSPARENT")), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("MEDIUM_PURPLE")), rt.show(rt.V.str(" ")), rt.show(rt.colorStatic("REBECCA_PURPLE")));
    print(rt.show(rt.colorNew([rt.V.float((1 / 3)), rt.V.float(0.1), rt.V.float(0.123456789), rt.V.float(1)])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.float((1 / 3)), rt.V.float(0.00001), rt.ops.neg(rt.V.float(0.00001)), rt.ops.neg(rt.V.float(0))])));
    print(rt.show(rt.colorNew([rt.V.float(100000000000000000000), rt.V.float(1e-8), rt.ops.neg(rt.V.float(1e-8)), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.float((0 / 0)), rt.V.float((1 / 0)), rt.ops.div(rt.ops.neg(rt.V.float(1)), rt.V.float(0)), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.colorNew([rt.V.float(0.9999999), rt.V.float(0.00004), rt.V.float(0.00006), rt.V.float(0.5)])));
    print(rt.show(rt.attribute(this.c, "r")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(this.c, "g")), rt.show(rt.V.str(" ")), rt.show(rt.index(this.c, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.index(this.c, rt.V.str("g"))), rt.show(rt.V.str(" ")), rt.show(rt.attribute(this.c, "a")), rt.show(rt.V.str(" ")), rt.show(rt.index(this.c, rt.V.int(3))));
    print(rt.show(rt.attribute(this.c, "h")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(this.c, "s")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(this.c, "v")), rt.show(rt.V.str(" ")), rt.show(rt.index(this.c, rt.V.str("h"))), rt.show(rt.V.str(" ")), rt.show(rt.attribute(this.c, "r8")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(this.c, "a8")));
    print(rt.show(rt.attribute(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "h")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "s")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "h")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.ops.neg(rt.V.float(0.5)), rt.V.float(0.2), rt.V.float(0.9)]), "h")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.V.float(0.2), rt.V.float(0.1), rt.V.float(0.3)]), "h")));
    print(rt.show(rt.attribute(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "h")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "s")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "v")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(rt.colorNew([rt.V.float((0 / 0)), rt.V.float((1 / 0)), rt.ops.div(rt.ops.neg(rt.V.float(1)), rt.V.float(0)), rt.V.float(0.4)]), "r8")));
    let d = rt.colorNew([this.c]);
    {
      const _nv = rt.writeProp(d, "b", rt.V.int(1));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(this.c), rt.show(rt.V.str(" | ")), rt.show(d));
    this.poke(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]));
    print(rt.show(this.c), rt.show(rt.V.str(" ")), rt.show(rt.ops.add(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.sub(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]))));
    print(rt.show(rt.ops.mul(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.mul(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.int(2))), rt.show(rt.V.str(" ")), rt.show(rt.ops.mul(rt.V.int(2), rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]))));
    print(rt.show(rt.ops.div(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.int(2))), rt.show(rt.V.str(" ")), rt.show(rt.ops.div(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.int(2), rt.V.int(4), rt.V.int(6), rt.V.int(8)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.div(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.float(0))));
    print(rt.show(rt.ops.neg(rt.colorNew([rt.V.int(1), rt.ops.neg(rt.V.int(2)), rt.V.int(0), rt.V.float(0.5)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.float(4)]))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.nil())));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_html", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.float(0.5)]), "to_html", [rt.V.bool(true)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.float(0.5)]), "to_html", [rt.V.bool(false)])));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.4), rt.V.float(0.5), rt.V.float(0.6), rt.V.float(0.7)]), "to_html", [rt.V.bool(true)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "to_rgba32", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "to_rgba32", [])));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_rgba32", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_argb32", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_abgr32", [])));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "get_luminance", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75)]), "get_luminance", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "get_luminance", [])));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.float(0.3)]), "lightened", [rt.V.float(0.5)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.float(0.3)]), "darkened", [rt.V.float(0.5)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "lightened", [rt.V.float(0.5)])));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "lightened", [rt.ops.neg(rt.V.float(0.5))])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "darkened", [rt.ops.neg(rt.V.float(0.5))])));
    print(rt.show(rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.float(0.3)]), "inverted", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]), "lerp", [rt.colorNew([rt.V.float(0.7), rt.V.float(0.8), rt.V.float(0.9), rt.V.float(1)]), rt.V.float(0.333)])));
    print(rt.show(rt.method(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.colorNew([rt.V.float(1.000009), rt.V.int(2), rt.V.int(3), rt.V.int(4)])])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.colorNew([rt.V.float(1.00001), rt.V.int(2), rt.V.int(3), rt.V.int(4)])])));
    let e = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
    {
      const _nv = rt.writeProp(e, "h", rt.V.float(0.5));
      if (_nv !== null) e = _nv;
    }
    print(rt.show(e));
    let f = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
    {
      const _nv = rt.writeProp(f, "s", rt.V.float(0.5));
      if (_nv !== null) f = _nv;
    }
    print(rt.show(f));
    let g = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
    {
      const _nv = rt.writeIdx(g, rt.V.str("v"), rt.V.float(0.5));
      if (_nv !== null) g = _nv;
    }
    print(rt.show(g));
    let k = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
    {
      const _nv = rt.writeProp(k, "r8", rt.V.int(128));
      if (_nv !== null) k = _nv;
    }
    print(rt.show(k), rt.show(rt.V.str(" ")), rt.show(rt.attribute(k, "r")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(k, "h")), rt.show(rt.V.str(" ")), rt.show(rt.attribute(k, "a8")));
    let m = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
    {
      const _nv = rt.writeIdx(m, rt.V.str("a"), rt.V.float(0.5));
      if (_nv !== null) m = _nv;
    }
    {
      const _nv = rt.writeIdx(m, rt.V.int(3), rt.V.float(0.25));
      if (_nv !== null) m = _nv;
    }
    print(rt.show(m));
    let key = rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]);
    let dd = rt.dictOf([[key, rt.V.int(7)]]);
    {
      const _nv = rt.writeProp(key, "b", rt.V.int(1));
      if (_nv !== null) key = _nv;
    }
    print(rt.show(dd), rt.show(rt.V.str(" ")), rt.show(rt.method(dd, "has", [key])), rt.show(rt.V.str(" ")), rt.show(rt.method(dd, "has", [rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])), rt.show(rt.V.str(" ")), rt.show(rt.index(dd, rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]))));
    let ta = rt.stampArray(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])), "Color", true);
    rt.method(ta, "resize", [rt.V.int(3)]);
    print(rt.show(ta), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.index(ta, rt.V.int(0)), rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]))), rt.show(rt.V.str(" ")), rt.show(rt.method(ta, "has", [rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(ta, _w0), "g", rt.V.float(0.5));
      if (_nv !== null) rt.setIndex(ta, _w0, _nv);
    }
    print(rt.show(ta));
    this.quit();
  }
  
}

await new Main().run();
