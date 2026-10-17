// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare mv: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.mv = rt.V.int(1);
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
      rt.frameLine(6);
      let q = 7;
      rt.frameLine(7);
      let f = (((q) => rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(7);
          return rt.V.int(q);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0)))(q);
      rt.frameLine(8);
      q = 9;
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("P1|"), rt.method(f, "call", []), rt.V.str(" "), rt.V.int(q)]));
      rt.frameLine(10);
      let twice = (((q) => rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(10);
          return rt.V.int(rt.fast.iMulC(q, 2));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0)))(q);
      rt.frameLine(11);
      q = 20;
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("P2|"), rt.method(twice, "call", [])]));
      rt.frameLine(13);
      let d = rt.dictOf([]);
      rt.frameLine(14);
      let mut = (((d) => rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(14);
          {
            const _nv = rt.writeIdx(d, rt.V.str("k"), rt.V.int(9));
            if (_nv !== null) d = _nv;
          }
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0)))(d);
      rt.frameLine(15);
      rt.method(mut, "call", []);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("P3|"), d]));
      rt.frameLine(17);
      let coll = rt.V.array(rt.GArray.of([]));
      rt.frameLine(18);
      for (let i of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])))) {
        rt.frameLine(19);
        rt.method(coll, "append", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(19);
          return i;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0)]);
      }
      rt.frameLine(20);
      let outs = rt.V.array(rt.GArray.of([]));
      rt.frameLine(21);
      for (let g of rt.iter(coll)) {
        rt.frameLine(22);
        rt.method(outs, "append", [rt.method(g, "call", [])]);
      }
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("P4|"), outs]));
      rt.frameLine(24);
      let outer = 5;
      rt.frameLine(25);
      let nest = (((outer) => rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(25);
          return rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(25);
          return rt.V.int(outer);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0)))(outer);
      rt.frameLine(26);
      outer = 6;
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("P5|"), rt.method(rt.method(nest, "call", []), "call", [])]));
      rt.frameLine(28);
      let mod = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(28);
          return this.mv;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0);
      rt.frameLine(29);
      this.mv = rt.V.int(2);
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("P6|"), rt.method(mod, "call", []), rt.V.str(" "), this.mv]));
      rt.frameLine(31);
      let deff = (((q) => rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.V.int(q);
          rt.frameLine(31);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1, 1)))(q);
      rt.frameLine(32);
      q = 30;
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("P7|"), rt.method(deff, "call", [])]));
      rt.frameLine(34);
      let selfl = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(34);
          return rt.typeOf(rt.V.object(this));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0);
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("P8|"), rt.method(selfl, "call", [])]));
      rt.frameLine(36);
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
rt.registerScriptProps(__gd_d_Main, ["mv"], (o) => { const s = o as Main; return [s.mv]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["mv"], {}, (o) => { const s = o as Main; return [s.mv]; });
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
