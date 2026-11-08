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

  _worker(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_worker");
    try {
      rt.frameLine(4);
      return rt.ops.mul(x, rt.V.int(2));
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
      rt.frameLine(7);
      let m = rt.method(rt.nativeClass("Mutex"), "new", []);
      rt.frameLine(8);
      rt.method(m, "lock", []);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("m1|"), rt.method(m, "try_lock", [])]));
      rt.frameLine(10);
      rt.method(m, "unlock", []);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("m2|"), rt.method(m, "try_lock", [])]));
      rt.frameLine(12);
      rt.method(m, "unlock", []);
      rt.frameLine(13);
      let s = rt.method(rt.nativeClass("Semaphore"), "new", []);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("s1|"), rt.method(s, "try_wait", [])]));
      rt.frameLine(15);
      rt.method(s, "post", []);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("s2|"), rt.method(s, "try_wait", []), rt.V.str("|"), rt.method(s, "try_wait", [])]));
      rt.frameLine(17);
      rt.method(s, "post", [rt.V.int(2)]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("s3|"), rt.method(s, "try_wait", []), rt.V.str("|"), rt.method(s, "try_wait", []), rt.V.str("|"), rt.method(s, "try_wait", [])]));
      rt.frameLine(19);
      let t = rt.method(rt.nativeClass("Thread"), "new", []);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t1|"), rt.method(t, "is_started", []), rt.V.str("|"), rt.method(t, "is_alive", []), rt.V.str("|"), rt.method(t, "is_main_thread", [])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t2|"), rt.method(t, "start", [rt.method(rt.methodCallable(rt.V.object(this), "_worker"), "bind", [rt.V.int(21)])])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t3|"), rt.method(t, "is_started", []), rt.V.str("|"), rt.method(t, "is_alive", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("t4|"), rt.method(t, "wait_to_finish", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("t5|"), rt.method(t, "is_started", []), rt.V.str("|"), rt.method(t, "is_alive", []), rt.V.str("|"), rt.method(t, "get_id", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("t6|"), rt.wrapValue(rt.attribute(rt.nativeClass("Thread"), "PRIORITY_LOW")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Thread"), "PRIORITY_NORMAL")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Thread"), "PRIORITY_HIGH"))]));
      rt.frameLine(26);
      let t2 = rt.method(rt.nativeClass("Thread"), "new", []);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("t7|"), rt.method(t2, "start", [rt.method(rt.methodCallable(rt.V.object(this), "_worker"), "bind", [rt.V.int(1)]), rt.wrapValue(rt.attribute(rt.nativeClass("Thread"), "PRIORITY_HIGH"))]), rt.V.str("|"), rt.method(t2, "wait_to_finish", [])]));
      rt.frameLine(28);
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
      case "_worker": return rt.wrapValue(this._worker(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_worker": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
