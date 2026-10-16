// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare fd_int: rt.Variant;
  declare fd_float: rt.Variant;
  declare fd_color: rt.Variant;
  declare fd_vec2i: rt.Variant;
  declare fd_name: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.fd_int = rt.toInt(rt.V.float(2.7));
      rt.frameLine(4);
      this.fd_float = rt.toFloat(rt.V.int(3));
      rt.frameLine(5);
      this.fd_color = rt.toColor(rt.V.int(255));
      rt.frameLine(6);
      this.fd_vec2i = rt.toVec2i(rt.vector2New([rt.V.float(1.7), rt.V.float(2.9)]));
      rt.frameLine(7);
      this.fd_name = rt.toStringNameSlot(rt.V.str("nm"));
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
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("r "), this.fd_int, rt.V.str(" "), this.fd_float, rt.V.str(" "), this.fd_color, rt.V.str(" "), this.fd_vec2i, rt.V.str(" "), rt.typeOf(this.fd_name), rt.V.str(" "), this.fd_name]));
      rt.frameLine(11);
      let c = rt.toColor(rt.V.int(123456789));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("c "), c, rt.V.str(" "), rt.typeOf(c)]));
      rt.frameLine(13);
      c = rt.toColor(rt.V.str("abc"));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("c2 "), c]));
      rt.frameLine(15);
      let n = rt.toStringNameSlot(rt.V.str("zz"));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("n "), rt.typeOf(n), rt.V.str(" "), n]));
      rt.frameLine(17);
      let a = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("f00")])), "Color", true);
      rt.frameLine(18);
      rt.method(a, "append", [rt.V.int(65280)]);
      rt.frameLine(19);
      {
        const _nv = rt.writeIdx(a, rt.V.int(0), rt.V.int(4294967295));
        if (_nv !== null) a = _nv;
      }
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("a "), a, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(a, rt.V.int(1))))]));
      rt.frameLine(21);
      let d = rt.stampDict(rt.dictOf([[rt.V.str("k"), rt.V.int(5)]]), "StringName", "Color", true);
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("d "), d, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(rt.method(d, "keys", []), rt.V.int(0)))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(d, rt.V.str("k"))))]));
      rt.frameLine(23);
      let s = rt.strOf(rt.V.stringName("abc"));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("s "), s, rt.V.str(" "), rt.typeOf(s)]));
      rt.frameLine(25);
      let arr = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.stringName("abc")])), "String", true);
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("arr "), arr, rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(arr, rt.V.int(0))))]));
      rt.frameLine(27);
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
rt.registerFieldTypes(__gd_d_Main, {"fd_int": "int", "fd_float": "float"});
rt.registerScriptProps(__gd_d_Main, ["fd_int","fd_float","fd_color","fd_vec2i","fd_name"], (o) => { const s = o as Main; return [s.fd_int, s.fd_float, s.fd_color, s.fd_vec2i, s.fd_name]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["fd_int","fd_float","fd_color","fd_vec2i","fd_name"], {}, (o) => { const s = o as Main; return [s.fd_int, s.fd_float, s.fd_color, s.fd_vec2i, s.fd_name]; });
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
