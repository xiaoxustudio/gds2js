// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  row(tag: rt.Variant, x: rt.Variant): void {
    tag = rt.paramSlot(tag, "String", 1, "row", this);
    print(rt.showArgs([tag, rt.V.str("|"), rt.isType(x, "Object"), rt.V.str("|"), rt.isType(x, "RefCounted"), rt.V.str("|"), rt.isType(x, "Resource"), rt.V.str("|"), rt.isType(x, "GDScript"), rt.V.str("|"), rt.isType(x, "Callable"), rt.V.str("|"), rt.isType(x, "Vector2"), rt.V.str("|"), rt.isType(x, "Array"), rt.V.str("|"), rt.typeOf(x)]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Inner());
    this.row(rt.V.str("y01"), o);
    this.row(rt.V.str("y02"), rt.V.object(__gd_d_Inner));
    this.row(rt.V.str("y03"), rt.vector2New([rt.V.int(1), rt.V.int(2)]));
    this.row(rt.V.str("y04"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])));
    this.row(rt.V.str("y05"), rt.dictOf([[rt.V.int(1), rt.V.int(2)]]));
    this.row(rt.V.str("y06"), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
    this.row(rt.V.str("y07"), rt.V.str("x"));
    this.row(rt.V.str("y08"), rt.V.int(1));
    this.row(rt.V.str("y09"), rt.wrapValue(rt.attribute(o, "m")));
    this.row(rt.V.str("y10"), rt.callableCtor([]));
    this.row(rt.V.str("y11"), rt.V.nil());
    this.row(rt.V.str("y12"), rt.V.object(this));
    print(rt.showArgs([rt.V.str("y13|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "RefCounted"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Object"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Inner")]));
    print(rt.showArgs([rt.V.str("y14|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Resource"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "GDScript"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Node")]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "row": return rt.wrapValue(this.row(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "row": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  v = rt.V.int(1);

  m(x: rt.Variant): rt.Variant {
    return x;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "m": return rt.wrapValue(this.m(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["v"]);
rt.registerMethodArities(__gd_d_Inner, { "m": [1, 1] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
