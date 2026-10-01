// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let s = rt.V.stringName("abc");
    print(rt.showArgs([s]));
    print(rt.showArgs([rt.ops.eq(s, rt.V.str("abc"))]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("abc"), s)]));
    print(rt.showArgs([rt.ops.eq(s, rt.V.stringName("abc"))]));
    print(rt.showArgs([rt.ops.eq(rt.V.stringName("A"), rt.V.stringName("a"))]));
    print(rt.showArgs([rt.typeOf(s)]));
    print(rt.showArgs([rt.isType(s, "StringName")]));
    print(rt.showArgs([rt.isType(s, "String")]));
    print(rt.showArgs([rt.strOf(s)]));
    print(rt.showArgs([rt.lengthOf(s)]));
    print(rt.showArgs([rt.method(s, "length", [])]));
    print(rt.showArgs([rt.method(s, "left", [rt.V.int(2)])]));
    print(rt.showArgs([rt.method(s, "substr", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.typeOf(rt.method(s, "substr", [rt.V.int(1), rt.V.int(2)]))]));
    print(rt.showArgs([rt.method(rt.method(s, "split", [rt.V.str("b")]), "size", [])]));
    print(rt.showArgs([rt.method(s, "contains", [rt.V.str("b")])]));
    print(rt.showArgs([rt.method(s, "to_upper", [])]));
    print(rt.showArgs([rt.typeOf(rt.method(s, "to_upper", []))]));
    print(rt.showArgs([rt.isType(rt.method(s, "to_upper", []), "String")]));
    print(rt.showArgs([rt.ops.add(rt.V.stringName("a"), rt.V.stringName("b"))]));
    print(rt.showArgs([rt.typeOf(rt.ops.add(rt.V.stringName("a"), rt.V.stringName("b")))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("x"), rt.V.stringName("y"))]));
    print(rt.showArgs([rt.ops.add(rt.V.stringName("k"), rt.V.str("y"))]));
    print(rt.showArgs([rt.stringNameCtor([rt.V.str("xyz")])]));
    print(rt.showArgs([rt.typeOf(rt.stringNameCtor([rt.V.str("xyz")]))]));
    print(rt.showArgs([rt.ops.eq(rt.stringNameCtor([rt.V.str("xyz")]), rt.V.str("xyz"))]));
    print(rt.showArgs([rt.ops.eq(rt.stringCtor([rt.V.stringName("k")]), rt.V.str("k"))]));
    print(rt.showArgs([rt.typeOf(rt.stringCtor([rt.V.stringName("k")]))]));
    print(rt.showArgs([rt.V.array(rt.GArray.of([s]))]));
    print(rt.showArgs([rt.dictOf([[rt.V.str("a"), s]])]));
    print(rt.showArgs([rt.dictOf([[rt.V.stringName("k"), rt.V.int(1)]])]));
    let d = rt.dictOf([[rt.V.stringName("k"), rt.V.int(1)]]);
    print(rt.showArgs([rt.index(d, rt.V.str("k"))]));
    print(rt.showArgs([rt.index(d, rt.V.stringName("k"))]));
    print(rt.showArgs([rt.method(d, "has", [rt.V.str("k")])]));
    print(rt.showArgs([rt.method(d, "size", [])]));
    {
      const _nv = rt.writeIdx(d, s, rt.V.int(7));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d]));
    let e = rt.toStringNameSlot(rt.V.stringName("q"));
    print(rt.showArgs([e]));
    print(rt.showArgs([rt.ops.neq(rt.V.stringName("abc"), rt.V.stringName("abd"))]));
    print(rt.showArgs([rt.typeOf(rt.strOf(s))]));
    print(rt.showArgs([rt.ops.eq(rt.strOf(s), rt.V.str("abc"))]));
    print(rt.showArgs([rt.ops.neq(s, rt.V.str("abc"))]));
    let sn = rt.V.stringName("");
    let st = "";
    print(rt.showArgs([rt.ops.eq(rt.method(sn, "md5_text", []), rt.method(rt.V.str(st), "md5_text", []))]));
    print(rt.showArgs([rt.method(sn, "md5_text", [])]));
    print(rt.showArgs([rt.V.stringName("")]));
    let t = "abc";
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int(2)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int(0)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int(5)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int((-1))])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int((-5))])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "right", [rt.V.int(2)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "right", [rt.V.int((-1))])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "right", [rt.V.int(5)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(s, "left", [rt.V.int(2)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(s, "right", [rt.V.int(2)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.method(rt.V.str(t), "contains", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str(t), "contains", [rt.V.str("bc")])]));
    print(rt.showArgs([rt.method(rt.V.str(t), "contains", [rt.V.str("A")])]));
    print(rt.showArgs([rt.method(rt.V.str(t), "is_empty", [])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "is_empty", [])]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int(2)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int((-2))])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int(0), rt.V.int((-1))])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int(5)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(s, "substr", [rt.V.int(2)])), rt.V.str("]"))]));
    print(rt.showArgs([rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(",")])]));
    print(rt.showArgs([rt.method(rt.V.str("a,,b"), "split", [rt.V.str(",")])]));
    print(rt.showArgs([rt.method(rt.V.str("a,b,"), "split", [rt.V.str(",")])]));
    print(rt.showArgs([rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(false)])]));
    print(rt.showArgs([rt.method(rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(false)]), "size", [])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "split", [rt.V.str(",")])]));
    print(rt.showArgs([rt.method(rt.method(rt.V.str(""), "split", [rt.V.str(",")]), "size", [])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "split", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.method(rt.V.str(""), "split", [rt.V.str("")]), "size", [])]));
    print(rt.showArgs([rt.method(rt.ops.add(rt.ops.add(rt.stringStatic("chr", [rt.V.int(128157)]), rt.V.str("x")), rt.stringStatic("chr", [rt.V.int(128157)])), "split", [rt.V.str("x")])]));
    print(rt.showArgs([rt.method(rt.ops.add(rt.stringStatic("chr", [rt.V.int(128157)]), rt.V.str("xy")), "left", [rt.V.int(1)])]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
