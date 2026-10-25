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

  pick(x: rt.Variant, y: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "pick");
    try {
      rt.frameLine(4);
      if (rt.ops.truthy(rt.ops.gt(x, y))) {
        rt.frameLine(5);
        return x;
      }
      rt.frameLine(6);
      return y;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(9);
      let a = 0;
      rt.frameLine(10);
      let b = 1;
      rt.frameLine(11);
      let i = 0;
      rt.frameLine(12);
      while ((i < 12)) {
        rt.frameLine(13);
        let t = rt.fast.iModC(rt.fast.iAddC(a, b), 100);
        rt.frameLine(14);
        a = b;
        rt.frameLine(15);
        b = t;
        rt.frameLine(16);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(17);
      print(rt.showArgs([rt.V.int(a)]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.int(b)]));
      rt.frameLine(20);
      let p = rt.V.int(0);
      rt.frameLine(21);
      let q = rt.V.int(0);
      rt.frameLine(22);
      let j = 0;
      rt.frameLine(23);
      while ((j < 6)) {
        rt.frameLine(24);
        p = q;
        rt.frameLine(25);
        q = this.pick(q, rt.V.int(j));
        rt.frameLine(26);
        j = rt.fast.iAddC(j, 1);
      }
      rt.frameLine(27);
      print(rt.showArgs([p]));
      rt.frameLine(28);
      print(rt.showArgs([q]));
      rt.frameLine(30);
      let x = 1.5;
      rt.frameLine(31);
      let y = 2.5;
      rt.frameLine(32);
      let r = 0;
      rt.frameLine(33);
      while ((r < 5)) {
        rt.frameLine(34);
        let z = ((x * 0.5) + y);
        rt.frameLine(35);
        x = y;
        rt.frameLine(36);
        y = z;
        rt.frameLine(37);
        r = rt.fast.iAddC(r, 1);
      }
      rt.frameLine(38);
      print(rt.showArgs([rt.V.float(x)]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.float(y)]));
      rt.frameLine(41);
      let g = 0;
      rt.frameLine(42);
      let h = rt.V.float(1);
      rt.frameLine(43);
      let w = 0;
      rt.frameLine(44);
      while ((w < 4)) {
        rt.frameLine(45);
        g = w;
        rt.frameLine(46);
        h = rt.ops.mul(rt.V.int(g), rt.V.float(1.5));
        rt.frameLine(47);
        w = rt.fast.iAddC(w, 1);
      }
      rt.frameLine(48);
      print(rt.showArgs([rt.V.int(g)]));
      rt.frameLine(49);
      print(rt.showArgs([h]));
      rt.frameLine(51);
      let c = 0;
      rt.frameLine(52);
      if ((g > 1)) {
        rt.frameLine(53);
        let u = c;
        rt.frameLine(54);
        c = rt.fast.iAddC(u, 3);
      } else {
        rt.frameLine(56);
        let u2 = "no";
        rt.frameLine(57);
        c = rt.fast.iAddC(c, 1);
      }
      rt.frameLine(58);
      print(rt.showArgs([rt.V.int(c)]));
      rt.frameLine(59);
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
      case "pick": return rt.wrapValue(this.pick(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "pick": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
