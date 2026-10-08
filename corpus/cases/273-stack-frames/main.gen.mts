// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  deep(tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "deep");
    try {
      rt.frameLine(15);
      rt.gPrintStack();
      rt.frameLine(16);
      print(rt.showArgs([tag, rt.gGetStack()]));
      rt.frameLine(17);
      print(rt.showArgs([tag, rt.method(rt.gGetStack(), "size", [])]));
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  mid(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "mid");
    try {
      rt.frameLine(20);
      this.deep(rt.V.str("m|"));
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  lam(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "lam");
    try {
      rt.frameLine(23);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(23);
          rt.gPrintStack();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0);
      rt.frameLine(24);
      rt.method(f, "call", []);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  rec(n: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "rec");
    try {
      rt.frameLine(27);
      if (rt.ops.truthy(rt.ops.lte(n, rt.V.int(0)))) {
        rt.frameLine(28);
        rt.gPrintStack();
        rt.frameLine(29);
        return;
      }
      rt.frameLine(30);
      this.rec(rt.ops.sub(n, rt.V.int(1)));
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(33);
      this.mid();
      rt.frameLine(34);
      this.lam();
      rt.frameLine(35);
      this.rec(rt.V.int(1));
      rt.frameLine(36);
      rt.V.object(new Boot());
      rt.frameLine(37);
      let i = rt.V.object(new Inner());
      rt.frameLine(38);
      rt.method(i, "meth", []);
      rt.frameLine(39);
      rt.method(rt.V.object(__gd_d_Inner), "hi", []);
      rt.frameLine(40);
      rt.gPushWarning([rt.V.str("w1"), rt.V.str("w2"), rt.V.int(5)]);
      rt.frameLine(41);
      rt.gPushError([rt.V.str("boom")]);
      rt.frameLine(42);
      rt.gPushError([]);
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("z|done")]));
      rt.frameLine(44);
      this.quit();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "deep": return rt.wrapValue(this.deep(args[0] as rt.Variant));
      case "mid": return rt.wrapValue(this.mid());
      case "lam": return rt.wrapValue(this.lam());
      case "rec": return rt.wrapValue(this.rec(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "deep": [1, 1], "mid": [0, 0], "lam": [0, 0], "rec": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  meth(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "meth");
    try {
      rt.frameLine(5);
      rt.gPrintStack();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static hi(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "hi");
    try {
      rt.frameLine(8);
      rt.gPrintStack();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "meth": return rt.wrapValue(this.meth());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", [], {}, (o) => { const s = o as Inner; return []; });
rt.registerMethodArities(__gd_d_Inner, { "meth": [0, 0], "hi": [0, 0] });
rt.registerStaticMethods(__gd_d_Inner, ["hi"], {"hi": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.hi())});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

class Boot extends rt.GdScriptObject {
  constructor() {
    super();
    if (!rt.bareConstruction()) {
        const __gd_frame = rt.frameEnter("res://main.gd", "_init");
        try {
        rt.frameLine(12);
        rt.gPrintStack();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Boot = rt.defineClass(Boot, () => new Boot(), (o) => o instanceof Boot);
rt.nameClass(__gd_d_Boot, "Boot");
rt.registerDictIdentity(__gd_d_Boot, "res://main.gd", "Boot", [], {}, (o) => { const s = o as Boot; return []; });
rt.registerNativeBase(__gd_d_Boot, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
