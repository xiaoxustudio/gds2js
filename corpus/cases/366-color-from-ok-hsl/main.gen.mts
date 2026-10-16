// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

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

  p(h: rt.Variant, s: rt.Variant, l: rt.Variant, a: rt.Variant = rt.V.float((-1))): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "p");
    try {
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("("), h, rt.V.str(", "), s, rt.V.str(", "), l, rt.V.str(", "), a, rt.V.str(") → "), rt.colorStatic("from_ok_hsl", [h, s, l, a])]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  q(h: rt.Variant, s: rt.Variant, l: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "q");
    try {
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("("), h, rt.V.str(", "), s, rt.V.str(", "), l, rt.V.str(") → "), rt.colorStatic("from_ok_hsl", [h, s, l])]));
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
      rt.frameLine(11);
      this.q(rt.V.int(0), rt.V.int(0), rt.V.int(0));
      rt.frameLine(12);
      this.q(rt.V.int(0), rt.V.int(0), rt.V.int(1));
      rt.frameLine(13);
      this.q(rt.V.int(0), rt.V.int(0), rt.V.float(0.5));
      rt.frameLine(14);
      this.q(rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(15);
      this.q(rt.V.float(0.5), rt.V.int(1), rt.V.float(0.5));
      rt.frameLine(16);
      this.q(rt.V.float(0.7), rt.V.int(1), rt.V.float(0.8));
      rt.frameLine(17);
      this.q(rt.V.float(0.05), rt.V.int(1), rt.V.float(0.9));
      rt.frameLine(18);
      this.q(rt.V.float(0.85), rt.V.float(0.95), rt.V.float(0.6));
      rt.frameLine(19);
      this.q(rt.V.float(0.3), rt.V.float(0.8), rt.V.float(0.2));
      rt.frameLine(20);
      this.q(rt.V.float(0.1), rt.V.float(0.6), rt.V.float(0.9));
      rt.frameLine(21);
      this.q(rt.V.int(1), rt.V.int(1), rt.V.float(0.2));
      rt.frameLine(22);
      this.q(rt.V.float(1.25), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(23);
      this.q(rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(24);
      this.q(rt.V.float((-0.25)), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(25);
      this.q(rt.V.float(0.75), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(26);
      this.q(rt.V.int(2), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(27);
      this.q(rt.V.int((-1)), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(28);
      this.q(rt.V.float(0.2), rt.V.float(1.2), rt.V.float(0.5));
      rt.frameLine(29);
      this.q(rt.V.float(0.2), rt.V.int(3), rt.V.float(0.5));
      rt.frameLine(30);
      this.q(rt.V.float(0.3), rt.V.float(1.5), rt.V.float(0.5));
      rt.frameLine(31);
      this.q(rt.V.float(0.2), rt.V.float(0.5), rt.V.float((-0.4)));
      rt.frameLine(32);
      this.q(rt.V.float(0.2), rt.V.float(0.5), rt.V.float(1.3));
      rt.frameLine(33);
      this.q(rt.V.int(0), rt.V.int(1), rt.V.int(1));
      rt.frameLine(34);
      this.q(rt.V.int(1), rt.V.int(0), rt.V.int(1));
      rt.frameLine(35);
      this.q(rt.V.bool(true), rt.V.bool(true), rt.V.bool(true));
      rt.frameLine(36);
      this.q(rt.V.bool(false), rt.V.bool(true), rt.V.bool(false));
      rt.frameLine(37);
      this.q(rt.V.float(0.7), NAN, rt.V.float(0.5));
      rt.frameLine(38);
      this.q(NAN, rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(39);
      this.q(INF, rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(40);
      this.q(rt.ops.neg(INF), rt.V.int(1), rt.V.float(0.5));
      rt.frameLine(41);
      this.q(rt.V.float(0.5), INF, rt.V.float(0.5));
      rt.frameLine(42);
      this.p(rt.V.float(0.7), rt.V.int(1), rt.V.float(0.4), rt.V.float((-0.2)));
      rt.frameLine(43);
      this.p(rt.V.float(0.9), rt.V.int(1), rt.V.float(0.4), rt.V.int(2));
      rt.frameLine(44);
      this.p(rt.V.float(0.9), rt.V.int(1), rt.V.float(0.4), INF);
      rt.frameLine(45);
      this.p(rt.V.float(0.33), rt.V.int(1), rt.V.float(0.4), NAN);
      rt.frameLine(46);
      this.p(rt.V.float(0.1), rt.V.int(1), rt.V.float(0.5), rt.V.int(0));
      rt.frameLine(47);
      this.p(rt.V.float(0.1), rt.V.int(1), rt.V.float(0.5), rt.V.float(0.5));
      rt.frameLine(48);
      this.p(rt.V.float(0.6), rt.V.float(0.25), rt.V.float(0.4), rt.V.float((-0)));
      rt.frameLine(49);
      let c = rt.colorNew([rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4), rt.V.float(0.5)]);
      rt.frameLine(50);
      let ret = rt.method(c, "from_ok_hsl", [rt.V.float(0.1), rt.V.int(1), rt.V.float(0.5)]);
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("instance 返回 → "), ret, rt.V.str(" ／ 接收者 → "), c]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("链式 → "), rt.method(rt.colorNew([rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4), rt.V.float(0.5)]), "from_ok_hsl", [rt.V.float(0.8), rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(53);
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
      case "p": return rt.wrapValue(this.p(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant, args.length > 3 ? (args[3] as rt.Variant) : undefined));
      case "q": return rt.wrapValue(this.q(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "p": [3, 4], "q": [3, 3], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
