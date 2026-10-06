// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  each(label: rt.Variant, f: rt.Variant): void {
    label = rt.paramSlot(label, "String", 1, "each", this);
    let parts = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
    for (let x of rt.iter(f)) {
      rt.method(parts, "append", [rt.strBuiltin([x])]);
    }
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(label, rt.V.str("\t[")), rt.method(rt.V.str("]["), "join", [parts])), rt.V.str("]\t")), rt.strBuiltin([rt.method(parts, "size", [])]))]));
  }
  
  counted(n: rt.Variant): rt.Variant {
    n = rt.paramSlot(n, "int", 1, "counted", this);
    let total = rt.V.int(0);
    for (let i of rt.iter(n)) {
      total = rt.ops.add(total, i);
    }
    return total;
  }
  
  counted_float(n: rt.Variant): rt.Variant {
    n = rt.paramSlot(n, "float", 1, "counted_float", this);
    let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
    for (let i of rt.iter(n)) {
      rt.method(out, "append", [rt.strBuiltin([i])]);
    }
    return rt.method(rt.V.str("|"), "join", [out]);
  }
  
  nested(): rt.Variant {
    let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
    for (let i of rt.iter(rt.V.int(2))) {
      for (let j of rt.iter(rt.V.int(2))) {
        rt.method(out, "append", [rt.ops.add(rt.strBuiltin([i]), rt.strBuiltin([j]))]);
      }
    }
    return rt.method(rt.V.str(","), "join", [out]);
  }
  
  typed_loop_var(): rt.Variant {
    let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
    for (let i of rt.iter(rt.V.int(3))) {
      rt.method(out, "append", [rt.strBuiltin([i])]);
    }
    return rt.method(rt.V.str(","), "join", [out]);
  }
  
  _collect(n: rt.Variant): rt.Variant {
    let out = rt.V.array(rt.GArray.of([]));
    for (let i of rt.iter(n)) {
      rt.method(out, "append", [i]);
    }
    return out;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.each(rt.V.str("int-5"), rt.V.int(5));
    this.each(rt.V.str("int-0"), rt.V.int(0));
    this.each(rt.V.str("int-1"), rt.V.int(1));
    this.each(rt.V.str("int-neg"), rt.V.int((-3)));
    this.each(rt.V.str("float-2"), rt.V.float(2));
    this.each(rt.V.str("float-0.5"), rt.V.float(0.5));
    this.each(rt.V.str("float-neg"), rt.V.float((-1)));
    this.each(rt.V.str("str-ab"), rt.V.str("ab"));
    this.each(rt.V.str("str-empty"), rt.V.str(""));
    this.each(rt.V.str("str-utf"), rt.V.str("é😀a"));
    this.each(rt.V.str("dict"), rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]));
    this.each(rt.V.str("dict-empty"), rt.dictOf([]));
    this.each(rt.V.str("array"), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8), rt.V.int(9)])));
    this.each(rt.V.str("array-empty"), rt.V.array(rt.GArray.of([])));
    this.each(rt.V.str("pack-byte"), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(8)]))]));
    this.each(rt.V.str("pack-str"), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("x"), rt.V.str("y")]))]));
    this.each(rt.V.str("nested-array"), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3)]))])));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("counted\t"), rt.strBuiltin([this.counted(rt.V.int(5))])), rt.V.str("\t")), rt.strBuiltin([this.counted(rt.V.int(0))])), rt.V.str("\t")), rt.strBuiltin([this.counted(rt.V.int((-2)))]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("counted-f\t"), this.counted_float(rt.V.float(3))), rt.V.str("\t")), this.counted_float(rt.V.float(0)))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("nested\t"), this.nested())]));
    print(rt.showArgs([rt.ops.add(rt.V.str("typed\t"), this.typed_loop_var())]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("range-parity\t"), rt.strBuiltin([rt.V.array(rt.range([rt.V.int(4)]))])), rt.V.str("\t")), rt.strBuiltin([this._collect(rt.V.int(4))])), rt.V.str("\t")), rt.strBuiltin([this._collect(rt.V.int(0))]))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "each": return rt.wrapValue(this.each(args[0] as rt.Variant, args[1] as rt.Variant));
      case "counted": return rt.wrapValue(this.counted(args[0] as rt.Variant));
      case "counted_float": return rt.wrapValue(this.counted_float(args[0] as rt.Variant));
      case "nested": return rt.wrapValue(this.nested());
      case "typed_loop_var": return rt.wrapValue(this.typed_loop_var());
      case "_collect": return rt.wrapValue(this._collect(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "each": [2, 2], "counted": [1, 1], "counted_float": [1, 1], "nested": [0, 0], "typed_loop_var": [0, 0], "_collect": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
