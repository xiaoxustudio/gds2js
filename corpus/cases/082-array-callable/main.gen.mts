// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare seen: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.seen = rt.V.array(rt.GArray.of([]));
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

  _pick(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_pick");
    try {
      rt.frameLine(6);
      rt.method(this.seen, "append", [x]);
      rt.frameLine(7);
      return rt.ops.gt(x, rt.V.int(2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  _add(acc: rt.Variant, x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_add");
    try {
      rt.frameLine(10);
      return rt.ops.add(acc, x);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(13);
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]));
      rt.frameLine(14);
      print(rt.showArgs([rt.method(a, "filter", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(14);
          return rt.ops.gt(x, rt.V.int(2));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(15);
      print(rt.showArgs([a]));
      rt.frameLine(16);
      print(rt.showArgs([rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(16);
          return rt.ops.mul(x, rt.V.int(2));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(17);
          return rt.ops.gt(x, rt.V.int(1));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "filter", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(18);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(19);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.method(a, "any", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(20);
          return rt.ops.gt(x, rt.V.int(3));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.method(a, "all", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(21);
          return rt.ops.gt(x, rt.V.int(0));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.method(a, "all", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(22);
          return rt.ops.gt(x, rt.V.int(1));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "any", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(23);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "all", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(24);
          return rt.V.bool(false);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(25);
          return rt.ops.gt(x, rt.V.int(2));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(26);
          return rt.ops.gt(x, rt.V.int(100));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "find_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(27);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(28);
          return rt.ops.gt(x, rt.V.int(2));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(29);
          return rt.ops.gt(x, rt.V.int(1));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1), rt.V.int(2)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(30);
          return rt.ops.gt(x, rt.V.int(1));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1), rt.V.int((-1))])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(31);
          return rt.ops.gt(x, rt.V.int(1));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1), rt.V.int(0)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.method(a, "rfind_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(32);
          return rt.ops.gt(x, rt.V.int(1));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1), rt.V.int((-9))])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(33);
          return rt.ops.add(acc, x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2), rt.V.int(0)])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(34);
          return rt.ops.add(acc, x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(35);
          return rt.ops.add(rt.ops.mul(acc, rt.V.int(10)), x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(5)])), "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(36);
          return rt.ops.add(acc, x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(37);
          return rt.ops.add(acc, x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2), rt.V.int(5)])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(38);
          return rt.ops.add(acc, x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const i = __a[1] as rt.Variant;
          rt.frameLine(40);
          return rt.V.int(1);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.method(a, "filter", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const i = __a[1] as rt.Variant;
          rt.frameLine(41);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.method(a, "any", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const i = __a[1] as rt.Variant;
          rt.frameLine(42);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.method(a, "all", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const i = __a[1] as rt.Variant;
          rt.frameLine(43);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.method(a, "find_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const i = __a[1] as rt.Variant;
          rt.frameLine(44);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          rt.frameLine(45);
          return acc;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1), rt.V.int(0)])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.method(a, "reduce", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const acc = __a[0] as rt.Variant;
          const x = __a[1] as rt.Variant;
          rt.frameLine(46);
          return rt.ops.add(acc, x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2), rt.V.int(100)])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.method(a, "filter", [rt.methodCallable(rt.V.object(this), "_pick")])]));
      rt.frameLine(49);
      print(rt.showArgs([this.seen]));
      rt.frameLine(50);
      rt.method(this.seen, "clear", []);
      rt.frameLine(51);
      print(rt.showArgs([rt.method(a, "any", [rt.methodCallable(rt.V.object(this), "_pick")])]));
      rt.frameLine(52);
      print(rt.showArgs([this.seen]));
      rt.frameLine(53);
      rt.method(this.seen, "clear", []);
      rt.frameLine(54);
      print(rt.showArgs([rt.method(a, "all", [rt.methodCallable(rt.V.object(this), "_pick")])]));
      rt.frameLine(55);
      print(rt.showArgs([this.seen]));
      rt.frameLine(56);
      rt.method(this.seen, "clear", []);
      rt.frameLine(57);
      print(rt.showArgs([rt.method(a, "reduce", [rt.methodCallable(rt.V.object(this), "_add"), rt.V.int(0)])]));
      rt.frameLine(58);
      print(rt.showArgs([rt.method(a, "map", [rt.methodCallable(rt.V.object(this), "_add")])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.method(a, "map", [rt.methodCallable(rt.V.object(this), "_pick")])]));
      rt.frameLine(60);
      print(rt.showArgs([this.seen]));
      rt.frameLine(62);
      let nest = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
      rt.frameLine(63);
      let kept = rt.method(nest, "filter", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(63);
          return rt.V.bool(true);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)]);
      rt.frameLine(64);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(kept, _w0), rt.V.int(0), rt.V.int(9));
        if (_nv !== null) rt.setIndex(kept, _w0, _nv);
      }
      rt.frameLine(65);
      print(rt.showArgs([nest]));
      rt.frameLine(66);
      let mapped = rt.method(nest, "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(66);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)]);
      rt.frameLine(67);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(mapped, _w0), rt.V.int(0), rt.V.int(8));
        if (_nv !== null) rt.setIndex(mapped, _w0, _nv);
      }
      rt.frameLine(68);
      print(rt.showArgs([nest]));
      rt.frameLine(69);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.int(1)])), "filter", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(69);
          return rt.ops.eq(x, rt.V.nil());
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(70);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "map", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(70);
          return rt.V.int(5);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1)])]));
      rt.frameLine(71);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(71);
          return rt.ops.gt(x, rt.V.int(2));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(72);
      print(rt.showArgs([rt.method(a, "filter", [f])]));
      rt.frameLine(73);
      print(rt.showArgs([rt.method(a, "map", [f])]));
      rt.frameLine(74);
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
      case "_pick": return rt.wrapValue(this._pick(args[0] as rt.Variant));
      case "_add": return rt.wrapValue(this._add(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["seen"], (o) => { const s = o as Main; return [s.seen]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["seen"], {}, (o) => { const s = o as Main; return [s.seen]; });
rt.registerMethodArities(__gd_d_Main, { "_pick": [1, 1], "_add": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
