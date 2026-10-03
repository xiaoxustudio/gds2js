// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.object(new Bare());
    print(rt.showArgs([rt.V.str("n4 empty="), rt.typeOf(rt.V.object(new Empty())), rt.V.str(" bare="), rt.isType(a, "Bare")]));
    let f = rt.V.object(new Forward(rt.V.int(9)));
    print(rt.showArgs([rt.V.str("n5 "), rt.wrapValue(rt.attribute(f, "n")), rt.V.str(" "), rt.wrapValue(rt.attribute(f, "k"))]));
    let r = rt.V.object(new Right(rt.V.int(4)));
    print(rt.showArgs([rt.V.str("n6 "), rt.wrapValue(rt.attribute(r, "n"))]));
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
class Bare extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    this.__gdDispatch("_init", __gd_new_args);
  }

  __gd_fields__() {
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    print(rt.showArgs([rt.V.str("n1 Bare._init")]));
    return;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Bare = rt.defineClass(Bare, (a) => new Bare(...a), (o) => o instanceof Bare);
rt.nameClass(__gd_d_Bare, "Bare");
rt.registerNativeBase(__gd_d_Bare, "RefCounted");

class Empty extends Bare {
  override __gd_fields__() {
    super.__gd_fields__();
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Empty = rt.defineClass(Empty, (a) => new Empty(...a), (o) => o instanceof Empty);
rt.nameClass(__gd_d_Empty, "Empty");
rt.setClassBase(__gd_d_Empty, rt.lookupClass("Bare") ?? null);

class NeedsArg extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    this.__gdDispatch("_init", __gd_new_args);
  }

  declare n: rt.Variant;

  __gd_fields__() {
    this.n = rt.toInt(rt.V.int(0));
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    const p_n = rt.paramSlot(__gd_init_args[0] as rt.Variant, "int", 1, "_init", this);
    this.n = rt.toInt(p_n);
    print(rt.showArgs([rt.V.str("n2 NeedsArg._init "), p_n]));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_NeedsArg = rt.defineClass(NeedsArg, (a) => new NeedsArg(...a), (o) => o instanceof NeedsArg);
rt.nameClass(__gd_d_NeedsArg, "NeedsArg");
rt.registerFieldTypes(__gd_d_NeedsArg, {"n": "int"});
rt.registerNativeBase(__gd_d_NeedsArg, "RefCounted");

class Forward extends NeedsArg {
  declare k: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.k = rt.toInt(rt.V.int(3));
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Forward = rt.defineClass(Forward, (a) => new Forward(...a), (o) => o instanceof Forward);
rt.nameClass(__gd_d_Forward, "Forward");
rt.setClassBase(__gd_d_Forward, rt.lookupClass("NeedsArg") ?? null);
rt.registerFieldTypes(__gd_d_Forward, {"k": "int"});

class Right extends NeedsArg {
  override __gd_fields__() {
    super.__gd_fields__();
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    const p_x = rt.paramSlot(__gd_init_args[0] as rt.Variant, "int", 1, "_init", this);
    super._init(p_x);
    print(rt.showArgs([rt.V.str("n3 Right.after-super "), p_x]));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Right = rt.defineClass(Right, (a) => new Right(...a), (o) => o instanceof Right);
rt.nameClass(__gd_d_Right, "Right");
rt.setClassBase(__gd_d_Right, rt.lookupClass("NeedsArg") ?? null);

const __gd_entry = new Main();
await __gd_entry.run();
