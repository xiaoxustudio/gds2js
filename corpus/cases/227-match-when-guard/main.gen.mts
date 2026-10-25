// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare LIMIT: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(7);
      this.LIMIT = rt.V.int(3);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static LIMIT = rt.V.int(3);

  constructor() {
    super();
    this.__gd_fields__();
  }

  g(name: rt.Variant, cond: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "g");
    try {
      name = rt.paramSlot(name, "String", 1, "g", this);
      cond = rt.paramSlot(cond, "bool", 2, "g", this);
      rt.frameLine(4);
      print(rt.showArgs([rt.ops.add(rt.V.str("guard:"), name)]));
      rt.frameLine(5);
      return cond;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.bool(false);
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  pick(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "pick");
    try {
      label = rt.paramSlot(label, "String", 2, "pick", this);
      rt.frameLine(10);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("PICK "), label), rt.V.str(" ")), rt.strBuiltin([v]))]));
      rt.frameLine(11);
      do {
        const __m0 = rt.matchPattern(v, rt.patLit(rt.V.int(1)));
        if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("a"), rt.V.bool(true)))) {
          rt.frameLine(13);
          print(rt.showArgs([rt.V.str("  hit a")]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
        if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("b"), rt.V.bool(false)))) {
          rt.frameLine(15);
          print(rt.showArgs([rt.V.str("  hit b-guarded")]));
          break;
        }
        const __m2 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
        if (__m2 !== null) {
          rt.frameLine(17);
          print(rt.showArgs([rt.V.str("  hit b-plain")]));
          break;
        }
        const __m3 = rt.matchPattern(v, rt.patLit(rt.V.int(3)));
        if (__m3 !== null && rt.ops.truthy(this.g(rt.V.str("c"), rt.V.bool(true)))) {
          rt.frameLine(19);
          print(rt.showArgs([rt.V.str("  hit c")]));
          break;
        }
        const __m4 = rt.matchPattern(v, rt.patWild());
        if (__m4 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([rt.V.str("  hit wildcard")]));
          break;
        }
      } while (false);
      rt.frameLine(22);
      print(rt.showArgs([rt.ops.add(rt.V.str("  end "), label)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  comma(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "comma");
    try {
      label = rt.paramSlot(label, "String", 2, "comma", this);
      rt.frameLine(25);
      do {
        const __m0 = rt.matchPattern(v, rt.patLit(rt.V.int(1)));
        if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("comma"), rt.V.bool(true)))) {
          rt.frameLine(27);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" low"))]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
        if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("comma"), rt.V.bool(true)))) {
          rt.frameLine(27);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" low"))]));
          break;
        }
        const __m2 = rt.matchPattern(v, rt.patLit(rt.V.int(3)));
        if (__m2 !== null && rt.ops.truthy(this.g(rt.V.str("comma"), rt.V.bool(true)))) {
          rt.frameLine(27);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" low"))]));
          break;
        }
        const __m3 = rt.matchPattern(v, rt.patLit(rt.V.int(4)));
        if (__m3 !== null && rt.ops.truthy(this.g(rt.V.str("comma2"), rt.V.bool(false)))) {
          rt.frameLine(29);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" mid"))]));
          break;
        }
        const __m4 = rt.matchPattern(v, rt.patLit(rt.V.int(5)));
        if (__m4 !== null && rt.ops.truthy(this.g(rt.V.str("comma2"), rt.V.bool(false)))) {
          rt.frameLine(29);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" mid"))]));
          break;
        }
        const __m5 = rt.matchPattern(v, rt.patLit(rt.V.int(6)));
        if (__m5 !== null && rt.ops.truthy(this.g(rt.V.str("comma3"), rt.V.bool(true)))) {
          rt.frameLine(31);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" third"))]));
          break;
        }
        const __m6 = rt.matchPattern(v, rt.patLit(rt.V.int(7)));
        if (__m6 !== null && rt.ops.truthy(this.g(rt.V.str("comma3"), rt.V.bool(true)))) {
          rt.frameLine(31);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" third"))]));
          break;
        }
        const __m7 = rt.matchPattern(v, rt.patWild());
        if (__m7 !== null) {
          rt.frameLine(33);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" rest"))]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  only_guards(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "only_guards");
    try {
      label = rt.paramSlot(label, "String", 2, "only_guards", this);
      rt.frameLine(36);
      do {
        const __m0 = rt.matchPattern(v, rt.patLit(rt.V.int(1)));
        if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("o1"), rt.V.bool(false)))) {
          rt.frameLine(38);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" one"))]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
        if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("o2"), rt.V.bool(false)))) {
          rt.frameLine(40);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" two"))]));
          break;
        }
      } while (false);
      rt.frameLine(41);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" fallen through"))]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  guard_and(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "guard_and");
    try {
      label = rt.paramSlot(label, "String", 2, "guard_and", this);
      rt.frameLine(44);
      do {
        const __m0 = rt.matchPattern(v, rt.patWild());
        if (__m0 !== null && rt.ops.truthy(rt.and(this.g(rt.V.str("ga"), rt.V.bool(true)), () => this.g(rt.V.str("gb"), rt.V.bool(false))))) {
          rt.frameLine(46);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" both"))]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patWild());
        if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("gc"), rt.V.bool(true)))) {
          rt.frameLine(48);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" third"))]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  outer_locals(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "outer_locals");
    try {
      label = rt.paramSlot(label, "String", 2, "outer_locals", this);
      rt.frameLine(51);
      let lo = 2;
      rt.frameLine(52);
      do {
        const __m0 = rt.matchPattern(v, rt.patConst(rt.V.int(lo)));
        if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("ol1"), rt.V.bool(true)))) {
          rt.frameLine(54);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" matched-outer-var"))]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patConst(Main.LIMIT));
        if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("ol2"), rt.V.bool(true)))) {
          rt.frameLine(56);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" matched-const"))]));
          break;
        }
        const __m2 = rt.matchPattern(v, rt.patWild());
        if (__m2 !== null && rt.ops.truthy(rt.V.bool((lo === 2)))) {
          rt.frameLine(58);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" guard-sees-outer"))]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  container_guards(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "container_guards");
    try {
      label = rt.paramSlot(label, "String", 2, "container_guards", this);
      rt.frameLine(61);
      do {
        const __m0 = rt.matchPattern(v, rt.patArray([rt.patWild(), rt.patWild()]));
        if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("cg1"), rt.V.bool(false)))) {
          rt.frameLine(63);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" pair-no"))]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patArray([rt.patWild(), rt.patWild()]));
        if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("cg2"), rt.V.bool(true)))) {
          rt.frameLine(65);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" pair-yes"))]));
          break;
        }
        const __m2 = rt.matchPattern(v, rt.patDict([[rt.V.str("k"), rt.patWild()]]));
        if (__m2 !== null && rt.ops.truthy(this.g(rt.V.str("cg3"), rt.V.bool(true)))) {
          rt.frameLine(67);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" dict"))]));
          break;
        }
        const __m3 = rt.matchPattern(v, rt.patWild());
        if (__m3 !== null) {
          rt.frameLine(69);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" other"))]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  guard_sees_outer_bind(v: rt.Variant, label: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "guard_sees_outer_bind");
    try {
      label = rt.paramSlot(label, "String", 2, "guard_sees_outer_bind", this);
      rt.frameLine(72);
      let part = 5;
      rt.frameLine(73);
      do {
        const __m0 = rt.matchPattern(v, rt.patConst(rt.V.int(part)));
        if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("osb"), rt.V.bool(true)))) {
          rt.frameLine(75);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" outer-bind"))]));
          break;
        }
        const __m1 = rt.matchPattern(v, rt.patWild());
        if (__m1 !== null && rt.ops.truthy(rt.V.bool((part > 4)))) {
          rt.frameLine(77);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" outer-guard-uses-bind"))]));
          break;
        }
      } while (false);
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
      rt.frameLine(80);
      this.pick(rt.V.int(1), rt.V.str("v1"));
      rt.frameLine(81);
      this.pick(rt.V.int(2), rt.V.str("v2"));
      rt.frameLine(82);
      this.pick(rt.V.int(3), rt.V.str("v3"));
      rt.frameLine(83);
      this.pick(rt.V.int(9), rt.V.str("v9"));
      rt.frameLine(84);
      this.comma(rt.V.int(2), rt.V.str("cm2"));
      rt.frameLine(85);
      this.comma(rt.V.int(4), rt.V.str("cm4"));
      rt.frameLine(86);
      this.comma(rt.V.int(6), rt.V.str("cm6"));
      rt.frameLine(87);
      this.comma(rt.V.int(7), rt.V.str("cm7"));
      rt.frameLine(88);
      this.comma(rt.V.int(99), rt.V.str("cm99"));
      rt.frameLine(89);
      this.only_guards(rt.V.int(1), rt.V.str("og1"));
      rt.frameLine(90);
      this.only_guards(rt.V.int(2), rt.V.str("og2"));
      rt.frameLine(91);
      this.only_guards(rt.V.int(3), rt.V.str("og3"));
      rt.frameLine(92);
      this.guard_and(rt.V.int(0), rt.V.str("ga"));
      rt.frameLine(93);
      this.outer_locals(rt.V.int(2), rt.V.str("ol2"));
      rt.frameLine(94);
      this.outer_locals(rt.V.int(3), rt.V.str("ol3"));
      rt.frameLine(95);
      this.outer_locals(rt.V.int(8), rt.V.str("ol8"));
      rt.frameLine(96);
      this.container_guards(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("cg-list"));
      rt.frameLine(97);
      this.container_guards(rt.dictOf([[rt.V.str("k"), rt.V.int(1)]]), rt.V.str("cg-dict"));
      rt.frameLine(98);
      this.container_guards(rt.V.int(7), rt.V.str("cg-other"));
      rt.frameLine(99);
      this.guard_sees_outer_bind(rt.V.int(5), rt.V.str("osb5"));
      rt.frameLine(100);
      this.guard_sees_outer_bind(rt.V.int(6), rt.V.str("osb6"));
      rt.frameLine(101);
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
      case "g": return rt.wrapValue(this.g(args[0] as rt.Variant, args[1] as rt.Variant));
      case "pick": return rt.wrapValue(this.pick(args[0] as rt.Variant, args[1] as rt.Variant));
      case "comma": return rt.wrapValue(this.comma(args[0] as rt.Variant, args[1] as rt.Variant));
      case "only_guards": return rt.wrapValue(this.only_guards(args[0] as rt.Variant, args[1] as rt.Variant));
      case "guard_and": return rt.wrapValue(this.guard_and(args[0] as rt.Variant, args[1] as rt.Variant));
      case "outer_locals": return rt.wrapValue(this.outer_locals(args[0] as rt.Variant, args[1] as rt.Variant));
      case "container_guards": return rt.wrapValue(this.container_guards(args[0] as rt.Variant, args[1] as rt.Variant));
      case "guard_sees_outer_bind": return rt.wrapValue(this.guard_sees_outer_bind(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["LIMIT"], (o) => { const s = o as Main; return [s.LIMIT]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "g": [2, 2], "pick": [2, 2], "comma": [2, 2], "only_guards": [2, 2], "guard_and": [2, 2], "outer_locals": [2, 2], "container_guards": [2, 2], "guard_sees_outer_bind": [2, 2], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "g": ["String", "bool"], "pick": [, "String"], "comma": [, "String"], "only_guards": [, "String"], "guard_and": [, "String"], "outer_locals": [, "String"], "container_guards": [, "String"], "guard_sees_outer_bind": [, "String"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
