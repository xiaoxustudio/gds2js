// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_ARRAY = rt.V.int(28);
const TYPE_BOOL = rt.V.int(1);
const TYPE_DICTIONARY = rt.V.int(27);
const TYPE_FLOAT = rt.V.int(3);
const TYPE_INT = rt.V.int(2);
const TYPE_NIL = rt.V.int(0);
const TYPE_NODE_PATH = rt.V.int(22);
const TYPE_OBJECT = rt.V.int(24);
const TYPE_STRING = rt.V.int(4);
const TYPE_STRING_NAME = rt.V.int(21);
const TYPE_VECTOR2 = rt.V.int(5);

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
      rt.frameLine(13);
      let a = rt.V.object(new A());
      rt.frameLine(14);
      let b = rt.V.object(new B());
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t01|"), rt.gIsInstanceOf(a, rt.V.object(__gd_d_A))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("t02|"), rt.gIsInstanceOf(a, rt.V.object(__gd_d_B))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("t03|"), rt.gIsInstanceOf(b, rt.V.object(__gd_d_A))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("t04|"), rt.gIsInstanceOf(b, rt.V.object(__gd_d_B))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("t05|"), rt.gIsInstanceOf(a, rt.nativeClass("RefCounted"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t06|"), rt.gIsInstanceOf(a, rt.nativeClass("Object"))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t07|"), rt.gIsInstanceOf(a, rt.nativeClass("SceneTree"))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t08|"), rt.gIsInstanceOf(rt.V.object(this), rt.nativeClass("SceneTree"))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("t09|"), rt.gIsInstanceOf(rt.V.object(this), rt.nativeClass("MainLoop"))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("t10|"), rt.gIsInstanceOf(rt.V.object(this), rt.nativeClass("Object"))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("t11|"), rt.gIsInstanceOf(rt.V.object(this), rt.V.object(__gd_d_A))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("t12|"), rt.gIsInstanceOf(rt.V.object(this), rt.nativeClass("RefCounted"))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("t13|"), rt.typeOf(rt.gIsInstanceOf(a, rt.V.object(__gd_d_A)))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("t14|"), rt.gIsInstanceOf(rt.V.nil(), rt.V.object(__gd_d_A))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("t15|"), rt.gIsInstanceOf(rt.V.nil(), rt.nativeClass("RefCounted"))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("t16|"), rt.gIsInstanceOf(rt.V.int(5), rt.V.object(__gd_d_A))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("t17|"), rt.gIsInstanceOf(rt.V.str("x"), rt.V.object(__gd_d_A))]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("t18|"), rt.gIsInstanceOf(a, TYPE_INT)]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("t19|"), rt.gIsInstanceOf(a, TYPE_OBJECT)]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("t20|"), rt.gIsInstanceOf(rt.V.int(5), TYPE_INT)]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("t21|"), rt.gIsInstanceOf(rt.V.stringName("x"), TYPE_STRING)]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("t22|"), rt.gIsInstanceOf(rt.V.stringName("x"), TYPE_STRING_NAME)]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("t23|"), rt.gIsInstanceOf(rt.nodePathCtor([rt.V.str("a")]), TYPE_NODE_PATH)]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("t24|"), rt.gIsInstanceOf(rt.V.float(3.5), TYPE_FLOAT)]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("t25|"), rt.gIsInstanceOf(rt.V.float(3.5), TYPE_INT)]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("t26|"), rt.gIsInstanceOf(rt.V.bool(true), TYPE_BOOL)]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("t27|"), rt.gIsInstanceOf(rt.V.array(rt.GArray.of([rt.V.int(1)])), TYPE_ARRAY)]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("t28|"), rt.gIsInstanceOf(rt.dictOf([]), TYPE_DICTIONARY)]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("t29|"), rt.gIsInstanceOf(rt.vector2New([rt.V.int(1), rt.V.int(2)]), TYPE_VECTOR2)]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("t30|"), rt.gIsInstanceOf(a, rt.V.int(24))]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("t31|"), rt.gIsInstanceOf(a, rt.V.int(27))]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("t32|"), rt.gIsInstanceOf(rt.V.object(__gd_d_A), rt.nativeClass("RefCounted"))]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("t33|"), rt.gIsInstanceOf(rt.V.object(__gd_d_A), rt.nativeClass("Object"))]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("t34|"), rt.gIsInstanceOf(rt.V.object(__gd_d_A), rt.nativeClass("GDScript"))]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("t35|"), rt.gIsInstanceOf(rt.nativeClass("RefCounted"), rt.nativeClass("Object"))]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("t36|"), rt.gIsInstanceOf(rt.nativeClass("RefCounted"), rt.nativeClass("RefCounted"))]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("t37|"), rt.gIsInstanceOf(rt.V.object(__gd_d_A), rt.nativeClass("SceneTree"))]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("t38|"), rt.gIsInstanceOf(rt.gRidFromInt64(rt.V.int(5)), rt.nativeClass("Object"))]));
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("t39|"), rt.gIsInstanceOf(rt.gRidFromInt64(rt.V.int(5)), TYPE_OBJECT)]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("t40|"), rt.globalCallable("is_instance_of")]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("t41|"), rt.method(rt.globalCallable("is_instance_of"), "get_argument_count", [])]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("t42|"), rt.method(rt.globalCallable("is_instance_of"), "call", [a, rt.V.object(__gd_d_A)])]));
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("t43|"), rt.gIsInstanceOf(a, rt.V.object(__gd_d_Other))]));
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("t44|"), rt.gIsInstanceOf(b, rt.nativeClass("RefCounted"))]));
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("t45|"), rt.gIsInstanceOf(rt.gDictToInst(rt.gInstToDict(a)), rt.V.object(__gd_d_A))]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("t46|"), rt.gIsInstanceOf(rt.V.int(5), TYPE_NIL)]));
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("t47|"), rt.gIsInstanceOf(a, TYPE_NIL)]));
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("t48|"), rt.gIsInstanceOf(rt.V.stringName("x"), TYPE_NODE_PATH)]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("t49|"), rt.gIsInstanceOf(rt.V.object(new Other()), rt.V.object(__gd_d_A))]));
      rt.frameLine(64);
      print(rt.showArgs([rt.V.str("t50|"), rt.gIsInstanceOf(rt.gDictToInst(rt.gInstToDict(a)), rt.V.object(__gd_d_Other))]));
      rt.frameLine(65);
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
class A extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

  declare x: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.x = rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, (a) => new A(...a), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerScriptProps(__gd_d_A, ["x"], (o) => { const s = o as A; return [s.x]; });
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", ["x"], {}, (o) => { const s = o as A; return [s.x]; });
rt.registerNativeBase(__gd_d_A, "RefCounted");

class B extends A {
  declare y: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(7);
      this.y = rt.V.int(2);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_B = rt.defineClass(B, (a) => new B(...a), (o) => o instanceof B);
rt.nameClass(__gd_d_B, "B");
rt.setClassBase(__gd_d_B, rt.lookupClass("A") ?? null);
rt.registerScriptProps(__gd_d_B, ["y"], (o) => { const s = o as B; return [s.y]; });
rt.registerDictIdentity(__gd_d_B, "res://main.gd", "B", ["y"], {}, (o) => { const s = o as B; return [s.y]; });

class Other extends rt.GdScriptObject {
  declare z: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(10);
      this.z = rt.V.int(3);
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

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Other = rt.defineClass(Other, () => new Other(), (o) => o instanceof Other);
rt.nameClass(__gd_d_Other, "Other");
rt.registerScriptProps(__gd_d_Other, ["z"], (o) => { const s = o as Other; return [s.z]; });
rt.registerDictIdentity(__gd_d_Other, "res://main.gd", "Other", ["z"], {}, (o) => { const s = o as Other; return [s.z]; });
rt.registerNativeBase(__gd_d_Other, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
