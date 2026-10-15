// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

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

  p(items: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "p");
    try {
      rt.frameLine(5);
      print(rt.showArgs([items, rt.V.str(" → "), rt.method(items, "min", []), rt.V.str(" | "), rt.method(items, "max", [])]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(8);
      this.p(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])));
      rt.frameLine(9);
      this.p(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(1.5)])));
      rt.frameLine(10);
      this.p(rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false)])));
      rt.frameLine(11);
      this.p(rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("c")])));
      rt.frameLine(12);
      this.p(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.vector2New([rt.V.int(5), rt.V.int(0)])])));
      rt.frameLine(13);
      this.p(rt.V.array(rt.GArray.of([rt.gRidFromInt64(rt.V.int(8)), rt.gRidFromInt64(rt.V.int(7)), rt.gRidFromInt64(rt.V.int(9))])));
      rt.frameLine(14);
      this.p(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(3)]))])));
      rt.frameLine(15);
      this.p(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("a"), rt.V.int(0)])));
      rt.frameLine(16);
      this.p(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.nil(), rt.V.int(1)])));
      rt.frameLine(17);
      this.p(rt.V.array(rt.GArray.of([rt.V.int(2), rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.V.int(1)])));
      rt.frameLine(18);
      this.p(rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), rt.dictOf([[rt.V.str("a"), rt.V.int(1)]])])));
      rt.frameLine(19);
      this.p(rt.V.array(rt.GArray.of([rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(2)]))]), rt.V.int(1)])));
      rt.frameLine(20);
      this.p(rt.V.array(rt.GArray.of([NAN, rt.V.float(1.5), rt.V.int(2)])));
      rt.frameLine(21);
      this.p(rt.V.array(rt.GArray.of([rt.V.float(1.5), NAN, rt.V.int(2)])));
      rt.frameLine(22);
      this.p(rt.V.array(rt.GArray.of([])));
      rt.frameLine(23);
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
      case "p": return rt.wrapValue(this.p(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "p": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
