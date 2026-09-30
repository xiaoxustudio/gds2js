// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let x = rt.V.object(new A());
    let f = rt.toFloat(rt.V.float(2.7));
    let big = rt.toFloat(rt.V.float(1e+30));
    let sn = rt.V.stringName("nm");
    let vi = rt.vector2iNew([rt.V.int(3), rt.V.int(4)]);
    let v = rt.vector2New([rt.V.float(1.7), rt.V.float(2.2)]);
    print(rt.showArgs([rt.V.str("t1 "), rt.method(x, "p_int", [rt.V.int(7)]), rt.V.str(" "), rt.method(x, "p_int", [f]), rt.V.str(" "), rt.method(x, "p_int", [rt.V.bool(true)]), rt.V.str(" "), rt.method(x, "p_int", [rt.V.bool(false)])]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(x, "p_int", [big])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(x, "p_float", [rt.V.int(1)]), rt.V.str(" "), rt.method(x, "p_float", [rt.V.float(2.5)]), rt.V.str(" "), rt.method(x, "p_float", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(x, "p_bool", [rt.V.int(3)]), rt.V.str(" "), rt.method(x, "p_bool", [rt.V.int(0)]), rt.V.str(" "), rt.method(x, "p_bool", [rt.V.float(2.7)])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(x, "p_str", [rt.V.str("abc")]), rt.V.str(" "), rt.method(x, "p_str", [sn])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(x, "p_vec2", [vi]), rt.V.str(" "), rt.method(x, "p_vec2", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
    print(rt.showArgs([rt.V.str("t7 "), rt.method(x, "p_vec2i", [v]), rt.V.str(" "), rt.method(x, "p_vec2i", [rt.vector2iNew([rt.V.int(5), rt.V.int(6)])])]));
    print(rt.showArgs([rt.V.str("t8 "), rt.method(x, "p_color", [rt.V.str("abc")]), rt.V.str(" "), rt.method(x, "p_color", [rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)])])]));
    print(rt.showArgs([rt.V.str("t9 "), rt.method(x, "math", [rt.V.float(2.7)]), rt.V.str(" "), rt.method(x, "math", [rt.V.bool(true)])]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class A {
  p_int(a): unknown {
    a = rt.paramSlot(a, "int", 1, "p_int", this);
    return rt.formatOf(rt.V.str("int<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.typeOf(a)])));
  }
  
  p_float(a): unknown {
    a = rt.paramSlot(a, "float", 1, "p_float", this);
    return rt.formatOf(rt.V.str("float<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.typeOf(a)])));
  }
  
  p_bool(a): unknown {
    a = rt.paramSlot(a, "bool", 1, "p_bool", this);
    return rt.formatOf(rt.V.str("bool<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.typeOf(a)])));
  }
  
  p_str(a): unknown {
    a = rt.paramSlot(a, "String", 1, "p_str", this);
    return rt.formatOf(rt.V.str("str<-%s(%s)"), rt.V.array(rt.GArray.of([a, rt.typeOf(a)])));
  }
  
  p_vec2(a): unknown {
    a = rt.paramSlot(a, "Vector2", 1, "p_vec2", this);
    return rt.formatOf(rt.V.str("vec2<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.typeOf(a)])));
  }
  
  p_vec2i(a): unknown {
    a = rt.paramSlot(a, "Vector2i", 1, "p_vec2i", this);
    return rt.formatOf(rt.V.str("vec2i<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.typeOf(a)])));
  }
  
  p_color(a): unknown {
    a = rt.paramSlot(a, "Color", 1, "p_color", this);
    return rt.formatOf(rt.V.str("color<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.typeOf(a)])));
  }
  
  math(a): unknown {
    a = rt.paramSlot(a, "int", 1, "math", this);
    return rt.formatOf(rt.V.str("math<-%s|%s"), rt.V.array(rt.GArray.of([rt.strOf(a), rt.strOf(rt.ops.mul(a, rt.V.int(2)))])));
  }
  
}
rt.registerClass("A", A);
rt.registerNativeBase(A, "RefCounted");

await new Main().run();
