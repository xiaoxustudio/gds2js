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

  show(tag: rt.Variant, v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "show");
    try {
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), rt.typeOf(v), rt.V.str("|"), rt.V.str(rt.varToStr(v))]));
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
      rt.frameLine(7);
      this.show(rt.V.str("q01|"), rt.ops.pow(rt.V.int(2), rt.V.int((-1))));
      rt.frameLine(8);
      this.show(rt.V.str("q02|"), rt.ops.pow(rt.V.int(2), rt.V.int((-3))));
      rt.frameLine(9);
      this.show(rt.V.str("q03|"), rt.ops.pow(rt.V.int(4), rt.V.int((-1))));
      rt.frameLine(10);
      this.show(rt.V.str("q04|"), rt.ops.pow(rt.V.int(3), rt.V.int((-2))));
      rt.frameLine(11);
      this.show(rt.V.str("q05|"), rt.ops.pow(rt.V.int((-2)), rt.V.int((-3))));
      rt.frameLine(12);
      this.show(rt.V.str("q06|"), rt.ops.pow(rt.V.int((-1)), rt.V.int((-101))));
      rt.frameLine(13);
      this.show(rt.V.str("q07|"), rt.ops.pow(rt.V.int(1), rt.V.int((-100))));
      rt.frameLine(14);
      this.show(rt.V.str("q08|"), rt.ops.pow(rt.V.int(10), rt.V.int((-3))));
      rt.frameLine(15);
      let u0 = 2;
      rt.frameLine(16);
      let v0 = rt.V.int((-3));
      rt.frameLine(17);
      this.show(rt.V.str("q09|"), rt.ops.pow(rt.V.int(u0), v0));
      rt.frameLine(18);
      let u1 = rt.V.int((-2));
      rt.frameLine(19);
      let v1 = rt.V.int((-3));
      rt.frameLine(20);
      this.show(rt.V.str("q10|"), rt.ops.pow(u1, v1));
      rt.frameLine(21);
      let u2 = rt.V.int((-1));
      rt.frameLine(22);
      let v2 = rt.V.int((-3));
      rt.frameLine(23);
      this.show(rt.V.str("q11|"), rt.ops.pow(u2, v2));
      rt.frameLine(24);
      let u3 = 1;
      rt.frameLine(25);
      let v3 = rt.V.int((-1));
      rt.frameLine(26);
      this.show(rt.V.str("q12|"), rt.ops.pow(rt.V.int(u3), v3));
      rt.frameLine(27);
      let u4 = 0;
      rt.frameLine(28);
      let v4 = rt.V.int((-1));
      rt.frameLine(29);
      this.show(rt.V.str("q13|"), rt.ops.pow(rt.V.int(u4), v4));
      rt.frameLine(30);
      let u5 = 0;
      rt.frameLine(31);
      let v5 = 0;
      rt.frameLine(32);
      this.show(rt.V.str("q14|"), rt.ops.pow(rt.V.int(u5), rt.V.int(v5)));
      rt.frameLine(33);
      let t0 = rt.toInt(rt.V.int(2));
      rt.frameLine(34);
      let k0 = rt.toInt(rt.V.int((-3)));
      rt.frameLine(35);
      let z0 = rt.toInt(rt.ops.pow(t0, k0));
      rt.frameLine(36);
      this.show(rt.V.str("q15|"), z0);
      rt.frameLine(37);
      let t1 = rt.toInt(rt.V.int((-2)));
      rt.frameLine(38);
      let k1 = rt.toInt(rt.V.int((-3)));
      rt.frameLine(39);
      let z1 = rt.toInt(rt.ops.pow(t1, k1));
      rt.frameLine(40);
      this.show(rt.V.str("q16|"), z1);
      rt.frameLine(41);
      let t2 = rt.toInt(rt.V.int(0));
      rt.frameLine(42);
      let k2 = rt.toInt(rt.V.int((-1)));
      rt.frameLine(43);
      let z2 = rt.toInt(rt.ops.pow(t2, k2));
      rt.frameLine(44);
      this.show(rt.V.str("q17|"), z2);
      rt.frameLine(45);
      let t3 = rt.toInt(rt.V.int(1));
      rt.frameLine(46);
      let k3 = rt.toInt(rt.V.int((-1)));
      rt.frameLine(47);
      let z3 = rt.toInt(rt.ops.pow(t3, k3));
      rt.frameLine(48);
      this.show(rt.V.str("q18|"), z3);
      rt.frameLine(49);
      let t4 = rt.toInt(rt.V.int(10));
      rt.frameLine(50);
      let k4 = rt.toInt(rt.V.int((-3)));
      rt.frameLine(51);
      let z4 = rt.toInt(rt.ops.pow(t4, k4));
      rt.frameLine(52);
      this.show(rt.V.str("q19|"), rt.ops.add(z4, rt.V.int(0)));
      rt.frameLine(53);
      let t5 = rt.toInt(rt.V.int((-1)));
      rt.frameLine(54);
      let k5 = rt.toInt(rt.V.int((-101)));
      rt.frameLine(55);
      let z5 = rt.toInt(rt.ops.pow(t5, k5));
      rt.frameLine(56);
      this.show(rt.V.str("q20|"), rt.ops.eq(rt.ops.sub(z5, z5), rt.V.int(0)));
      rt.frameLine(57);
      this.show(rt.V.str("q21|"), rt.gPow(rt.V.int(2), rt.V.int((-3))));
      rt.frameLine(58);
      this.show(rt.V.str("q22|"), rt.gPow(rt.V.float(2), rt.V.int((-3))));
      rt.frameLine(59);
      this.show(rt.V.str("q23|"), rt.ops.mul(rt.ops.pow(rt.V.int(2), rt.V.int((-3))), rt.V.int(8)));
      rt.frameLine(60);
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
      case "show": return rt.wrapValue(this.show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "show": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
