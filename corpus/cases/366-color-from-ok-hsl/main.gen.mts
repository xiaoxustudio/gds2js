// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

export class Main extends SceneTree {
  p(h: rt.Variant, s: rt.Variant, l: rt.Variant, a: rt.Variant = rt.V.float((-1))): void {
    print(rt.showArgs([rt.V.str("("), h, rt.V.str(", "), s, rt.V.str(", "), l, rt.V.str(", "), a, rt.V.str(") → "), rt.colorStatic("from_ok_hsl", [h, s, l, a])]));
  }
  
  q(h: rt.Variant, s: rt.Variant, l: rt.Variant): void {
    print(rt.showArgs([rt.V.str("("), h, rt.V.str(", "), s, rt.V.str(", "), l, rt.V.str(") → "), rt.colorStatic("from_ok_hsl", [h, s, l])]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.q(rt.V.int(0), rt.V.int(0), rt.V.int(0));
    this.q(rt.V.int(0), rt.V.int(0), rt.V.int(1));
    this.q(rt.V.int(0), rt.V.int(0), rt.V.float(0.5));
    this.q(rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.float(0.5), rt.V.int(1), rt.V.float(0.5));
    this.q(rt.V.float(0.7), rt.V.int(1), rt.V.float(0.8));
    this.q(rt.V.float(0.05), rt.V.int(1), rt.V.float(0.9));
    this.q(rt.V.float(0.85), rt.V.float(0.95), rt.V.float(0.6));
    this.q(rt.V.float(0.3), rt.V.float(0.8), rt.V.float(0.2));
    this.q(rt.V.float(0.1), rt.V.float(0.6), rt.V.float(0.9));
    this.q(rt.V.int(1), rt.V.int(1), rt.V.float(0.2));
    this.q(rt.V.float(1.25), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.float((-0.25)), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.float(0.75), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.int(2), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.int((-1)), rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.V.float(0.2), rt.V.float(1.2), rt.V.float(0.5));
    this.q(rt.V.float(0.2), rt.V.int(3), rt.V.float(0.5));
    this.q(rt.V.float(0.3), rt.V.float(1.5), rt.V.float(0.5));
    this.q(rt.V.float(0.2), rt.V.float(0.5), rt.V.float((-0.4)));
    this.q(rt.V.float(0.2), rt.V.float(0.5), rt.V.float(1.3));
    this.q(rt.V.int(0), rt.V.int(1), rt.V.int(1));
    this.q(rt.V.int(1), rt.V.int(0), rt.V.int(1));
    this.q(rt.V.bool(true), rt.V.bool(true), rt.V.bool(true));
    this.q(rt.V.bool(false), rt.V.bool(true), rt.V.bool(false));
    this.q(rt.V.float(0.7), NAN, rt.V.float(0.5));
    this.q(NAN, rt.V.float(0.5), rt.V.float(0.5));
    this.q(INF, rt.V.float(0.5), rt.V.float(0.5));
    this.q(rt.ops.neg(INF), rt.V.int(1), rt.V.float(0.5));
    this.q(rt.V.float(0.5), INF, rt.V.float(0.5));
    this.p(rt.V.float(0.7), rt.V.int(1), rt.V.float(0.4), rt.V.float((-0.2)));
    this.p(rt.V.float(0.9), rt.V.int(1), rt.V.float(0.4), rt.V.int(2));
    this.p(rt.V.float(0.9), rt.V.int(1), rt.V.float(0.4), INF);
    this.p(rt.V.float(0.33), rt.V.int(1), rt.V.float(0.4), NAN);
    this.p(rt.V.float(0.1), rt.V.int(1), rt.V.float(0.5), rt.V.int(0));
    this.p(rt.V.float(0.1), rt.V.int(1), rt.V.float(0.5), rt.V.float(0.5));
    this.p(rt.V.float(0.6), rt.V.float(0.25), rt.V.float(0.4), rt.V.float((-0)));
    let c = rt.colorNew([rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4), rt.V.float(0.5)]);
    let ret = rt.method(c, "from_ok_hsl", [rt.V.float(0.1), rt.V.int(1), rt.V.float(0.5)]);
    print(rt.showArgs([rt.V.str("instance 返回 → "), ret, rt.V.str(" ／ 接收者 → "), c]));
    print(rt.showArgs([rt.V.str("链式 → "), rt.method(rt.colorNew([rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4), rt.V.float(0.5)]), "from_ok_hsl", [rt.V.float(0.8), rt.V.int(1), rt.V.int(1)])]));
    this.quit();
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
