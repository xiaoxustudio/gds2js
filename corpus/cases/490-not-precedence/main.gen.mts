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
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("a|"), rt.V.bool(!rt.ops.truthy(rt.V.bool(((1 as number) === (2 as number))))), rt.V.str("|"), rt.V.bool(!rt.ops.truthy(rt.V.bool(((1 as number) === (1 as number)))))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("c|"), rt.V.bool(!rt.ops.truthy(rt.V.bool(((1 as number) < (2 as number))))), rt.V.str("|"), rt.V.bool(!rt.ops.truthy(rt.V.bool(((1 as number) > (2 as number)))))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("d|"), rt.and(rt.V.bool(!rt.ops.truthy(rt.V.bool(true))), () => rt.V.bool(false)), rt.V.str("|"), rt.and(rt.V.bool(!rt.ops.truthy(rt.V.bool(false))), () => rt.V.bool(true))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("e|"), rt.V.bool(!rt.ops.truthy(rt.ops.inOp(rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))))), rt.V.str("|"), rt.V.bool(!rt.ops.truthy(rt.ops.inOp(rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("f|"), rt.V.bool(!rt.ops.truthy(rt.V.bool(((1 as number) === (1 as number))))), rt.V.str("|"), rt.V.bool(!rt.ops.truthy(rt.V.bool(!rt.ops.truthy(rt.V.bool(true)))))]));
      rt.frameLine(10);
      let x = 3;
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("g|"), rt.or(rt.V.bool(!rt.ops.truthy(rt.V.bool((x === (3 as number))))), () => rt.V.bool((x === (4 as number)))), rt.V.str("|"), rt.V.bool(!rt.ops.truthy(rt.V.bool((x !== (3 as number)))))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("h|"), rt.V.bool(!rt.ops.truthy(rt.V.bool((((-1) as number) === ((-1) as number))))), rt.V.str("|"), rt.V.bool(!rt.ops.truthy(rt.V.bool((rt.fast.iAddC(1, 1) === (2 as number)))))]));
      rt.frameLine(13);
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
