// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  store = rt.V.int(0);
  side = rt.V.str("");
  static sstore = rt.V.int(2);
  get named_get() {
    return this._g();
  }
  set named_get(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get named_set() {
    return rt.V.nil();
  }
  set named_set(value) {
    this._s(value);
  }
  get pair() {
    return this._g();
  }
  set pair(value) {
    this._s(value);
  }
  __gd_store_with_init = rt.V.int(9);
  get with_init() {
    return this.__gd_store_with_init;
  }
  set with_init(value) {
    this._s(value);
  }
  __gd_store_inline_init = rt.V.int(8);
  get inline_init() {
    return this.__gd_store_inline_init;
  }
  set inline_init(v) {
    rt.frameLine(38);
    this.store = v;
  }
  __gd_store_ordered = this.tag(rt.V.str("t"));
  get ordered() {
    return this._g();
  }
  set ordered(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  get via_static() {
    return Main._sg();
  }
  set via_static(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  static get sinline() {
    rt.frameLine(48);
    return Main.sstore;
  }
  static set sinline(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  static get snamed() {
    return Main._sg();
  }
  static set snamed(value) {
    Main._ss(value);
  }
  static get sget_dead() {
    return rt.reportNonStaticCall("_g");
  }
  static set sget_dead(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }
  static get sset_dead() {
    return rt.V.nil();
  }
  static set sset_dead(value) {
    rt.reportNonStaticCall("_s");
  }

  tag(t: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tag");
    try {
      t = rt.paramSlot(t, "String", 1, "tag", this);
      rt.frameLine(8);
      this.side = rt.ops.add(this.side, t);
      rt.frameLine(9);
      return rt.V.int(1);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  _g(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_g");
    try {
      rt.frameLine(12);
      return this.store;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  _s(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_s");
    try {
      rt.frameLine(15);
      this.store = v;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static _sg(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_sg");
    try {
      rt.frameLine(18);
      return rt.V.int(7);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static _ss(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_ss");
    try {
      rt.frameLine(21);
      Main.sstore = v;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("具名 getter → "), rt.typeOf(this.named_get), rt.V.str(" | "), this.named_get]));
      rt.frameLine(60);
      this.store = rt.V.int(3);
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("具名 getter 再读 → "), this.named_get]));
      rt.frameLine(62);
      this.named_set = rt.V.int(4);
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("具名 setter → 读 "), rt.typeOf(this.named_set), rt.V.str(" | 存的 "), this.store]));
      rt.frameLine(64);
      this.pair = rt.V.int(5);
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("一行并列 → "), this.pair, rt.V.str(" | "), this.store]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("带初值 + 具名 setter → "), rt.typeOf(this.with_init), rt.V.str(" | "), this.with_init]));
      rt.frameLine(67);
      this.with_init = rt.V.int(6);
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("写它之后 → "), this.with_init, rt.V.str(" | 存的 "), this.store]));
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("带初值 + inline setter → "), rt.typeOf(this.inline_init), rt.V.str(" | "), this.inline_init]));
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("初值副作用与顺序 → "), this.side]));
      rt.frameLine(71);
      print(rt.showArgs([rt.V.str("实例属性委托 static 方法 → "), rt.typeOf(this.via_static), rt.V.str(" | "), this.via_static]));
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("static 属性 inline getter → "), rt.typeOf(Main.sinline), rt.V.str(" | "), Main.sinline]));
      rt.frameLine(73);
      Main.snamed = rt.V.int(10);
      rt.frameLine(74);
      print(rt.showArgs([rt.V.str("static 属性具名成对 → "), rt.typeOf(Main.snamed), rt.V.str(" | "), Main.snamed, rt.V.str(" | "), Main.sstore]));
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("static 属性委托实例 getter → "), rt.typeOf(Main.sget_dead), rt.V.str(" | "), Main.sget_dead]));
      rt.frameLine(76);
      Main.sset_dead = rt.V.int(11);
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("static 属性委托实例 setter → 读 "), rt.typeOf(Main.sset_dead), rt.V.str(" | 存的 "), this.store]));
      rt.frameLine(78);
      this.quit();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "tag": return rt.wrapValue(this.tag(args[0] as rt.Variant));
      case "_g": return rt.wrapValue(this._g());
      case "_s": return rt.wrapValue(this._s(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"named_get": "accessor", "named_set": "accessor", "pair": "accessor", "with_init": "accessor", "inline_init": "accessor", "ordered": "accessor", "via_static": "accessor"});
rt.registerScriptProps(__gd_d_Main, ["store","side","named_get","named_set","pair","with_init","inline_init","ordered","via_static"], (o) => { const s = o as Main; return [s.store, s.side, s.named_get, s.named_set, s.pair, s.with_init, s.inline_init, s.ordered, s.via_static]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["store","side","named_get","named_set","pair","with_init","inline_init","ordered","via_static"], {"named_get": "Variant", "named_set": "Variant", "pair": "Variant", "with_init": "Variant", "inline_init": "Variant", "ordered": "Variant", "via_static": "Variant", "sinline": "Variant", "snamed": "Variant", "sget_dead": "Variant", "sset_dead": "Variant"}, (o) => { const s = o as Main; return [s.store, s.side, rt.V.nil(), rt.V.nil(), rt.V.nil(), s.__gd_store_with_init, s.__gd_store_inline_init, s.__gd_store_ordered, rt.V.nil()]; });
rt.registerStaticVars(__gd_d_Main, {"sstore": "", "sinline": "", "snamed": "", "sget_dead": "", "sset_dead": ""}, {"sstore": { get: (): rt.Variant => Main.sstore, set: (__v: rt.Variant): void => { Main.sstore = __v; } }, "sinline": { get: (): rt.Variant => Main.sinline, set: (__v: rt.Variant): void => { Main.sinline = __v; } }, "snamed": { get: (): rt.Variant => Main.snamed, set: (__v: rt.Variant): void => { Main.snamed = __v; } }, "sget_dead": { get: (): rt.Variant => Main.sget_dead, set: (__v: rt.Variant): void => { Main.sget_dead = __v; } }, "sset_dead": { get: (): rt.Variant => Main.sset_dead, set: (__v: rt.Variant): void => { Main.sset_dead = __v; } }});
rt.registerMethodArities(__gd_d_Main, { "tag": [1, 1], "_g": [0, 0], "_s": [1, 1], "_sg": [0, 0], "_ss": [1, 1], "_initialize": [0, 0] });
rt.registerStaticMethods(__gd_d_Main, ["_sg","_ss"], {"_sg": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main._sg()), "_ss": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main._ss(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
