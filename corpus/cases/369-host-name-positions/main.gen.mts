// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare host: rt.Variant;
  declare typed: rt.Variant;
  declare who: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.host = rt.methodCallable(rt.V.object(this), "quit");
      rt.frameLine(5);
      this.typed = rt.methodCallable(rt.V.object(this), "create_timer");
      rt.frameLine(6);
      this.who = rt.V.object(this);
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

  take(x: rt.Variant = rt.methodCallable(rt.V.object(this), "quit")): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "take");
    try {
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("形参默认值 → "), rt.typeOf(x), rt.V.str(" | "), rt.method(x, "get_method", [])]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  takeSelf(x: rt.Variant = rt.V.object(this)): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "takeSelf");
    try {
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("形参默认值 self → "), rt.typeOf(x)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("模块 var → "), rt.typeOf(this.host), rt.V.str(" | "), rt.method(this.host, "get_method", []), rt.V.str(" | 有效 "), rt.method(this.host, "is_valid", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("带型模块 var → "), rt.typeOf(this.typed), rt.V.str(" | "), rt.method(this.typed, "get_method", [])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("模块 self → "), rt.typeOf(this.who)]));
      rt.frameLine(18);
      this.take();
      rt.frameLine(19);
      this.takeSelf();
      rt.frameLine(20);
      let lam = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(21);
          return rt.typeOf(this.host);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0);
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("lambda 体里的宿主名 → "), rt.method(lam, "call", [])]));
      rt.frameLine(23);
      for (let quit of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))) {
        rt.frameLine(24);
        print(rt.showArgs([rt.V.str("同名遮蔽 → "), rt.typeOf(quit), rt.V.str(" | "), quit]));
        rt.frameLine(25);
        break;
      }
      rt.frameLine(26);
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
      case "take": return rt.wrapValue(this.take(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "takeSelf": return rt.wrapValue(this.takeSelf(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["host","typed","who"], (o) => { const s = o as Main; return [s.host, s.typed, s.who]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["host","typed","who"], {}, (o) => { const s = o as Main; return [s.host, s.typed, s.who]; });
rt.registerMethodArities(__gd_d_Main, { "take": [0, 1], "takeSelf": [0, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
