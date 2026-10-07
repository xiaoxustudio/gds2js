// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  K = rt.V.int(11);
  static K = rt.V.int(11);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let x = rt.V.object(new A());
    print(rt.showArgs([rt.V.str("t1 "), rt.method(x, "one", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(x, "one", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(x, "arr_default", [])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(x, "arr_default", [])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(x, "vec_default", []), rt.V.str(" "), rt.method(x, "null_default", [])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(x, "refs_earlier", [rt.V.int(3)]), rt.V.str(" "), rt.method(x, "refs_earlier", [rt.V.int(3), rt.V.int(7)])]));
    print(rt.showArgs([rt.V.str("t7 "), rt.method(x, "const_default", []), rt.V.str(" "), rt.method(x, "call_it", [])]));
    print(rt.showArgs([rt.V.str("t8 "), rt.method(x, "str_slot", []), rt.V.str(" "), rt.method(x, "str_slot", [rt.V.stringName("nm")])]));
    print(rt.showArgs([rt.V.str("t9 "), rt.method(x, "float_into_int_slot", [])]));
    print(rt.showArgs([rt.V.str("t9b "), rt.method(x, "float_into_int_math", [])]));
    print(rt.showArgs([rt.V.str("t10 "), rt.method(rt.V.object(__gd_d_A), "sf", [rt.V.int(1)]), rt.V.str(" "), rt.method(rt.V.object(__gd_d_A), "sf", [rt.V.int(1), rt.V.int(2)])]));
    let cb = rt.wrapValue(rt.attribute(x, "one"));
    print(rt.showArgs([rt.V.str("t11 "), rt.method(cb, "call", [rt.V.int(1)]), rt.V.str(" "), rt.method(cb, "call", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("t13")]));
    let n1 = rt.V.object(new Needs());
    let n2 = rt.V.object(new Needs(rt.V.int(4)));
    print(rt.showArgs([rt.V.str("t14 "), rt.wrapValue(rt.attribute(n1, "a")), rt.V.str(" "), rt.wrapValue(rt.attribute(n2, "a"))]));
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
rt.registerScriptProps(__gd_d_Main, ["K"]);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class A extends rt.GdScriptObject {
  static sf(a: rt.Variant, b: rt.Variant = rt.toInt(rt.V.int(9))): rt.Variant {
    return rt.formatOf(rt.V.str("sf=%d/%d"), rt.V.array(rt.GArray.of([a, b])));
  }
  
  one(a: rt.Variant, b: rt.Variant = rt.toInt(rt.V.int(5))): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "one", this);
    b = rt.paramSlot(b, "int", 2, "one", this);
    return rt.formatOf(rt.V.str("one=%d/%d"), rt.V.array(rt.GArray.of([a, b])));
  }
  
  expr_default(a: rt.Variant = rt.V.int(rt.fast.iAddC(1, 2))): rt.Variant {
    return rt.formatOf(rt.V.str("e=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a])])));
  }
  
  arr_default(a: rt.Variant = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))): rt.Variant {
    rt.method(a, "append", [rt.V.int(99)]);
    return rt.formatOf(rt.V.str("arr=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a])])));
  }
  
  vec_default(v: rt.Variant = rt.vector2New([rt.V.int(1), rt.V.int(2)])): rt.Variant {
    return rt.formatOf(rt.V.str("v=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([v])])));
  }
  
  null_default(a: rt.Variant = rt.V.nil()): rt.Variant {
    return rt.formatOf(rt.V.str("n=%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a])])));
  }
  
  refs_earlier(a: rt.Variant, b: rt.Variant = a): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "refs_earlier", this);
    return rt.formatOf(rt.V.str("r=%d/%d"), rt.V.array(rt.GArray.of([a, b])));
  }
  
  const_default(a: rt.Variant = Main.K): rt.Variant {
    return rt.formatOf(rt.V.str("c=%d"), rt.V.array(rt.GArray.of([a])));
  }
  
  method_default(a: rt.Variant = rt.V.int(2)): rt.Variant {
    return rt.formatOf(rt.V.str("d=%d/%d"), rt.V.array(rt.GArray.of([a, this.helper()])));
  }
  
  helper(): rt.Variant {
    return rt.V.int(7);
  }
  
  str_slot(a: rt.Variant = rt.strOf(rt.V.str("hi"))): rt.Variant {
    a = rt.paramSlot(a, "String", 1, "str_slot", this);
    return rt.ops.add(rt.ops.add(rt.V.str("s=["), a), rt.V.str("]"));
  }
  
  float_into_int_slot(a: rt.Variant = rt.toInt(rt.V.float(2.7))): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "float_into_int_slot", this);
    return rt.formatOf(rt.V.str("m=%d"), a);
  }
  
  float_into_int_math(a: rt.Variant = rt.toInt(rt.V.float(2.7))): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "float_into_int_math", this);
    return rt.formatOf(rt.V.str("mm=%s|%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.strBuiltin([rt.ops.add(a, rt.V.float(0.5))])])));
  }
  
  call_it(): rt.Variant {
    return rt.formatOf(rt.V.str("%s|%s"), rt.V.array(rt.GArray.of([this.expr_default(), this.method_default()])));
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
rt.registerMethodArities(__gd_d_A, { "sf": [1, 2], "one": [1, 2], "expr_default": [0, 1], "arr_default": [0, 1], "vec_default": [0, 1], "null_default": [0, 1], "refs_earlier": [1, 2], "const_default": [0, 1], "method_default": [0, 1], "helper": [0, 0], "str_slot": [0, 1], "float_into_int_slot": [0, 1], "float_into_int_math": [0, 1], "call_it": [0, 0] });
rt.registerStaticMethods(__gd_d_A, ["sf"], {"sf": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.sf(a[0] as rt.Variant, a.length > 1 ? (a[1] as rt.Variant) : undefined))});
rt.registerNativeBase(__gd_d_A, "RefCounted");

class Needs extends rt.GdScriptObject {
  a = rt.toInt(rt.V.int(0));

  constructor(p_a: rt.Variant = rt.toInt(rt.V.int(7))) {
    super();
    p_a = rt.paramSlot(p_a, "int", 1, "_init", this);
    this.a = rt.toInt(p_a);
    print(rt.showArgs([rt.formatOf(rt.V.str("n=%d"), p_a)]));
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
rt.registerScriptProps(__gd_d_Needs, ["a"]);
rt.registerNativeBase(__gd_d_Needs, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
