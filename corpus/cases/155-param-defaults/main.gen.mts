// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare K: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.K = rt.V.int(11);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static K = rt.V.int(11);

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(57);
      let x = rt.V.object(new A());
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("t1 "), rt.method(x, "one", [rt.V.int(1)])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(x, "one", [rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("t3 "), rt.method(x, "arr_default", [])]));
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("t4 "), rt.method(x, "arr_default", [])]));
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("t5 "), rt.method(x, "vec_default", []), rt.V.str(" "), rt.method(x, "null_default", [])]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("t6 "), rt.method(x, "refs_earlier", [rt.V.int(3)]), rt.V.str(" "), rt.method(x, "refs_earlier", [rt.V.int(3), rt.V.int(7)])]));
      rt.frameLine(64);
      print(rt.showArgs([rt.V.str("t7 "), rt.method(x, "const_default", []), rt.V.str(" "), rt.method(x, "call_it", [])]));
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("t8 "), rt.method(x, "str_slot", []), rt.V.str(" "), rt.method(x, "str_slot", [rt.V.stringName("nm")])]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("t9 "), rt.method(x, "float_into_int_slot", [])]));
      rt.frameLine(67);
      print(rt.showArgs([rt.V.str("t9b "), rt.method(x, "float_into_int_math", [])]));
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("t10 "), rt.method(rt.V.object(__gd_d_A), "sf", [rt.V.int(1)]), rt.V.str(" "), rt.method(rt.V.object(__gd_d_A), "sf", [rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(69);
      let cb = rt.wrapValue(rt.attribute(x, "one"));
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("t11 "), rt.method(cb, "call", [rt.V.int(1)]), rt.V.str(" "), rt.method(cb, "call", [rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(71);
      print(rt.showArgs([rt.V.str("t13")]));
      rt.frameLine(72);
      let n1 = rt.V.object(new Needs());
      rt.frameLine(73);
      let n2 = rt.V.object(new Needs(rt.V.int(4)));
      rt.frameLine(74);
      print(rt.showArgs([rt.V.str("t14 "), rt.wrapValue(rt.attribute(n1, "a")), rt.V.str(" "), rt.wrapValue(rt.attribute(n2, "a"))]));
      rt.frameLine(75);
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
rt.registerScriptProps(__gd_d_Main, ["K"], (o) => { const s = o as Main; return [s.K]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class A extends rt.GdScriptObject {
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

  static sf(a: rt.Variant, b: rt.Variant = rt.toInt(rt.V.int(9))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sf");
    try {
      rt.frameLine(7);
      return rt.formatOf(rt.V.str("sf=%d/%d"), rt.V.array(rt.GArray.of([a, b])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  one(a: rt.Variant, b: rt.Variant = rt.toInt(rt.V.int(5))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "one");
    try {
      a = rt.paramSlot(a, "int", 1, "one", this);
      b = rt.paramSlot(b, "int", 2, "one", this);
      rt.frameLine(10);
      return rt.formatOf(rt.V.str("one=%d/%d"), rt.V.array(rt.GArray.of([a, b])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  expr_default(a: rt.Variant = rt.V.int(rt.fast.iAddC(1, 2))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "expr_default");
    try {
      rt.frameLine(13);
      return rt.formatOf(rt.V.str("e=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a])])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  arr_default(a: rt.Variant = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "arr_default");
    try {
      rt.frameLine(16);
      rt.method(a, "append", [rt.V.int(99)]);
      rt.frameLine(17);
      return rt.formatOf(rt.V.str("arr=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a])])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  vec_default(v: rt.Variant = rt.vector2New([rt.V.int(1), rt.V.int(2)])): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "vec_default");
    try {
      rt.frameLine(20);
      return rt.formatOf(rt.V.str("v=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([v])])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  null_default(a: rt.Variant = rt.V.nil()): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "null_default");
    try {
      rt.frameLine(23);
      return rt.formatOf(rt.V.str("n=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a])])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  refs_earlier(a: rt.Variant, b: rt.Variant = a): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "refs_earlier");
    try {
      a = rt.paramSlot(a, "int", 1, "refs_earlier", this);
      rt.frameLine(26);
      return rt.formatOf(rt.V.str("r=%d/%d"), rt.V.array(rt.GArray.of([a, b])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  const_default(a: rt.Variant = Main.K): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "const_default");
    try {
      rt.frameLine(29);
      return rt.formatOf(rt.V.str("c=%d"), rt.V.array(rt.GArray.of([a])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  method_default(a: rt.Variant = rt.V.int(2)): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "method_default");
    try {
      rt.frameLine(32);
      return rt.formatOf(rt.V.str("d=%d/%d"), rt.V.array(rt.GArray.of([a, this.helper()])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  helper(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "helper");
    try {
      rt.frameLine(35);
      return rt.V.int(7);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  str_slot(a: rt.Variant = rt.strOf(rt.V.str("hi"))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "str_slot");
    try {
      a = rt.paramSlot(a, "String", 1, "str_slot", this);
      rt.frameLine(38);
      return rt.ops.add(rt.ops.add(rt.V.str("s=["), a), rt.V.str("]"));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  float_into_int_slot(a: rt.Variant = rt.toInt(rt.V.float(2.7))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "float_into_int_slot");
    try {
      a = rt.paramSlot(a, "int", 1, "float_into_int_slot", this);
      rt.frameLine(41);
      return rt.formatOf(rt.V.str("m=%d"), a, true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  float_into_int_math(a: rt.Variant = rt.toInt(rt.V.float(2.7))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "float_into_int_math");
    try {
      a = rt.paramSlot(a, "int", 1, "float_into_int_math", this);
      rt.frameLine(44);
      return rt.formatOf(rt.V.str("mm=%s|%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.strBuiltin([rt.ops.add(a, rt.V.float(0.5))])])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  call_it(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "call_it");
    try {
      rt.frameLine(47);
      return rt.formatOf(rt.V.str("%s|%s"), rt.V.array(rt.GArray.of([this.expr_default(), this.method_default()])), true);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "one": return rt.wrapValue(this.one(args[0] as rt.Variant, args.length > 1 ? (args[1] as rt.Variant) : undefined));
      case "expr_default": return rt.wrapValue(this.expr_default(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "arr_default": return rt.wrapValue(this.arr_default(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "vec_default": return rt.wrapValue(this.vec_default(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "null_default": return rt.wrapValue(this.null_default(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "refs_earlier": return rt.wrapValue(this.refs_earlier(args[0] as rt.Variant, args.length > 1 ? (args[1] as rt.Variant) : undefined));
      case "const_default": return rt.wrapValue(this.const_default(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "method_default": return rt.wrapValue(this.method_default(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "helper": return rt.wrapValue(this.helper());
      case "str_slot": return rt.wrapValue(this.str_slot(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "float_into_int_slot": return rt.wrapValue(this.float_into_int_slot(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "float_into_int_math": return rt.wrapValue(this.float_into_int_math(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "call_it": return rt.wrapValue(this.call_it());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", [], {}, (o) => { const s = o as A; return []; });
rt.registerMethodArities(__gd_d_A, { "sf": [1, 2], "one": [1, 2], "expr_default": [0, 1], "arr_default": [0, 1], "vec_default": [0, 1], "null_default": [0, 1], "refs_earlier": [1, 2], "const_default": [0, 1], "method_default": [0, 1], "helper": [0, 0], "str_slot": [0, 1], "float_into_int_slot": [0, 1], "float_into_int_math": [0, 1], "call_it": [0, 0] });
rt.registerMethodParams(__gd_d_A, { "sf": ["int", "int"], "one": ["int", "int"], "refs_earlier": ["int", ], "str_slot": ["String"], "float_into_int_slot": ["int"], "float_into_int_math": ["int"] });
rt.registerStaticMethods(__gd_d_A, ["sf"], {"sf": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.sf(a[0] as rt.Variant, a.length > 1 ? (a[1] as rt.Variant) : undefined))});
rt.registerNativeBase(__gd_d_A, "RefCounted");

class Needs extends rt.GdScriptObject {
  declare a: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(50);
      this.a = rt.toInt(rt.V.int(0));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor(p_a: rt.Variant = rt.toInt(rt.V.int(7))) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) {
        const __gd_frame = rt.frameEnter("res://main.gd", "_init");
        try {
        p_a = rt.paramSlot(p_a, "int", 1, "_init", this);
        rt.frameLine(53);
        this.a = rt.toInt(p_a);
        rt.frameLine(54);
        print(rt.showArgs([rt.formatOf(rt.V.str("n=%d"), p_a, true)]));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return;
        } finally {
          rt.frameExit(__gd_frame);
        }
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Needs = rt.defineClass(Needs, (a) => new Needs(a.length > 0 ? (a[0] as rt.Variant) : undefined), (o) => o instanceof Needs);
rt.nameClass(__gd_d_Needs, "Needs");
rt.registerFieldTypes(__gd_d_Needs, {"a": "int"});
rt.registerScriptProps(__gd_d_Needs, ["a"], (o) => { const s = o as Needs; return [s.a]; });
rt.registerDictIdentity(__gd_d_Needs, "res://main.gd", "Needs", ["a"], {}, (o) => { const s = o as Needs; return [s.a]; });
rt.registerNativeBase(__gd_d_Needs, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
