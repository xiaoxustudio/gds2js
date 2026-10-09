// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  head(tag: rt.Variant, v: rt.Variant): void {
    let b = rt.gVarToBytes(v);
    print(rt.showArgs([tag, rt.V.str("sz|"), rt.method(b, "size", []), rt.V.str("|"), rt.method(b, "slice", [rt.V.int(0), rt.V.int(4)])]));
  }
  
  show(tag: rt.Variant, v: rt.Variant): void {
    print(rt.showArgs([tag, rt.V.str("t|"), rt.typeOf(v), rt.V.str("|"), rt.strBuiltin([v])]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.object(new Box());
    let c = rt.V.object(new Box());
    this.head(rt.V.str("h01|"), a);
    this.head(rt.V.str("h02|"), rt.V.array(rt.GArray.of([a, c])));
    this.head(rt.V.str("h03|"), rt.dictOf([[rt.V.str("k"), a]]));
    this.head(rt.V.str("h04|"), rt.V.array(rt.GArray.of([a])));
    this.show(rt.V.str("s01|"), rt.gBytesToVar(rt.gVarToBytes(a)));
    this.show(rt.V.str("s02|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(a)), rt.gBytesToVar(rt.gVarToBytes(a))));
    this.show(rt.V.str("s03|"), rt.ops.eq(a, a));
    let box = rt.gBytesToVar(rt.gVarToBytes(a));
    this.show(rt.V.str("s04|"), rt.ops.eq(rt.method(box, "get_object_id", []), rt.method(a, "get_instance_id", [])));
    this.show(rt.V.str("s05|"), rt.ops.eq(rt.method(box, "get_object_id", []), rt.method(c, "get_instance_id", [])));
    this.show(rt.V.str("s07|"), rt.wrapValue(rt.index(rt.gBytesToVar(rt.gVarToBytes(rt.V.array(rt.GArray.of([a])))), rt.V.int(0))));
    this.show(rt.V.str("s08|"), rt.wrapValue(rt.index(rt.gBytesToVar(rt.gVarToBytes(rt.dictOf([[rt.V.str("k"), a]]))), rt.V.str("k"))));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "head": return rt.wrapValue(this.head(args[0] as rt.Variant, args[1] as rt.Variant));
      case "show": return rt.wrapValue(this.show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "head": [2, 2], "show": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Box extends rt.GdScriptObject {
  n = rt.V.int(1);

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerScriptProps(__gd_d_Box, ["n"], (o) => { const s = o as Box; return [s.n]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["n"], {}, (o) => { const s = o as Box; return [s.n]; });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
