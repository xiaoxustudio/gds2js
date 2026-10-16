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

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(4);
      let a = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(5);
      rt.method(a, "sort", []);
      rt.frameLine(6);
      print(rt.showArgs([a]));
      rt.frameLine(7);
      let f = rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.int(1), rt.V.float(3), rt.V.int(2)]));
      rt.frameLine(8);
      rt.method(f, "sort", []);
      rt.frameLine(9);
      print(rt.showArgs([f]));
      rt.frameLine(10);
      let s = rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("C")]));
      rt.frameLine(11);
      rt.method(s, "sort", []);
      rt.frameLine(12);
      print(rt.showArgs([s]));
      rt.frameLine(13);
      let n = rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int((-2)), rt.V.int(0), rt.V.int((-1)), rt.V.int(1)]));
      rt.frameLine(14);
      rt.method(n, "sort", []);
      rt.frameLine(15);
      print(rt.showArgs([n]));
      rt.frameLine(16);
      let e = rt.V.array(rt.GArray.of([]));
      rt.frameLine(17);
      rt.method(e, "sort", []);
      rt.frameLine(18);
      print(rt.showArgs([e]));
      rt.frameLine(19);
      let b = rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false), rt.V.bool(true)]));
      rt.frameLine(20);
      rt.method(b, "sort", []);
      rt.frameLine(21);
      print(rt.showArgs([b]));
      rt.frameLine(22);
      let big = rt.V.array(rt.GArray.of([rt.V.int(9007199254740993n), rt.V.int(9007199254740992n), rt.V.int(1)]));
      rt.frameLine(23);
      rt.method(big, "sort", []);
      rt.frameLine(24);
      print(rt.showArgs([big]));
      rt.frameLine(25);
      let v = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(0), rt.V.int(3)])]));
      rt.frameLine(26);
      rt.method(v, "sort", []);
      rt.frameLine(27);
      print(rt.showArgs([v]));
      rt.frameLine(28);
      let t = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(29);
      rt.method(t, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(29);
          return rt.ops.lt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(30);
      print(rt.showArgs([t]));
      rt.frameLine(31);
      let u = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(32);
      rt.method(u, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(32);
          return rt.ops.gt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(33);
      print(rt.showArgs([u]));
      rt.frameLine(34);
      let pairs = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("a")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("b")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("c")])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.str("d")])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("e")]))]));
      rt.frameLine(35);
      rt.method(pairs, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(35);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(36);
      print(rt.showArgs([pairs]));
      rt.frameLine(37);
      let words = rt.V.array(rt.GArray.of([rt.V.str("pear"), rt.V.str("apple"), rt.V.str("fig")]));
      rt.frameLine(38);
      rt.method(words, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(38);
          return rt.ops.gt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(39);
      print(rt.showArgs([words]));
      rt.frameLine(40);
      let vs = rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(0), rt.V.int(3)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int((-2)), rt.V.int(5)])]));
      rt.frameLine(41);
      rt.method(vs, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(41);
          return rt.ops.lt(rt.wrapValue(rt.attribute(x, "y")), rt.wrapValue(rt.attribute(y, "y")));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(42);
      print(rt.showArgs([vs]));
      rt.frameLine(43);
      let one = rt.V.array(rt.GArray.of([rt.V.int(5)]));
      rt.frameLine(44);
      rt.method(one, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(44);
          return rt.ops.lt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(45);
      print(rt.showArgs([one]));
      rt.frameLine(46);
      print(rt.showArgs([rt.method(n, "min", [])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.method(n, "max", [])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "min", [])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "max", [])]));
      rt.frameLine(50);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(3)])]));
      rt.frameLine(51);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5)])), "bsearch", [rt.V.int(4)])]));
      rt.frameLine(52);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(99)])]));
      rt.frameLine(53);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.int(2)])]));
      rt.frameLine(54);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), "bsearch_custom", [rt.V.int(2), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(54);
          return rt.ops.lt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(55);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.str("b"), rt.V.str("a"), rt.V.str("c")])), "bsearch", [rt.V.str("b")])]));
      rt.frameLine(56);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(3)])]));
      rt.frameLine(57);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "find", [rt.V.int(9)])]));
      rt.frameLine(58);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])), "find", [rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)])), "count", [rt.V.int(3)])]));
      rt.frameLine(60);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "count", [rt.V.int(1)])]));
      rt.frameLine(61);
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
