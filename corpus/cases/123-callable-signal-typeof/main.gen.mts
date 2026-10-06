// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fired = new rt.Signal("fired");

  ifn(): rt.Variant {
    return rt.V.int(7);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let b = rt.V.object(new Box());
    let cb = rt.methodCallable(rt.V.object(this), "ifn");
    let sig = rt.wrapValue(this.fired);
    print(rt.showArgs([rt.V.str("u1 "), rt.typeOf(cb)]));
    print(rt.showArgs([rt.V.str("u2 "), rt.typeOf(rt.methodCallable(rt.V.object(this), "ifn"))]));
    print(rt.showArgs([rt.V.str("u3 "), rt.typeOf(sig)]));
    print(rt.showArgs([rt.V.str("u4 "), rt.typeOf(rt.wrapValue(this.fired))]));
    print(rt.showArgs([rt.V.str("u5 "), rt.typeOf(rt.wrapValue(rt.attribute(b, "boxed")))]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(cb, "call", [])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.typeOf(rt.wrapValue(rt.attribute(b, "n")))]));
    print(rt.showArgs([rt.V.str("u8 "), rt.typeOf(rt.wrapValue(rt.attribute(rt.V.object(new Box()), "boxed")))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "ifn": return rt.wrapValue(this.ifn());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "ifn": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Box extends rt.GdScriptObject {
  boxed = new rt.Signal("boxed");
  n = rt.toInt(rt.V.int(1));

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerFieldTypes(__gd_d_Box, {"n": "int"});
rt.registerScriptProps(__gd_d_Box, ["n"]);
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
