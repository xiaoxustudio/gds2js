// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  s(label: rt.Variant, items: rt.Variant): void {
    rt.method(items, "sort", []);
    print(rt.showArgs([label, rt.V.str(" → "), items]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.s(rt.V.str("int混float"), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.float(1.5), rt.V.int(1), rt.V.float(2.5)])));
    this.s(rt.V.str("串按码点"), rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("A"), rt.V.str("a"), rt.V.str("ab")])));
    this.s(rt.V.str("向量按分量"), rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.vector2iNew([rt.V.int(0), rt.V.int(3)])])));
    this.s(rt.V.str("RID按无符号号"), rt.V.array(rt.GArray.of([rt.gRidFromInt64(rt.V.int((-1))), rt.gRidFromInt64(rt.V.int(8)), rt.gRidFromInt64(rt.V.int(7))])));
    this.s(rt.V.str("数组按装箱序"), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([])), rt.V.array(rt.GArray.of([rt.V.int(2)]))])));
    this.s(rt.V.str("bool与null"), rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false), rt.V.nil()])));
    this.s(rt.V.str("跨形原地不动"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("a"), rt.V.nil(), rt.V.stringName("n")])));
    this.s(rt.V.str("Color原地不动"), rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)])])));
    this.s(rt.V.str("字典原地不动"), rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), rt.dictOf([[rt.V.str("a"), rt.V.int(1)]])])));
    this.s(rt.V.str("NodePath原地不动"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("b")]), rt.nodePathCtor([rt.V.str("a")])])));
    this.s(rt.V.str("pack原地不动"), rt.V.array(rt.GArray.of([rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(2)]))]), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("b")]))]), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))])])));
    this.s(rt.V.str("十七乱序int"), rt.V.array(rt.GArray.of([rt.V.int(16), rt.V.int(0), rt.V.int(15), rt.V.int(1), rt.V.int(14), rt.V.int(2), rt.V.int(13), rt.V.int(3), rt.V.int(12), rt.V.int(4), rt.V.int(11), rt.V.int(5), rt.V.int(10), rt.V.int(6), rt.V.int(9), rt.V.int(7), rt.V.int(8)])));
    this.s(rt.V.str("廿一混形"), rt.V.array(rt.GArray.of([rt.V.int(20), rt.V.str("t"), rt.V.int(19), rt.V.float(1.5), rt.V.nil(), rt.nodePathCtor([rt.V.str("p")]), rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.gRidFromInt64(rt.V.int(7)), rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.int(3), rt.V.float(2.5), rt.V.bool(true), rt.V.int(1), rt.V.float(1.5), rt.V.int(0)])));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "s": return rt.wrapValue(this.s(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "s": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
