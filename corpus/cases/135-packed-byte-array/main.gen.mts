// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]);
    let c = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(7)]))]);
    print(rt.show(rt.V.str("u1 ")), rt.show(b), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(b)), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "size", [])));
    print(rt.show(rt.V.str("u2 ")), rt.show(rt.ops.add(b, c)));
    print(rt.show(rt.V.str("u3 ")), rt.show(rt.ops.eq(b, c)), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(b, rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]))]))));
    print(rt.show(rt.V.str("u4 ")), rt.show(rt.method(b, "has", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "count", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "find", [rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "find", [rt.V.int(9)])));
    rt.method(b, "sort", []);
    print(rt.show(rt.V.str("u5 ")), rt.show(b));
    print(rt.show(rt.V.str("u6 ")), rt.show(rt.index(b, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.index(b, rt.V.int((-1)))), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "get", [rt.V.int(1)])));
    let d = rt.method(rt.V.str("héllo"), "to_utf8_buffer", []);
    print(rt.show(rt.V.str("u7 ")), rt.show(d), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "size", [])));
    print(rt.show(rt.V.str("u8 ")), rt.show(rt.method(d, "get_string_from_utf8", [])));
    {
      const _nv = rt.writeIdx(d, rt.V.int(0), rt.V.int(72));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(rt.V.str("u9 ")), rt.show(rt.method(d, "get_string_from_utf8", [])), rt.show(rt.V.str(" ")), rt.show(rt.index(d, rt.V.int(1))));
    print(rt.show(rt.V.str("u10 ")), rt.show(rt.method(d, "hex_encode", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(255)]))]), "hex_encode", [])));
    let e = rt.bytesCtor([]);
    rt.method(e, "append", [rt.V.int(300)]);
    rt.method(e, "append", [rt.V.int((-1))]);
    rt.method(e, "append", [rt.V.float(2.7)]);
    rt.method(e, "append", [rt.V.bool(true)]);
    print(rt.show(rt.V.str("u11 ")), rt.show(e));
    rt.method(e, "resize", [rt.V.int(6)]);
    print(rt.show(rt.V.str("u12 ")), rt.show(e), rt.show(rt.V.str(" ")), rt.show(rt.method(e, "is_empty", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(e, "size", [])));
    let f = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
    let g = f;
    {
      const _nv = rt.writeIdx(g, rt.V.int(0), rt.V.int(9));
      if (_nv !== null) g = _nv;
    }
    print(rt.show(rt.V.str("u13 ")), rt.show(f), rt.show(rt.V.str(" ")), rt.show(g));
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
    print(rt.show(rt.V.str("u14 ")), rt.show(f), rt.show(rt.V.str(" ")), rt.show(h), rt.show(rt.V.str(" ")), rt.show(s2));
    print(rt.show(rt.V.str("u15 ")), rt.show(rt.method(f, "slice", [rt.V.int(1), rt.V.int(3)])));
    rt.method(f, "reverse", []);
    print(rt.show(rt.V.str("u15b ")), rt.show(f));
    rt.method(f, "insert", [rt.V.int(0), rt.V.int(0)]);
    print(rt.show(rt.V.str("u16 ")), rt.show(f));
    rt.method(f, "remove_at", [rt.V.int(0)]);
    print(rt.show(rt.V.str("u17 ")), rt.show(f));
    print(rt.show(rt.V.str("u18 ")), rt.show(rt.method(rt.V.str("abc"), "to_ascii_buffer", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(104), rt.V.int(105)]))]), "get_string_from_ascii", [])));
    print(rt.show(rt.V.str("u19 ")), rt.show(rt.arrayFromVariant(f)), rt.show(rt.V.str(" ")), rt.show(rt.index(rt.arrayFromVariant(f), rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(rt.index(rt.arrayFromVariant(f), rt.V.int(0)))));
    let k = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]);
    rt.method(k, "append_array", [rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])]);
    rt.method(k, "fill", [rt.V.int(4)]);
    print(rt.show(rt.V.str("u21 ")), rt.show(k), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.bytesCtor([]), "size", [])));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
