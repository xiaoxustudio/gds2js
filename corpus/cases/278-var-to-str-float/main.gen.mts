// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

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
      print(rt.showArgs([tag, rt.V.str("|"), rt.V.str(rt.varToStr(v))]));
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
      this.show(rt.V.str("f01|"), rt.V.float(0));
      rt.frameLine(8);
      this.show(rt.V.str("f02|"), rt.V.float((-0)));
      rt.frameLine(9);
      this.show(rt.V.str("f03|"), rt.V.float(1));
      rt.frameLine(10);
      this.show(rt.V.str("f04|"), rt.V.float(1.5));
      rt.frameLine(11);
      this.show(rt.V.str("f05|"), rt.V.float((-1.5)));
      rt.frameLine(12);
      this.show(rt.V.str("f06|"), rt.V.float(0.1));
      rt.frameLine(13);
      this.show(rt.V.str("f07|"), rt.V.float((1 / 3)));
      rt.frameLine(14);
      this.show(rt.V.str("f08|"), PI);
      rt.frameLine(15);
      this.show(rt.V.str("f09|"), rt.V.float((1e+22 * 10)));
      rt.frameLine(16);
      this.show(rt.V.str("f10|"), rt.V.float((5e+21 * 10)));
      rt.frameLine(17);
      this.show(rt.V.str("f11|"), rt.V.float((7e+21 * 10)));
      rt.frameLine(18);
      this.show(rt.V.str("f12|"), rt.V.float((1.25e+22 * 10)));
      rt.frameLine(19);
      this.show(rt.V.str("f13|"), rt.V.float((1.024e+23 * 1000)));
      rt.frameLine(20);
      this.show(rt.V.str("f14|"), rt.ops.pow(rt.V.float(2), rt.V.int(63)));
      rt.frameLine(21);
      this.show(rt.V.str("f15|"), rt.ops.pow(rt.V.float(2), rt.V.int(100)));
      rt.frameLine(22);
      this.show(rt.V.str("f16|"), rt.ops.pow(rt.V.float(2), rt.V.int(127)));
      rt.frameLine(23);
      this.show(rt.V.str("f17|"), rt.ops.pow(rt.V.float(2), rt.V.int(128)));
      rt.frameLine(24);
      this.show(rt.V.str("f18|"), rt.ops.pow(rt.V.float(2), rt.V.int((-100))));
      rt.frameLine(25);
      this.show(rt.V.str("f19|"), rt.ops.mul(rt.V.float(3), rt.ops.pow(rt.V.float(2), rt.V.int(50))));
      rt.frameLine(26);
      this.show(rt.V.str("f20|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1074))));
      rt.frameLine(27);
      this.show(rt.V.str("f21|"), rt.ops.mul(rt.ops.pow(rt.V.float(2), rt.V.int(1023)), rt.ops.sub(rt.V.float(2), rt.ops.pow(rt.V.float(2), rt.V.int((-52))))));
      rt.frameLine(28);
      this.show(rt.V.str("f22|"), INF);
      rt.frameLine(29);
      this.show(rt.V.str("f23|"), rt.ops.neg(INF));
      rt.frameLine(30);
      this.show(rt.V.str("f24|"), NAN);
      rt.frameLine(31);
      this.show(rt.V.str("f25|"), rt.V.float(0.00001));
      rt.frameLine(32);
      this.show(rt.V.str("f26|"), rt.V.float(0.0001));
      rt.frameLine(33);
      this.show(rt.V.str("f27|"), rt.V.float(1000000000000000));
      rt.frameLine(34);
      this.show(rt.V.str("f28|"), rt.V.float(10000000000000000));
      rt.frameLine(35);
      this.show(rt.V.str("f29|"), rt.V.float(16777217));
      rt.frameLine(36);
      this.show(rt.V.str("f30|"), rt.V.float(123456789012345680));
      rt.frameLine(37);
      this.show(rt.V.str("f31|"), rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2)])));
      rt.frameLine(38);
      this.show(rt.V.str("f32|"), rt.dictOf([[rt.V.str("a"), rt.V.float(0.1)]]));
      rt.frameLine(39);
      this.show(rt.V.str("f33|"), rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(0.1), rt.V.float(2)]))]));
      rt.frameLine(40);
      this.show(rt.V.str("f34|"), rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2), rt.V.float((1e+22 * 10))]))]));
      rt.frameLine(41);
      this.show(rt.V.str("f35|"), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.float(0.5)])), rt.V.float(3)])));
      rt.frameLine(42);
      this.show(rt.V.str("f36|"), rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.V.float((1e+22 * 10))]))]]));
      rt.frameLine(43);
      this.show(rt.V.str("f37|"), rt.V.float(0.30000000000000004));
      rt.frameLine(44);
      this.show(rt.V.str("f38|"), rt.V.float((2.5 / 100000000000)));
      rt.frameLine(45);
      this.show(rt.V.str("f39|"), rt.V.float(((-1e+22) * 10)));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("g1|"), rt.method(rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(0.1), rt.V.float(2)]))]), "size", [])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("g2|"), rt.wrapValue(rt.index(rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(0.1), rt.V.float(2)]))]), rt.V.int(0)))]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("g3|"), rt.method(rt.packCtor("float64", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float(2)]))]), "size", [])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("g4|"), rt.method(rt.strToVar(rt.V.str("[1, 2, 3]")), "size", [])]));
      rt.frameLine(50);
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
