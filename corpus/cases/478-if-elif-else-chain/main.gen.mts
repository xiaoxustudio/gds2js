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
      this.flat(rt.V.int(0));
      rt.frameLine(5);
      this.flat(rt.V.int(1));
      rt.frameLine(6);
      this.flat(rt.V.int(2));
      rt.frameLine(7);
      this.flat(rt.V.int(3));
      rt.frameLine(8);
      this.flat(rt.V.int(4));
      rt.frameLine(9);
      this.dangling(rt.V.int(0));
      rt.frameLine(10);
      this.dangling(rt.V.int(1));
      rt.frameLine(11);
      this.dangling(rt.V.int(2));
      rt.frameLine(12);
      this.dangling(rt.V.int(3));
      rt.frameLine(13);
      this.deep(rt.V.int(0));
      rt.frameLine(14);
      this.deep(rt.V.int(1));
      rt.frameLine(15);
      this.deep(rt.V.int(2));
      rt.frameLine(16);
      this.deep(rt.V.int(3));
      rt.frameLine(17);
      this.tail_if(rt.V.int(0));
      rt.frameLine(18);
      this.tail_if(rt.V.int(1));
      rt.frameLine(19);
      this.tail_if(rt.V.int(2));
      rt.frameLine(20);
      this.tail_if(rt.V.int(3));
      rt.frameLine(21);
      this.in_loop(rt.V.int(0));
      rt.frameLine(22);
      this.in_loop(rt.V.int(1));
      rt.frameLine(23);
      this.in_loop(rt.V.int(2));
      rt.frameLine(24);
      this.in_loop(rt.V.int(3));
      rt.frameLine(25);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  flat(x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "flat");
    try {
      rt.frameLine(29);
      if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(1)))) {
        rt.frameLine(30);
        print(rt.showArgs([rt.V.str("f|"), rt.V.str("a")]));
      } else if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(2)))) {
        rt.frameLine(32);
        print(rt.showArgs([rt.V.str("f|"), rt.V.str("b")]));
      } else if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(3)))) {
        rt.frameLine(34);
        print(rt.showArgs([rt.V.str("f|"), rt.V.str("c")]));
      } else {
        rt.frameLine(36);
        print(rt.showArgs([rt.V.str("f|"), rt.V.str("z")]));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  dangling(x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "dangling");
    try {
      rt.frameLine(40);
      if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(1)))) {
        rt.frameLine(41);
        if (rt.ops.truthy(rt.ops.gt(x, rt.V.int(0)))) {
          rt.frameLine(42);
          print(rt.showArgs([rt.V.str("d|"), rt.V.str("inner-then")]));
        } else {
          rt.frameLine(44);
          print(rt.showArgs([rt.V.str("d|"), rt.V.str("inner-else")]));
        }
      } else {
        rt.frameLine(46);
        print(rt.showArgs([rt.V.str("d|"), rt.V.str("outer-else")]));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  deep(x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "deep");
    try {
      rt.frameLine(50);
      if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(1)))) {
        rt.frameLine(51);
        print(rt.showArgs([rt.V.str("p|"), rt.V.str("a")]));
      } else if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(2)))) {
        rt.frameLine(53);
        if (rt.ops.truthy(rt.ops.gt(x, rt.V.int(0)))) {
          rt.frameLine(54);
          print(rt.showArgs([rt.V.str("p|"), rt.V.str("b-inner")]));
        } else {
          rt.frameLine(56);
          print(rt.showArgs([rt.V.str("p|"), rt.V.str("b-inner-else")]));
        }
      } else {
        rt.frameLine(58);
        print(rt.showArgs([rt.V.str("p|"), rt.V.str("z")]));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tail_if(x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "tail_if");
    try {
      rt.frameLine(63);
      if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(1)))) {
        rt.frameLine(64);
        print(rt.showArgs([rt.V.str("t|"), rt.V.str("a")]));
      } else if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(2)))) {
        rt.frameLine(66);
        if (rt.ops.truthy(rt.ops.gt(x, rt.V.int(1)))) {
          rt.frameLine(67);
          print(rt.showArgs([rt.V.str("t|"), rt.V.str("b-inner")]));
        }
      } else {
        rt.frameLine(69);
        print(rt.showArgs([rt.V.str("t|"), rt.V.str("z")]));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  in_loop(x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "in_loop");
    try {
      rt.frameLine(73);
      for (let n of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))) {
        rt.frameLine(74);
        if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(1)))) {
          rt.frameLine(75);
          print(rt.showArgs([rt.V.str("l|"), n, rt.V.str("|"), rt.V.str("a")]));
        } else if (rt.ops.truthy(rt.ops.eq(x, rt.V.int(2)))) {
          rt.frameLine(77);
          if (rt.ops.truthy(rt.ops.gt(n, rt.V.int(1)))) {
            rt.frameLine(78);
            print(rt.showArgs([rt.V.str("l|"), n, rt.V.str("|"), rt.V.str("b-inner")]));
          }
        } else {
          rt.frameLine(80);
          print(rt.showArgs([rt.V.str("l|"), n, rt.V.str("|"), rt.V.str("z")]));
        }
      }
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
      case "flat": return rt.wrapValue(this.flat(args[0] as rt.Variant));
      case "dangling": return rt.wrapValue(this.dangling(args[0] as rt.Variant));
      case "deep": return rt.wrapValue(this.deep(args[0] as rt.Variant));
      case "tail_if": return rt.wrapValue(this.tail_if(args[0] as rt.Variant));
      case "in_loop": return rt.wrapValue(this.in_loop(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "flat": [1, 1], "dangling": [1, 1], "deep": [1, 1], "tail_if": [1, 1], "in_loop": [1, 1] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
