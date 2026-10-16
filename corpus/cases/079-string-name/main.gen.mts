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
      rt.frameLine(4);
      let s = rt.V.stringName("abc");
      rt.frameLine(5);
      print(rt.showArgs([s]));
      rt.frameLine(6);
      print(rt.showArgs([rt.ops.eq(s, rt.V.str("abc"))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.ops.eq(rt.V.str("abc"), s)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.ops.eq(s, rt.V.stringName("abc"))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.ops.eq(rt.V.stringName("A"), rt.V.stringName("a"))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.typeOf(s)]));
      rt.frameLine(11);
      print(rt.showArgs([rt.isType(s, "StringName")]));
      rt.frameLine(12);
      print(rt.showArgs([rt.isType(s, "String")]));
      rt.frameLine(13);
      print(rt.showArgs([rt.strBuiltin([s])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.lengthOf(s)]));
      rt.frameLine(15);
      print(rt.showArgs([rt.method(s, "length", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.method(s, "left", [rt.V.int(2)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.method(s, "substr", [rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.typeOf(rt.method(s, "substr", [rt.V.int(1), rt.V.int(2)]))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.method(rt.method(s, "split", [rt.V.str("b")]), "size", [])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.method(s, "contains", [rt.V.str("b")])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.method(s, "to_upper", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.typeOf(rt.method(s, "to_upper", []))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.isType(rt.method(s, "to_upper", []), "String")]));
      rt.frameLine(24);
      print(rt.showArgs([rt.ops.add(rt.V.stringName("a"), rt.V.stringName("b"))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.typeOf(rt.ops.add(rt.V.stringName("a"), rt.V.stringName("b")))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.ops.add(rt.V.str("x"), rt.V.stringName("y"))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.ops.add(rt.V.stringName("k"), rt.V.str("y"))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.stringNameCtor([rt.V.str("xyz")])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.typeOf(rt.stringNameCtor([rt.V.str("xyz")]))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.ops.eq(rt.stringNameCtor([rt.V.str("xyz")]), rt.V.str("xyz"))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.ops.eq(rt.stringCtor([rt.V.stringName("k")]), rt.V.str("k"))]));
      rt.frameLine(32);
      print(rt.showArgs([rt.typeOf(rt.stringCtor([rt.V.stringName("k")]))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.array(rt.GArray.of([s]))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.dictOf([[rt.V.str("a"), s]])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.dictOf([[rt.V.stringName("k"), rt.V.int(1)]])]));
      rt.frameLine(36);
      let d = rt.dictOf([[rt.V.stringName("k"), rt.V.int(1)]]);
      rt.frameLine(37);
      print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.str("k")))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.stringName("k")))]));
      rt.frameLine(39);
      print(rt.showArgs([rt.method(d, "has", [rt.V.str("k")])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.method(d, "size", [])]));
      rt.frameLine(41);
      {
        const _nv = rt.writeIdx(d, s, rt.V.int(7));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(42);
      print(rt.showArgs([d]));
      rt.frameLine(43);
      let e = rt.toStringNameSlot(rt.V.stringName("q"));
      rt.frameLine(44);
      print(rt.showArgs([e]));
      rt.frameLine(45);
      print(rt.showArgs([rt.ops.neq(rt.V.stringName("abc"), rt.V.stringName("abd"))]));
      rt.frameLine(46);
      print(rt.showArgs([rt.typeOf(rt.strBuiltin([s]))]));
      rt.frameLine(47);
      print(rt.showArgs([rt.ops.eq(rt.strBuiltin([s]), rt.V.str("abc"))]));
      rt.frameLine(48);
      print(rt.showArgs([rt.ops.neq(s, rt.V.str("abc"))]));
      rt.frameLine(51);
      let sn = rt.V.stringName("");
      rt.frameLine(52);
      let st = "";
      rt.frameLine(53);
      print(rt.showArgs([rt.ops.eq(rt.method(sn, "md5_text", []), rt.method(rt.V.str(st), "md5_text", []))]));
      rt.frameLine(54);
      print(rt.showArgs([rt.method(sn, "md5_text", [])]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.stringName("")]));
      rt.frameLine(58);
      let t = "abc";
      rt.frameLine(59);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int(2)])), rt.V.str("]"))]));
      rt.frameLine(60);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int(0)])), rt.V.str("]"))]));
      rt.frameLine(61);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int(5)])), rt.V.str("]"))]));
      rt.frameLine(62);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int((-1))])), rt.V.str("]"))]));
      rt.frameLine(63);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "left", [rt.V.int((-5))])), rt.V.str("]"))]));
      rt.frameLine(64);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "right", [rt.V.int(2)])), rt.V.str("]"))]));
      rt.frameLine(65);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "right", [rt.V.int((-1))])), rt.V.str("]"))]));
      rt.frameLine(66);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "right", [rt.V.int(5)])), rt.V.str("]"))]));
      rt.frameLine(67);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(s, "left", [rt.V.int(2)])), rt.V.str("]"))]));
      rt.frameLine(68);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(s, "right", [rt.V.int(2)])), rt.V.str("]"))]));
      rt.frameLine(69);
      print(rt.showArgs([rt.method(rt.V.str(t), "contains", [rt.V.str("")])]));
      rt.frameLine(70);
      print(rt.showArgs([rt.method(rt.V.str(t), "contains", [rt.V.str("bc")])]));
      rt.frameLine(71);
      print(rt.showArgs([rt.method(rt.V.str(t), "contains", [rt.V.str("A")])]));
      rt.frameLine(72);
      print(rt.showArgs([rt.method(rt.V.str(t), "is_empty", [])]));
      rt.frameLine(73);
      print(rt.showArgs([rt.method(rt.V.str(""), "is_empty", [])]));
      rt.frameLine(74);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int(2)])), rt.V.str("]"))]));
      rt.frameLine(75);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int((-2))])), rt.V.str("]"))]));
      rt.frameLine(76);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int(0), rt.V.int((-1))])), rt.V.str("]"))]));
      rt.frameLine(77);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(rt.V.str(t), "substr", [rt.V.int(5)])), rt.V.str("]"))]));
      rt.frameLine(78);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("["), rt.method(s, "substr", [rt.V.int(2)])), rt.V.str("]"))]));
      rt.frameLine(79);
      print(rt.showArgs([rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(",")])]));
      rt.frameLine(80);
      print(rt.showArgs([rt.method(rt.V.str("a,,b"), "split", [rt.V.str(",")])]));
      rt.frameLine(81);
      print(rt.showArgs([rt.method(rt.V.str("a,b,"), "split", [rt.V.str(",")])]));
      rt.frameLine(82);
      print(rt.showArgs([rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(false)])]));
      rt.frameLine(83);
      print(rt.showArgs([rt.method(rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(false)]), "size", [])]));
      rt.frameLine(84);
      print(rt.showArgs([rt.method(rt.V.str(""), "split", [rt.V.str(",")])]));
      rt.frameLine(85);
      print(rt.showArgs([rt.method(rt.method(rt.V.str(""), "split", [rt.V.str(",")]), "size", [])]));
      rt.frameLine(86);
      print(rt.showArgs([rt.method(rt.V.str("abc"), "split", [rt.V.str("")])]));
      rt.frameLine(87);
      print(rt.showArgs([rt.method(rt.method(rt.V.str(""), "split", [rt.V.str("")]), "size", [])]));
      rt.frameLine(88);
      print(rt.showArgs([rt.method(rt.ops.add(rt.ops.add(rt.stringStatic("chr", [rt.V.int(128157)]), rt.V.str("x")), rt.stringStatic("chr", [rt.V.int(128157)])), "split", [rt.V.str("x")])]));
      rt.frameLine(89);
      print(rt.showArgs([rt.method(rt.ops.add(rt.stringStatic("chr", [rt.V.int(128157)]), rt.V.str("xy")), "left", [rt.V.int(1)])]));
      rt.frameLine(90);
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
