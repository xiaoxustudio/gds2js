// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]);
    let h = rt.method(rt.V.str("hello hello hello"), "to_utf8_buffer", []);
    for (let mode of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])))) {
      let ca = rt.method(a, "compress", [mode]);
      let ch = rt.method(h, "compress", [mode]);
      print(rt.showArgs([rt.V.str("m"), mode, rt.V.str(" "), rt.method(ca, "size", []), rt.V.str(" "), rt.method(ca, "hex_encode", []), rt.V.str(" "), rt.method(ch, "size", []), rt.V.str(" "), rt.method(ch, "hex_encode", [])]));
      print(rt.showArgs([rt.V.str("r"), mode, rt.V.str(" "), rt.method(ca, "decompress", [rt.V.int(6), mode]), rt.V.str(" "), rt.method(ch, "decompress", [rt.V.int(17), mode])]));
    }
    print(rt.showArgs([rt.V.str("t1 "), rt.method(rt.method(a, "compress", [rt.V.int(1)]), "decompress", [rt.V.int(20), rt.V.int(1)]), rt.V.str(" "), rt.method(rt.method(rt.method(a, "compress", [rt.V.int(1)]), "decompress", [rt.V.int(20), rt.V.int(1)]), "size", [])]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(rt.bytesCtor([]), "compress", [rt.V.int(1)]), rt.V.str(" "), rt.method(rt.bytesCtor([]), "compress", [rt.V.int(2)]), rt.V.str(" "), rt.method(rt.bytesCtor([]), "compress", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.typeOf(rt.method(a, "compress", [rt.V.int(1)])), rt.V.str(" "), rt.typeOf(rt.method(rt.method(a, "compress", [rt.V.int(1)]), "decompress", [rt.V.int(6), rt.V.int(1)]))]));
    print(rt.showArgs([rt.V.str("t4 "), a, rt.V.str(" "), h]));
    let big = rt.bytesCtor([]);
    for (let i of rt.rangeSeq([rt.V.int(1000)])) {
      rt.method(big, "append", [rt.V.int(rt.fast.iModC(i, 251))]);
    }
    let bc = rt.method(big, "compress", [rt.V.int(2)]);
    let bd = rt.method(bc, "decompress", [rt.V.int(1000), rt.V.int(2)]);
    print(rt.showArgs([rt.V.str("t5 "), rt.method(bc, "size", []), rt.V.str(" "), rt.method(bd, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(bd, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(bd, rt.V.int(500))), rt.V.str(" "), rt.wrapValue(rt.index(bd, rt.V.int(999)))]));
    print(rt.showArgs([rt.V.str("t6 "), rt.ops.eq(rt.method(rt.method(a, "compress", [rt.V.int(1)]), "hex_encode", []), rt.method(rt.method(a, "compress", [rt.V.int(1)]), "hex_encode", [])), rt.V.str(" "), rt.ops.eq(rt.method(a, "compress", [rt.V.int(1)]), rt.method(a, "compress", [rt.V.int(1)]))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
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
