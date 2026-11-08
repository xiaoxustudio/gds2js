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

  hexb(b: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "hexb");
    try {
      rt.frameLine(4);
      let s = rt.V.str("");
      rt.frameLine(5);
      for (let x of rt.iter(b)) {
        rt.frameLine(6);
        s = rt.ops.add(s, rt.formatOf(rt.V.str("%02x"), x, true));
      }
      rt.frameLine(7);
      return rt.strOf(s);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
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
      let key = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8), rt.V.int(9), rt.V.int(10), rt.V.int(11), rt.V.int(12), rt.V.int(13), rt.V.int(14), rt.V.int(15)]))]);
      rt.frameLine(11);
      let key32 = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8), rt.V.int(9), rt.V.int(10), rt.V.int(11), rt.V.int(12), rt.V.int(13), rt.V.int(14), rt.V.int(15), rt.V.int(16), rt.V.int(17), rt.V.int(18), rt.V.int(19), rt.V.int(20), rt.V.int(21), rt.V.int(22), rt.V.int(23), rt.V.int(24), rt.V.int(25), rt.V.int(26), rt.V.int(27), rt.V.int(28), rt.V.int(29), rt.V.int(30), rt.V.int(31)]))]);
      rt.frameLine(12);
      let iv = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(16), rt.V.int(17), rt.V.int(18), rt.V.int(19), rt.V.int(20), rt.V.int(21), rt.V.int(22), rt.V.int(23), rt.V.int(24), rt.V.int(25), rt.V.int(26), rt.V.int(27), rt.V.int(28), rt.V.int(29), rt.V.int(30), rt.V.int(31)]))]);
      rt.frameLine(13);
      let plain = rt.method(rt.V.str("0123456789abcdef"), "to_utf8_buffer", []);
      rt.frameLine(14);
      let c = rt.method(rt.nativeClass("AESContext"), "new", []);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("a1|"), rt.method(c, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_CBC_ENCRYPT")), key, iv])]));
      rt.frameLine(16);
      let out1 = rt.method(c, "update", [plain]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("a2|"), this.hexb(out1)]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("a3|"), this.hexb(rt.method(c, "get_iv_state", []))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("a4|"), this.hexb(rt.method(c, "update", [rt.method(rt.V.str("fedcba9876543210"), "to_utf8_buffer", [])]))]));
      rt.frameLine(20);
      rt.method(c, "finish", []);
      rt.frameLine(21);
      let d = rt.method(rt.nativeClass("AESContext"), "new", []);
      rt.frameLine(22);
      rt.method(d, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_CBC_DECRYPT")), key, iv]);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("a5|"), this.hexb(rt.method(d, "update", [out1]))]));
      rt.frameLine(24);
      rt.method(d, "finish", []);
      rt.frameLine(25);
      let e = rt.method(rt.nativeClass("AESContext"), "new", []);
      rt.frameLine(26);
      rt.method(e, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_ECB_ENCRYPT")), key, rt.bytesCtor([])]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("a6|"), this.hexb(rt.method(e, "update", [plain]))]));
      rt.frameLine(28);
      rt.method(e, "finish", []);
      rt.frameLine(29);
      let f = rt.method(rt.nativeClass("AESContext"), "new", []);
      rt.frameLine(30);
      rt.method(f, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_ECB_ENCRYPT")), key32, rt.bytesCtor([])]);
      rt.frameLine(31);
      let ct = rt.method(f, "update", [plain]);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("a7|"), this.hexb(ct)]));
      rt.frameLine(33);
      rt.method(f, "finish", []);
      rt.frameLine(34);
      let g = rt.method(rt.nativeClass("AESContext"), "new", []);
      rt.frameLine(35);
      rt.method(g, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_ECB_DECRYPT")), key32, rt.bytesCtor([])]);
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("a8|"), this.hexb(rt.method(g, "update", [ct]))]));
      rt.frameLine(37);
      rt.method(g, "finish", []);
      rt.frameLine(38);
      let h = rt.method(rt.nativeClass("AESContext"), "new", []);
      rt.frameLine(39);
      rt.method(h, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_CBC_ENCRYPT")), key32, iv]);
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("a9|"), this.hexb(rt.method(h, "update", [plain]))]));
      rt.frameLine(41);
      rt.method(h, "finish", []);
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("a10|"), rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_ECB_ENCRYPT")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_ECB_DECRYPT")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_CBC_ENCRYPT")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("AESContext"), "MODE_CBC_DECRYPT"))]));
      rt.frameLine(43);
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
      case "hexb": return rt.wrapValue(this.hexb(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "hexb": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "hexb": ["PackedByteArray"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
