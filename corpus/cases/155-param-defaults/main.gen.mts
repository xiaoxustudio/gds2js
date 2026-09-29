// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  K = rt.V.int(11);
  static K = rt.V.int(11);

  async _initialize(): Promise<void> {
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
    print(rt.showArgs([rt.V.str("t10 "), rt.method(A, "sf", [rt.V.int(1)]), rt.V.str(" "), rt.method(A, "sf", [rt.V.int(1), rt.V.int(2)])]));
    let cb = rt.attribute(x, "one");
    print(rt.showArgs([rt.V.str("t11 "), rt.method(cb, "call", [rt.V.int(1)]), rt.V.str(" "), rt.method(cb, "call", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("t13")]));
    let n1 = rt.V.object(new Needs());
    let n2 = rt.V.object(new Needs(rt.V.int(4)));
    print(rt.showArgs([rt.V.str("t14 "), rt.attribute(n1, "a"), rt.V.str(" "), rt.attribute(n2, "a")]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class A {
  static sf(a, b = rt.toInt(rt.V.int(9))): unknown {
    return rt.formatOf(rt.V.str("sf=%d/%d"), rt.V.array(rt.GArray.of([a, b])));
  }
  
  one(a, b = rt.toInt(rt.V.int(5))): unknown {
    a = rt.paramSlot(a, "int", 1, "one", this);
    b = rt.paramSlot(b, "int", 2, "one", this);
    return rt.formatOf(rt.V.str("one=%d/%d"), rt.V.array(rt.GArray.of([a, b])));
  }
  
  expr_default(a = rt.V.int(rt.fast.iAddC(1, 2))): unknown {
    return rt.formatOf(rt.V.str("e=%s"), rt.V.array(rt.GArray.of([rt.strOf(a)])));
  }
  
  arr_default(a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))): unknown {
    rt.method(a, "append", [rt.V.int(99)]);
    return rt.formatOf(rt.V.str("arr=%s"), rt.V.array(rt.GArray.of([rt.strOf(a)])));
  }
  
  vec_default(v = rt.vector2New([rt.V.int(1), rt.V.int(2)])): unknown {
    return rt.formatOf(rt.V.str("v=%s"), rt.V.array(rt.GArray.of([rt.strOf(v)])));
  }
  
  null_default(a = rt.V.nil()): unknown {
    return rt.formatOf(rt.V.str("n=%s"), rt.V.array(rt.GArray.of([rt.strOf(a)])));
  }
  
  refs_earlier(a, b = a): unknown {
    a = rt.paramSlot(a, "int", 1, "refs_earlier", this);
    return rt.formatOf(rt.V.str("r=%d/%d"), rt.V.array(rt.GArray.of([a, b])));
  }
  
  const_default(a = Main.K): unknown {
    return rt.formatOf(rt.V.str("c=%d"), rt.V.array(rt.GArray.of([a])));
  }
  
  method_default(a = rt.V.int(2)): unknown {
    return rt.formatOf(rt.V.str("d=%d/%d"), rt.V.array(rt.GArray.of([a, this.helper()])));
  }
  
  helper(): unknown {
    return rt.V.int(7);
  }
  
  str_slot(a = rt.strOf(rt.V.str("hi"))): unknown {
    a = rt.paramSlot(a, "String", 1, "str_slot", this);
    return rt.ops.add(rt.ops.add(rt.V.str("s=["), a), rt.V.str("]"));
  }
  
  float_into_int_slot(a = rt.toInt(rt.V.float(2.7))): unknown {
    a = rt.paramSlot(a, "int", 1, "float_into_int_slot", this);
    return rt.formatOf(rt.V.str("m=%d"), a);
  }
  
  float_into_int_math(a = rt.toInt(rt.V.float(2.7))): unknown {
    a = rt.paramSlot(a, "int", 1, "float_into_int_math", this);
    return rt.formatOf(rt.V.str("mm=%s|%s"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.strOf(rt.ops.add(a, rt.V.float(0.5)))])));
  }
  
  call_it(): unknown {
    return rt.formatOf(rt.V.str("%s|%s"), rt.V.array(rt.GArray.of([this.expr_default(), this.method_default()])));
  }
  
}
rt.registerClass("A", A);
rt.registerStaticMethods(A, ["sf"]);
rt.registerNativeBase(A, "RefCounted");

class Needs {
  a = rt.V.int(0);

  constructor(p_a = rt.toInt(rt.V.int(7))) {
    p_a = rt.paramSlot(p_a, "int", 1, "_init", this);
    this.a = rt.toInt(p_a);
    print(rt.showArgs([rt.formatOf(rt.V.str("n=%d"), p_a)]));
  }
  
}
rt.registerClass("Needs", Needs);
rt.registerFieldTypes(Needs, {"a": "int"});
rt.registerNativeBase(Needs, "RefCounted");

await new Main().run();
