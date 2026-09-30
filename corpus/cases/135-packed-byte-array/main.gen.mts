// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
    let c = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(7)]))]);
    print(rt.showArgs([rt.V.str("u1 "), b, rt.V.str(" "), rt.typeOf(b), rt.V.str(" "), rt.method(b, "size", [])]));
    print(rt.showArgs([rt.V.str("u2 "), rt.ops.add(b, c)]));
    print(rt.showArgs([rt.V.str("u3 "), rt.ops.eq(b, c), rt.V.str(" "), rt.ops.eq(b, rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]))]));
    print(rt.showArgs([rt.V.str("u4 "), rt.method(b, "has", [rt.V.int(1)]), rt.V.str(" "), rt.method(b, "count", [rt.V.int(1)]), rt.V.str(" "), rt.method(b, "find", [rt.V.int(2)]), rt.V.str(" "), rt.method(b, "find", [rt.V.int(9)])]));
    rt.method(b, "sort", []);
    print(rt.showArgs([rt.V.str("u5 "), b]));
    print(rt.showArgs([rt.V.str("u6 "), rt.index(b, rt.V.int(0)), rt.V.str(" "), rt.index(b, rt.V.int((-1))), rt.V.str(" "), rt.method(b, "get", [rt.V.int(1)])]));
    let d = rt.method(rt.V.str("héllo"), "to_utf8_buffer", []);
    print(rt.showArgs([rt.V.str("u7 "), d, rt.V.str(" "), rt.method(d, "size", [])]));
    print(rt.showArgs([rt.V.str("u8 "), rt.method(d, "get_string_from_utf8", [])]));
    {
      const _nv = rt.writeIdx(d, rt.V.int(0), rt.V.int(72));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("u9 "), rt.method(d, "get_string_from_utf8", []), rt.V.str(" "), rt.index(d, rt.V.int(1))]));
    print(rt.showArgs([rt.V.str("u10 "), rt.method(d, "hex_encode", []), rt.V.str(" "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(255)]))]), "hex_encode", [])]));
    let e = rt.bytesCtor([]);
    rt.method(e, "append", [rt.V.int(300)]);
    rt.method(e, "append", [rt.V.int((-1))]);
    rt.method(e, "append", [rt.V.float(2.7)]);
    rt.method(e, "append", [rt.V.bool(true)]);
    print(rt.showArgs([rt.V.str("u11 "), e]));
    rt.method(e, "resize", [rt.V.int(6)]);
    print(rt.showArgs([rt.V.str("u12 "), e, rt.V.str(" "), rt.method(e, "is_empty", []), rt.V.str(" "), rt.method(e, "size", [])]));
    let f = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
    let g = f;
    {
      const _nv = rt.writeIdx(g, rt.V.int(0), rt.V.int(9));
      if (_nv !== null) g = _nv;
    }
    print(rt.showArgs([rt.V.str("u13 "), f, rt.V.str(" "), g]));
    let h = rt.method(f, "duplicate", []);
    {
      const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(8));
      if (_nv !== null) h = _nv;
    }
    let s2 = rt.bytesCtor([f]);
    {
      const _nv = rt.writeIdx(s2, rt.V.int(1), rt.V.int(5));
      if (_nv !== null) s2 = _nv;
    }
    print(rt.showArgs([rt.V.str("u14 "), f, rt.V.str(" "), h, rt.V.str(" "), s2]));
    print(rt.showArgs([rt.V.str("u15 "), rt.method(f, "slice", [rt.V.int(1), rt.V.int(3)])]));
    rt.method(f, "reverse", []);
    print(rt.showArgs([rt.V.str("u15b "), f]));
    rt.method(f, "insert", [rt.V.int(0), rt.V.int(0)]);
    print(rt.showArgs([rt.V.str("u16 "), f]));
    rt.method(f, "remove_at", [rt.V.int(0)]);
    print(rt.showArgs([rt.V.str("u17 "), f]));
    print(rt.showArgs([rt.V.str("u18 "), rt.method(rt.V.str("abc"), "to_ascii_buffer", []), rt.V.str(" "), rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(104), rt.V.int(105)]))]), "get_string_from_ascii", [])]));
    print(rt.showArgs([rt.V.str("u19 "), rt.arrayFromVariant(f), rt.V.str(" "), rt.index(rt.arrayFromVariant(f), rt.V.int(0)), rt.V.str(" "), rt.typeOf(rt.index(rt.arrayFromVariant(f), rt.V.int(0)))]));
    let k = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]);
    rt.method(k, "append_array", [rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])]);
    rt.method(k, "fill", [rt.V.int(4)]);
    print(rt.showArgs([rt.V.str("u21 "), k, rt.V.str(" "), rt.method(rt.bytesCtor([]), "size", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
