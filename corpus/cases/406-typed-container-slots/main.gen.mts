// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare mi: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.mi = rt.stampArray(rt.V.array(rt.GArray.of([])), "int", true);
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
      rt.frameLine(6);
      let u = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1)])), "int", true);
      rt.frameLine(7);
      let alias = rt.stampArray(u, "int", false);
      rt.frameLine(8);
      {
        const _nv = rt.writeIdx(u, rt.V.int(0), rt.V.int(7));
        if (_nv !== null) u = _nv;
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("A="), alias]));
      rt.frameLine(10);
      let lit = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(2)])), "int", true);
      rt.frameLine(11);
      lit = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("B="), lit]));
      rt.frameLine(13);
      let d = rt.stampDict(rt.dictOf([[rt.V.int(1), rt.V.str("a")]]), "int", "String", true);
      rt.frameLine(14);
      d = rt.dictOf([[rt.V.int(2), rt.V.str("b")]]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("C="), d]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("D="), this.retLit(), this.retThrough()]));
      rt.frameLine(17);
      this.mi = rt.assignContainer(u, "Array[int]");
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("E="), this.mi]));
      rt.frameLine(19);
      let w = u;
      rt.frameLine(20);
      let to = rt.stampArray(w, "int", false);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("F="), to, rt.V.str(" "), rt.method(to, "is_typed", [])]));
      rt.frameLine(22);
      let sd = rt.stampDict(rt.dictOf([[rt.V.int(1), rt.V.str("x")]]), "int", "String", true);
      rt.frameLine(23);
      let wd = sd;
      rt.frameLine(24);
      let td = rt.stampDict(wd, "int", "String", false);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("G="), td, rt.V.str(" "), rt.method(td, "is_typed", [])]));
      rt.frameLine(26);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  retLit(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "retLit");
    try {
      rt.frameLine(29);
      return rt.V.array(rt.GArray.of([rt.V.int(9)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.array(rt.GArray.of([]));
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  retThrough(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "retThrough");
    try {
      rt.frameLine(32);
      let conv = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("s")])), "String", true);
      rt.frameLine(33);
      let through = conv;
      rt.frameLine(34);
      return rt.returnContainer(through, "Array[String]");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.array(rt.GArray.of([]));
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "retLit": return rt.wrapValue(this.retLit());
      case "retThrough": return rt.wrapValue(this.retThrough());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["mi"], (o) => { const s = o as Main; return [s.mi]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["mi"], {}, (o) => { const s = o as Main; return [s.mi]; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "retLit": [0, 0], "retThrough": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
