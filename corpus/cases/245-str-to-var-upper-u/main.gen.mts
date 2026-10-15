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

  sv(raw: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sv");
    try {
      raw = rt.paramSlot(raw, "String", 1, "sv", this);
      rt.frameLine(4);
      return rt.strToVar(rt.ops.add(rt.ops.add(rt.V.str("\""), raw), rt.V.str("\"")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("w01|"), rt.typeOf(this.sv(rt.V.str("\\U000041"))), rt.V.str("|"), this.sv(rt.V.str("\\U000041"))]));
      rt.frameLine(8);
      let v2 = this.sv(rt.V.str("\\U0001F600"));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("w02|"), rt.typeOf(v2), rt.V.str("|"), v2, rt.V.str("|"), rt.method(v2, "length", []), rt.V.str("|"), rt.method(v2, "unicode_at", [rt.V.int(0)])]));
      rt.frameLine(10);
      let v3 = this.sv(rt.V.str("\\U10FFFF"));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("w03|"), rt.typeOf(v3), rt.V.str("|"), rt.method(v3, "length", []), rt.V.str("|"), rt.method(v3, "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.method(v3, "to_utf8_buffer", []), "hex_encode", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("w04|"), rt.typeOf(this.sv(rt.V.str("\\U0041"))), rt.V.str("|"), this.sv(rt.V.str("\\U0041"))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("w05|"), rt.typeOf(this.sv(rt.V.str("\\U00D800"))), rt.V.str("|"), this.sv(rt.V.str("\\U00D800"))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("w06|"), rt.typeOf(this.sv(rt.V.str("\\U00DFFF00"))), rt.V.str("|"), this.sv(rt.V.str("\\U00DFFF00"))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("w07|"), rt.typeOf(this.sv(rt.V.str("\\U0001F"))), rt.V.str("|"), this.sv(rt.V.str("\\U0001F"))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("w08|"), rt.typeOf(this.sv(rt.V.str("\\U0000G1"))), rt.V.str("|"), this.sv(rt.V.str("\\U0000G1"))]));
      rt.frameLine(17);
      let v9 = this.sv(rt.V.str("a\\U0000e9b"));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("w09|"), rt.typeOf(v9), rt.V.str("|"), v9, rt.V.str("|"), rt.method(v9, "length", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("w10|"), this.sv(rt.V.str("\\u0041\\U000042"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("w11|"), rt.strToVar(rt.V.str("[\"\\U000041\", \"\\U000042\"]"))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("w12|"), rt.typeOf(this.sv(rt.V.str("\\U"))), rt.V.str("|"), this.sv(rt.V.str("\\U"))]));
      rt.frameLine(22);
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
      case "sv": return rt.wrapValue(this.sv(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "sv": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
