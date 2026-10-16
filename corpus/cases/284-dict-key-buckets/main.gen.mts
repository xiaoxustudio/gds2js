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
      let d = rt.dictOf([[rt.V.int(1), rt.V.str("int")], [rt.V.float(1), rt.V.str("float")], [rt.V.float(0), rt.V.str("zero")], [rt.V.bool(true), rt.V.str("bool")], [rt.V.str("a"), rt.V.str("str")], [rt.V.int(0), rt.V.str("inti")], [rt.V.bool(false), rt.V.str("boolf")], [rt.V.nil(), rt.V.str("nil")], [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("vec")]]);
      rt.frameLine(5);
      print(rt.showArgs([rt.method(d, "size", [])]));
      rt.frameLine(6);
      for (let k of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(1), rt.V.int(0), rt.V.bool(false), rt.V.bool(true), rt.V.nil(), rt.V.str("a"), rt.V.stringName("a"), rt.vector2New([rt.V.float(1), rt.V.float(2)]), rt.V.int(2)])))) {
        rt.frameLine(7);
        print(rt.showArgs([rt.typeOf(k), rt.V.str("|"), rt.method(d, "has", [k]), rt.V.str("|"), rt.method(d, "get", [k, rt.V.str("-")])]));
      }
      rt.frameLine(8);
      let nz = (0 * (-1));
      rt.frameLine(9);
      print(rt.showArgs([rt.typeOf(rt.V.float(nz)), rt.V.str("|"), rt.method(d, "has", [rt.V.float(nz)]), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.V.float(nz)))]));
      rt.frameLine(10);
      print(rt.showArgs([d]));
      rt.frameLine(11);
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
