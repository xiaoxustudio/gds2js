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
      let a = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
      rt.frameLine(5);
      let h = rt.method(rt.V.str("hello hello hello"), "to_utf8_buffer", []);
      rt.frameLine(6);
      for (let mode of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])))) {
        rt.frameLine(7);
        let ca = rt.method(a, "compress", [mode]);
        rt.frameLine(8);
        let ch = rt.method(h, "compress", [mode]);
        rt.frameLine(9);
        print(rt.showArgs([rt.V.str("m"), mode, rt.V.str(" "), rt.method(ca, "size", []), rt.V.str(" "), rt.method(ca, "hex_encode", []), rt.V.str(" "), rt.method(ch, "size", []), rt.V.str(" "), rt.method(ch, "hex_encode", [])]));
        rt.frameLine(10);
        print(rt.showArgs([rt.V.str("r"), mode, rt.V.str(" "), rt.method(ca, "decompress", [rt.V.int(6), mode]), rt.V.str(" "), rt.method(ch, "decompress", [rt.V.int(17), mode])]));
      }
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("t1 "), rt.method(rt.method(a, "compress", [rt.V.int(1)]), "decompress", [rt.V.int(20), rt.V.int(1)]), rt.V.str(" "), rt.method(rt.method(rt.method(a, "compress", [rt.V.int(1)]), "decompress", [rt.V.int(20), rt.V.int(1)]), "size", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(rt.bytesCtor([]), "compress", [rt.V.int(1)]), rt.V.str(" "), rt.method(rt.bytesCtor([]), "compress", [rt.V.int(2)]), rt.V.str(" "), rt.method(rt.bytesCtor([]), "compress", [rt.V.int(3)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("t3 "), rt.typeOf(rt.method(a, "compress", [rt.V.int(1)])), rt.V.str(" "), rt.typeOf(rt.method(rt.method(a, "compress", [rt.V.int(1)]), "decompress", [rt.V.int(6), rt.V.int(1)]))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("t4 "), a, rt.V.str(" "), h]));
      rt.frameLine(15);
      let big = rt.bytesCtor([]);
      rt.frameLine(16);
      for (let i of rt.rangeSeq([rt.V.int(1000)])) {
        rt.frameLine(17);
        rt.method(big, "append", [rt.V.int(rt.fast.iModC(i, 251))]);
      }
      rt.frameLine(18);
      let bc = rt.method(big, "compress", [rt.V.int(2)]);
      rt.frameLine(19);
      let bd = rt.method(bc, "decompress", [rt.V.int(1000), rt.V.int(2)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t5 "), rt.method(bc, "size", []), rt.V.str(" "), rt.method(bd, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(bd, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(bd, rt.V.int(500))), rt.V.str(" "), rt.wrapValue(rt.index(bd, rt.V.int(999)))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t6 "), rt.ops.eq(rt.method(rt.method(a, "compress", [rt.V.int(1)]), "hex_encode", []), rt.method(rt.method(a, "compress", [rt.V.int(1)]), "hex_encode", [])), rt.V.str(" "), rt.ops.eq(rt.method(a, "compress", [rt.V.int(1)]), rt.method(a, "compress", [rt.V.int(1)]))]));
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
