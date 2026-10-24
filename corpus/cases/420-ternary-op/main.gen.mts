// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare log: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.log = rt.V.array(rt.GArray.of([]));
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

  side(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "side");
    try {
      rt.frameLine(6);
      rt.method(this.log, "append", [x]);
      rt.frameLine(7);
      return x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(10);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => rt.V.int(1), () => rt.V.int(2))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => rt.V.int(1), () => rt.tern(rt.V.bool(true), () => rt.V.int(2), () => rt.V.int(3)))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => rt.V.int((-1)), () => rt.V.int(2))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.ops.add(rt.V.int(1), rt.tern(rt.V.bool(true), () => rt.V.int(1), () => rt.V.int(2)))]));
      rt.frameLine(14);
      let pz = 0;
      rt.frameLine(15);
      let nz = (pz * (-1));
      rt.frameLine(16);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => rt.V.float(nz), () => rt.V.int(1))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => rt.V.int(9007199254740993n), () => rt.V.int(1))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => this.side(rt.V.int(1)), () => this.side(rt.V.int(2)))]));
      rt.frameLine(19);
      print(rt.showArgs([this.log]));
      rt.frameLine(20);
      print(rt.showArgs([rt.tern(rt.V.bool((5 > 3)), () => rt.V.str("big"), () => rt.V.str("small"))]));
      rt.frameLine(21);
      let d = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
      rt.frameLine(22);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => d, () => rt.V.int(9))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.wrapValue(rt.index(rt.tern(rt.V.bool(true), () => d, () => rt.V.int(9)), rt.V.int(1)))]));
      rt.frameLine(24);
      let v = rt.toInt(rt.tern(rt.V.bool(true), () => rt.V.int(1), () => rt.V.float(2.5)));
      rt.frameLine(25);
      print(rt.showArgs([v]));
      rt.frameLine(26);
      print(rt.showArgs([rt.tern(rt.V.bool(true), () => rt.V.nil(), () => rt.V.int(1))]));
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
      case "side": return rt.wrapValue(this.side(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["log"], (o) => { const s = o as Main; return [s.log]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["log"], {}, (o) => { const s = o as Main; return [s.log]; });
rt.registerMethodArities(__gd_d_Main, { "side": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
