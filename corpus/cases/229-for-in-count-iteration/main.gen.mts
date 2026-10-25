// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

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

  each(label: rt.Variant, f: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "each");
    try {
      label = rt.paramSlot(label, "String", 1, "each", this);
      rt.frameLine(4);
      let parts = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
      rt.frameLine(5);
      for (let x of rt.iter(f)) {
        rt.frameLine(6);
        rt.method(parts, "append", [rt.strBuiltin([x])]);
      }
      rt.frameLine(7);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(label, rt.V.str("\t[")), rt.method(rt.V.str("]["), "join", [parts])), rt.V.str("]\t")), rt.strBuiltin([rt.method(parts, "size", [])]))]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  counted(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "counted");
    try {
      n = rt.paramSlot(n, "int", 1, "counted", this);
      rt.frameLine(10);
      let total = rt.V.int(0);
      rt.frameLine(11);
      for (let i of rt.iter(n)) {
        rt.frameLine(12);
        total = rt.ops.add(total, i);
      }
      rt.frameLine(13);
      return total;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  counted_float(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "counted_float");
    try {
      n = rt.paramSlot(n, "float", 1, "counted_float", this);
      rt.frameLine(16);
      let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
      rt.frameLine(17);
      for (let i of rt.iter(n)) {
        rt.frameLine(18);
        rt.method(out, "append", [rt.strBuiltin([i])]);
      }
      rt.frameLine(19);
      return rt.method(rt.V.str("|"), "join", [out]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  nested(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "nested");
    try {
      rt.frameLine(22);
      let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
      rt.frameLine(23);
      for (let i of rt.iter(rt.V.int(2))) {
        rt.frameLine(24);
        for (let j of rt.iter(rt.V.int(2))) {
          rt.frameLine(25);
          rt.method(out, "append", [rt.ops.add(rt.strBuiltin([i]), rt.strBuiltin([j]))]);
        }
      }
      rt.frameLine(26);
      return rt.method(rt.V.str(","), "join", [out]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  typed_loop_var(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "typed_loop_var");
    try {
      rt.frameLine(29);
      let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
      rt.frameLine(30);
      for (let i of rt.iter(rt.V.int(3))) {
        rt.frameLine(31);
        rt.method(out, "append", [rt.strBuiltin([i])]);
      }
      rt.frameLine(32);
      return rt.method(rt.V.str(","), "join", [out]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  _collect(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_collect");
    try {
      rt.frameLine(35);
      let out = rt.V.array(rt.GArray.of([]));
      rt.frameLine(36);
      for (let i of rt.iter(n)) {
        rt.frameLine(37);
        rt.method(out, "append", [i]);
      }
      rt.frameLine(38);
      return out;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.array(rt.GArray.of([]));
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(41);
      this.each(rt.V.str("int-5"), rt.V.int(5));
      rt.frameLine(42);
      this.each(rt.V.str("int-0"), rt.V.int(0));
      rt.frameLine(43);
      this.each(rt.V.str("int-1"), rt.V.int(1));
      rt.frameLine(44);
      this.each(rt.V.str("int-neg"), rt.V.int((-3)));
      rt.frameLine(45);
      this.each(rt.V.str("float-2"), rt.V.float(2));
      rt.frameLine(46);
      this.each(rt.V.str("float-0.5"), rt.V.float(0.5));
      rt.frameLine(47);
      this.each(rt.V.str("float-neg"), rt.V.float((-1)));
      rt.frameLine(48);
      this.each(rt.V.str("str-ab"), rt.V.str("ab"));
      rt.frameLine(49);
      this.each(rt.V.str("str-empty"), rt.V.str(""));
      rt.frameLine(50);
      this.each(rt.V.str("str-utf"), rt.V.str("é😀a"));
      rt.frameLine(51);
      this.each(rt.V.str("dict"), rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]));
      rt.frameLine(52);
      this.each(rt.V.str("dict-empty"), rt.dictOf([]));
      rt.frameLine(53);
      this.each(rt.V.str("array"), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8), rt.V.int(9)])));
      rt.frameLine(54);
      this.each(rt.V.str("array-empty"), rt.V.array(rt.GArray.of([])));
      rt.frameLine(55);
      this.each(rt.V.str("pack-byte"), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(8)]))]));
      rt.frameLine(56);
      this.each(rt.V.str("pack-str"), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("x"), rt.V.str("y")]))]));
      rt.frameLine(57);
      this.each(rt.V.str("nested-array"), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3)]))])));
      rt.frameLine(58);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("counted\t"), rt.strBuiltin([this.counted(rt.V.int(5))])), rt.V.str("\t")), rt.strBuiltin([this.counted(rt.V.int(0))])), rt.V.str("\t")), rt.strBuiltin([this.counted(rt.V.int((-2)))]))]));
      rt.frameLine(59);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("counted-f\t"), this.counted_float(rt.V.float(3))), rt.V.str("\t")), this.counted_float(rt.V.float(0)))]));
      rt.frameLine(60);
      print(rt.showArgs([rt.ops.add(rt.V.str("nested\t"), this.nested())]));
      rt.frameLine(61);
      print(rt.showArgs([rt.ops.add(rt.V.str("typed\t"), this.typed_loop_var())]));
      rt.frameLine(62);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("range-parity\t"), rt.strBuiltin([rt.V.array(rt.range([rt.V.int(4)]))])), rt.V.str("\t")), rt.strBuiltin([this._collect(rt.V.int(4))])), rt.V.str("\t")), rt.strBuiltin([this._collect(rt.V.int(0))]))]));
      rt.frameLine(63);
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "each": [2, 2], "counted": [1, 1], "counted_float": [1, 1], "nested": [0, 0], "typed_loop_var": [0, 0], "_collect": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "each": ["String", ], "counted": ["int"], "counted_float": ["float"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
