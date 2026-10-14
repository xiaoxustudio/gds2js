// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  host = rt.methodCallable(rt.V.object(this), "quit");
  s1 = rt.V.int(0);
  s2 = rt.V.int(0);
  s3 = rt.V.int(0);
  get got() {
    return this.host;
  }
  set got(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get fn() {
    return rt.globalCallable("abs");
  }
  set fn(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get me() {
    return rt.V.object(this);
  }
  set me(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get setter_only() {
    // 只带 set 的属性读出来是 null（实测 typeof 0，写它照样跑 setter）
    return rt.V.nil();
  }
  set setter_only(v) {
    this.s1 = v;
  }
  get both() {
    return this.s2;
  }
  set both(v) {
    this.s2 = v;
  }
  get readonly() {
    return rt.V.int(3);
  }
  set readonly(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get shadowed() {
    // 只带 set 的属性读出来是 null（实测 typeof 0，写它照样跑 setter）
    return rt.V.nil();
  }
  set shadowed(quit) {
    this.s3 = quit;
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("getter 里的宿主名 → "), rt.typeOf(this.got), rt.V.str(" | "), rt.method(this.got, "get_method", [])]));
    print(rt.showArgs([rt.V.str("getter 里的全局函数名 → "), rt.typeOf(this.fn), rt.V.str(" | "), rt.method(this.fn, "get_method", [])]));
    print(rt.showArgs([rt.V.str("getter 里的 self → "), rt.typeOf(this.me)]));
    this.setter_only = rt.V.int(7);
    print(rt.showArgs([rt.V.str("只带 set → 读 "), rt.typeOf(this.setter_only), rt.V.str(" | 写过的值 "), this.s1]));
    this.both = rt.V.int(8);
    print(rt.showArgs([rt.V.str("读写器成对 → "), rt.typeOf(this.both), rt.V.str(" | "), this.both]));
    this.readonly = rt.V.int(5);
    print(rt.showArgs([rt.V.str("只带 get 被写 → "), rt.typeOf(this.readonly), rt.V.str(" | "), this.readonly]));
    this.shadowed = rt.V.int(11);
    print(rt.showArgs([rt.V.str("setter 形参盖住同名 → "), rt.typeOf(this.s3), rt.V.str(" | "), this.s3]));
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
rt.registerFieldTypes(__gd_d_Main, {"got": "accessor", "fn": "accessor", "me": "accessor", "setter_only": "accessor", "both": "accessor", "readonly": "accessor", "shadowed": "accessor"});
rt.registerScriptProps(__gd_d_Main, ["host","s1","s2","s3","got","fn","me","setter_only","both","readonly","shadowed"], (o) => { const s = o as Main; return [s.host, s.s1, s.s2, s.s3, s.got, s.fn, s.me, s.setter_only, s.both, s.readonly, s.shadowed]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["host","s1","s2","s3","got","fn","me","setter_only","both","readonly","shadowed"], {"got": "Variant", "fn": "Variant", "me": "Variant", "setter_only": "Variant", "both": "Variant", "readonly": "Variant", "shadowed": "Variant"}, (o) => { const s = o as Main; return [s.host, s.s1, s.s2, s.s3, rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil(), rt.V.nil()]; });
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
