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
      let x = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("q01|"), rt.wrapValue(rt.attribute(x, "name")), rt.V.str("|"), rt.method(x, "get_child_count", []), rt.V.str("|"), rt.method(x, "get_index", []), rt.V.str("|"), rt.strBuiltin([x])]));
      rt.frameLine(6);
      let p = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(p, "name", rt.V.str("par"));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(8);
      rt.method(p, "add_child", [x]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("q02|"), rt.wrapValue(rt.attribute(x, "name")), rt.V.str("|"), rt.method(p, "get_child_count", []), rt.V.str("|"), rt.method(x, "get_index", []), rt.V.str("|"), rt.strBuiltin([rt.method(x, "get_parent", [])])]));
      rt.frameLine(10);
      let b = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(b, "name", rt.V.str("kid"));
        if (_nv !== null) b = _nv;
      }
      rt.frameLine(12);
      rt.method(p, "add_child", [b]);
      rt.frameLine(13);
      let clash = rt.method(rt.nativeClass("Node"), "new", []);
      rt.frameLine(14);
      {
        const _nv = rt.writeProp(clash, "name", rt.V.str("kid"));
        if (_nv !== null) clash = _nv;
      }
      rt.frameLine(15);
      rt.method(p, "add_child", [clash]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("q03|"), rt.wrapValue(rt.attribute(b, "name")), rt.V.str("|"), rt.wrapValue(rt.attribute(clash, "name")), rt.V.str("|"), rt.strBuiltin([rt.method(p, "get_children", [])])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("q04|"), rt.strBuiltin([rt.method(p, "get_node", [rt.V.str("kid")])]), rt.V.str("|"), rt.ops.eq(rt.method(p, "get_node_or_null", [rt.V.str("nope")]), rt.V.nil()), rt.V.str("|"), rt.method(p, "has_node", [rt.V.str("kid")]), rt.V.str("|"), rt.method(x, "has_node", [rt.V.str("kid")])]));
      rt.frameLine(18);
      {
        const _nv = rt.writeProp(b, "name", rt.V.str("a:b.c/d"));
        if (_nv !== null) b = _nv;
      }
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("q05|"), rt.wrapValue(rt.attribute(b, "name")), rt.V.str("|"), rt.method(b, "get_name", []), rt.V.str("|"), rt.method(b, "get_class", [])]));
      rt.frameLine(20);
      rt.method(p, "move_child", [clash, rt.V.int(0)]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("q06|"), rt.method(clash, "get_index", []), rt.V.str("|"), rt.ops.eq(rt.method(p, "get_child", [rt.V.int(0)]), clash), rt.V.str("|"), rt.method(b, "get_index", [])]));
      rt.frameLine(22);
      rt.method(x, "free", []);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("q07|"), rt.gIsInstanceValid(x), rt.V.str("|"), rt.method(p, "get_child_count", [])]));
      rt.frameLine(24);
      rt.method(p, "remove_child", [b]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("q08|"), rt.ops.eq(rt.method(b, "get_parent", []), rt.V.nil()), rt.V.str("|"), rt.method(p, "get_child_count", [])]));
      rt.frameLine(26);
      rt.method(p, "add_child", [b]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("q09|"), rt.wrapValue(rt.attribute(b, "name")), rt.V.str("|"), rt.method(p, "get_child_count", []), rt.V.str("|"), rt.strBuiltin([p])]));
      rt.frameLine(28);
      let rc = rt.method(rt.nativeClass("RefCounted"), "new", []);
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("q10|"), rt.strBuiltin([rc]), rt.V.str("|"), rt.method(rc, "get_class", []), rt.V.str("|"), rt.typeOf(rc)]));
      rt.frameLine(30);
      let d = rt.dictOf([[p, rt.V.int(1)]]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("q11|"), rt.wrapValue(rt.index(d, p)), rt.V.str("|"), rt.ops.eq(p, p), rt.V.str("|"), rt.ops.eq(p, b)]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("q12|"), rt.strBuiltin([rt.method(b, "get_children", [])]), rt.V.str("|"), rt.method(b, "is_inside_tree", []), rt.V.str("|"), rt.method(p, "is_inside_tree", [])]));
      rt.frameLine(33);
      rt.method(p, "free", []);
      rt.frameLine(34);
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
