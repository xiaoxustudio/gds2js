// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const PI = rt.V.float(3.141592653589793);

export class Main extends SceneTree {
  enc(tag: rt.Variant, v: rt.Variant): void {
    let b = rt.gVarToBytes(v);
    print(rt.showArgs([tag, rt.V.str("vb|"), b]));
    let r = rt.gBytesToVar(b);
    print(rt.showArgs([tag, rt.V.str("rt|"), rt.ops.eq(r, v), rt.V.str("|"), rt.typeOf(r), rt.V.str("|"), rt.strBuiltin([r])]));
  }
  
  raw(tag: rt.Variant, bytes: rt.Variant): void {
    let r = rt.gBytesToVar(rt.bytesCtor([bytes]));
    print(rt.showArgs([tag, rt.V.str("bad|"), rt.typeOf(r), rt.V.str("|"), rt.strBuiltin([r])]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.enc(rt.V.str("t01|"), rt.V.nil());
    this.enc(rt.V.str("t02|"), rt.V.bool(true));
    this.enc(rt.V.str("t03|"), rt.V.bool(false));
    this.enc(rt.V.str("t04|"), rt.V.int(5));
    this.enc(rt.V.str("t05|"), rt.V.int((-1)));
    this.enc(rt.V.str("t06|"), rt.V.int(2147483647));
    this.enc(rt.V.str("t07|"), rt.V.int((-2147483648)));
    this.enc(rt.V.str("t08|"), rt.V.int(4294967296));
    this.enc(rt.V.str("t09|"), rt.V.float(0));
    this.enc(rt.V.str("t10|"), rt.V.float(1.5));
    this.enc(rt.V.str("t11|"), rt.V.float(0.1));
    this.enc(rt.V.str("t12|"), PI);
    this.enc(rt.V.str("t13|"), rt.V.float((-2.5)));
    this.enc(rt.V.str("t14|"), rt.V.float(16777216));
    this.enc(rt.V.str("t15|"), rt.V.float(16777217));
    this.enc(rt.V.str("t16|"), rt.V.str("abc"));
    this.enc(rt.V.str("t17|"), rt.V.str("héllo"));
    this.enc(rt.V.str("t18|"), rt.V.str("😀"));
    this.enc(rt.V.str("t19|"), rt.V.stringName("a"));
    this.enc(rt.V.str("t20|"), rt.vector2New([rt.V.int(1), rt.V.int(2)]));
    this.enc(rt.V.str("t21|"), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    this.enc(rt.V.str("t22|"), rt.vector2iNew([rt.V.int(1), rt.V.int(2)]));
    this.enc(rt.V.str("t23|"), rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)]));
    this.enc(rt.V.str("t24|"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])));
    this.enc(rt.V.str("t25|"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])));
    this.enc(rt.V.str("t26|"), rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]));
    this.enc(rt.V.str("t27|"), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]));
    this.enc(rt.V.str("t28|"), rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(1.5)]))]));
    this.enc(rt.V.str("t29|"), rt.V.float((-0)));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "enc": return rt.wrapValue(this.enc(args[0] as rt.Variant, args[1] as rt.Variant));
      case "raw": return rt.wrapValue(this.raw(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "enc": [2, 2], "raw": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
