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
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(0)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(3)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(30)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(300)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1023)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1024)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1025)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1026)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1075)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1076)])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1126)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1280)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1536)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1792)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2047)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2048)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2049)])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(2560)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(3000)])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(5120)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(10240)])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(102400)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(30000)])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(300000)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1048575)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1048576)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1048577)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1049601)])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1052672)])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1234567)])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(3000000)])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(4000000)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1073741823)])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1073741824)])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1073741825)])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1074790400)])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(30000000)])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(400000000)])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1099511627776)])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1125899906842624)])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(1152921504606846976n)])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int(9223372036854775807n)])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.int((-1024))])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.stringStatic("humanize_size", [rt.V.float(1.9)])]));
      rt.frameLine(49);
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
