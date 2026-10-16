// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

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
      let a = rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.float(0.5)]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("S|"), rt.colorStatic("hex", [rt.V.int(1193046)]), rt.V.str("|"), rt.colorStatic("hex64", [rt.V.int(1234605616436508552n)]), rt.V.str("|"), rt.colorStatic("hex", [rt.V.int((-1))]), rt.V.str("|"), rt.colorStatic("hex", [rt.V.int(4294967295)]), rt.V.str("|"), rt.colorStatic("hex", [rt.V.int(4294967296)]), rt.V.str("|"), rt.colorStatic("hex64", [rt.V.int((-1))]), rt.V.str("|"), rt.colorStatic("hex64", [rt.V.int(9223372036854775807n)]), rt.V.str("|"), rt.colorStatic("hex64", [rt.V.int(281474976710655)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("I|"), rt.method(a, "hex", [rt.V.int(1193046)]), rt.V.str("|"), rt.method(a, "hex64", [rt.V.int(1234605616436508552n)]), rt.V.str("|"), rt.method(a, "html", [rt.V.str("80ff00")]), rt.V.str("|"), rt.method(a, "html_is_valid", [rt.V.str("zzz")]), rt.V.str("|"), rt.method(a, "html_is_valid", [rt.V.str("80ff00")]), rt.V.str("|"), rt.method(a, "from_string", [rt.V.str("zzz"), rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)])]), rt.V.str("|"), rt.method(a, "from_hsv", [rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75)]), rt.V.str("|"), rt.method(a, "from_hsv", [rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.float(0.25)]), rt.V.str("|"), rt.typeOf(rt.method(a, "hex", [rt.V.int(1)]))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("B|"), rt.method(a, "blend", [rt.colorNew([rt.V.float(0.8), rt.V.float(0.2), rt.V.float(0.4), rt.V.float(1)])]), rt.V.str("|"), rt.method(a, "blend", [rt.colorNew([rt.V.float(0.8), rt.V.float(0.2), rt.V.float(0.4), rt.V.float(0)])]), rt.V.str("|"), rt.method(a, "blend", [a]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "blend", [rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "blend", [rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.int(0)])]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), "blend", [rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.float(0.5)])]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.2)]), "blend", [rt.colorNew([rt.V.float(0.9), rt.V.float(0.8), rt.V.float(0.7), rt.V.float(0.9)])])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("BN|"), rt.method(a, "blend", [rt.colorNew([NAN, rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str("|"), rt.method(a, "blend", [rt.colorNew([INF, rt.V.float(0.5), rt.V.float(0.5), rt.V.float(1)])]), rt.V.str("|"), rt.method(a, "blend", [rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), INF])])]));
      rt.frameLine(9);
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
