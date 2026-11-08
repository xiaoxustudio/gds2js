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
      let c = rt.method(rt.nativeClass("Crypto"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("c1|"), rt.method(c, "constant_time_compare", [rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))])]), rt.V.str("|"), rt.method(c, "constant_time_compare", [rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))])])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("c2|"), rt.method(rt.method(c, "generate_random_bytes", [rt.V.int(8)]), "size", [])]));
      rt.frameLine(7);
      let k = rt.method(c, "generate_rsa", [rt.V.int(1024)]);
      rt.frameLine(8);
      let ct = rt.method(c, "encrypt", [k, rt.method(rt.V.str("hello"), "to_utf8_buffer", [])]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("c3|"), rt.method(ct, "size", []), rt.V.str("|"), rt.method(rt.method(c, "decrypt", [k, ct]), "get_string_from_utf8", [])]));
      rt.frameLine(10);
      let h = rt.method(rt.nativeClass("HashingContext"), "new", []);
      rt.frameLine(11);
      rt.method(h, "start", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256"))]);
      rt.frameLine(12);
      rt.method(h, "update", [rt.method(rt.V.str("abc"), "to_utf8_buffer", [])]);
      rt.frameLine(13);
      let digest = rt.method(h, "finish", []);
      rt.frameLine(14);
      let sig = rt.method(c, "sign", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256")), digest, k]);
      rt.frameLine(15);
      let bad = rt.method(digest, "duplicate", []);
      rt.frameLine(16);
      {
        const _nv = rt.writeIdx(bad, rt.V.int(0), rt.ops.bxor(rt.wrapValue(rt.index(bad, rt.V.int(0))), rt.V.int(1)));
        if (_nv !== null) bad = _nv;
      }
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("c4|"), rt.method(sig, "size", []), rt.V.str("|"), rt.method(c, "verify", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256")), digest, sig, k]), rt.V.str("|"), rt.method(c, "verify", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256")), bad, sig, k])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("c5|"), rt.method(rt.method(c, "hmac_digest", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA256")), rt.method(rt.V.str("key"), "to_utf8_buffer", []), rt.method(rt.V.str("msg"), "to_utf8_buffer", [])]), "hex_encode", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("c6|"), rt.method(rt.method(c, "hmac_digest", [rt.wrapValue(rt.attribute(rt.nativeClass("HashingContext"), "HASH_SHA1")), rt.method(rt.V.str("key"), "to_utf8_buffer", []), rt.method(rt.V.str("msg"), "to_utf8_buffer", [])]), "hex_encode", [])]));
      rt.frameLine(20);
      let cert = rt.method(c, "generate_self_signed_certificate", [k, rt.V.str("CN=test,O=org"), rt.V.str("20240101000000"), rt.V.str("20340101000000")]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("c7|"), rt.ops.neq(cert, rt.V.nil())]));
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
