// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  LIMIT = rt.V.int(3);
  static LIMIT = rt.V.int(3);

  g(name: rt.Variant, cond: rt.Variant): rt.Variant {
    name = rt.paramSlot(name, "String", 1, "g", this);
    cond = rt.paramSlot(cond, "bool", 2, "g", this);
    print(rt.showArgs([rt.ops.add(rt.V.str("guard:"), name)]));
    return cond;
  }
  
  pick(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "pick", this);
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("PICK "), label), rt.V.str(" ")), rt.strBuiltin([v]))]));
    do {
      const __m0 = rt.matchPattern(v, rt.patLit(rt.V.int(1)));
      if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("a"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.V.str("  hit a")]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
      if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("b"), rt.V.bool(false)))) {
        print(rt.showArgs([rt.V.str("  hit b-guarded")]));
        break;
      }
      const __m2 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("  hit b-plain")]));
        break;
      }
      const __m3 = rt.matchPattern(v, rt.patLit(rt.V.int(3)));
      if (__m3 !== null && rt.ops.truthy(this.g(rt.V.str("c"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.V.str("  hit c")]));
        break;
      }
      const __m4 = rt.matchPattern(v, rt.patWild());
      if (__m4 !== null) {
        print(rt.showArgs([rt.V.str("  hit wildcard")]));
        break;
      }
    } while (false);
    print(rt.showArgs([rt.ops.add(rt.V.str("  end "), label)]));
  }
  
  comma(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "comma", this);
    do {
      const __m0 = rt.matchPattern(v, rt.patLit(rt.V.int(1)));
      if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("comma"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" low"))]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
      if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("comma"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" low"))]));
        break;
      }
      const __m2 = rt.matchPattern(v, rt.patLit(rt.V.int(3)));
      if (__m2 !== null && rt.ops.truthy(this.g(rt.V.str("comma"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" low"))]));
        break;
      }
      const __m3 = rt.matchPattern(v, rt.patLit(rt.V.int(4)));
      if (__m3 !== null && rt.ops.truthy(this.g(rt.V.str("comma2"), rt.V.bool(false)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" mid"))]));
        break;
      }
      const __m4 = rt.matchPattern(v, rt.patLit(rt.V.int(5)));
      if (__m4 !== null && rt.ops.truthy(this.g(rt.V.str("comma2"), rt.V.bool(false)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" mid"))]));
        break;
      }
      const __m5 = rt.matchPattern(v, rt.patLit(rt.V.int(6)));
      if (__m5 !== null && rt.ops.truthy(this.g(rt.V.str("comma3"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" third"))]));
        break;
      }
      const __m6 = rt.matchPattern(v, rt.patLit(rt.V.int(7)));
      if (__m6 !== null && rt.ops.truthy(this.g(rt.V.str("comma3"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" third"))]));
        break;
      }
      const __m7 = rt.matchPattern(v, rt.patWild());
      if (__m7 !== null) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" rest"))]));
        break;
      }
    } while (false);
  }
  
  only_guards(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "only_guards", this);
    do {
      const __m0 = rt.matchPattern(v, rt.patLit(rt.V.int(1)));
      if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("o1"), rt.V.bool(false)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" one"))]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patLit(rt.V.int(2)));
      if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("o2"), rt.V.bool(false)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" two"))]));
        break;
      }
    } while (false);
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" fallen through"))]));
  }
  
  guard_and(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "guard_and", this);
    do {
      const __m0 = rt.matchPattern(v, rt.patWild());
      if (__m0 !== null && rt.ops.truthy(rt.and(this.g(rt.V.str("ga"), rt.V.bool(true)), () => this.g(rt.V.str("gb"), rt.V.bool(false))))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" both"))]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patWild());
      if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("gc"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" third"))]));
        break;
      }
    } while (false);
  }
  
  outer_locals(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "outer_locals", this);
    let lo = 2;
    do {
      const __m0 = rt.matchPattern(v, rt.patConst(rt.V.int(lo)));
      if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("ol1"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" matched-outer-var"))]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patConst(Main.LIMIT));
      if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("ol2"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" matched-const"))]));
        break;
      }
      const __m2 = rt.matchPattern(v, rt.patWild());
      if (__m2 !== null && rt.ops.truthy(rt.V.bool((lo === 2)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" guard-sees-outer"))]));
        break;
      }
    } while (false);
  }
  
  container_guards(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "container_guards", this);
    do {
      const __m0 = rt.matchPattern(v, rt.patArray([rt.patWild(), rt.patWild()]));
      if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("cg1"), rt.V.bool(false)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" pair-no"))]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patArray([rt.patWild(), rt.patWild()]));
      if (__m1 !== null && rt.ops.truthy(this.g(rt.V.str("cg2"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" pair-yes"))]));
        break;
      }
      const __m2 = rt.matchPattern(v, rt.patDict([[rt.V.str("k"), rt.patWild()]]));
      if (__m2 !== null && rt.ops.truthy(this.g(rt.V.str("cg3"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" dict"))]));
        break;
      }
      const __m3 = rt.matchPattern(v, rt.patWild());
      if (__m3 !== null) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" other"))]));
        break;
      }
    } while (false);
  }
  
  guard_sees_outer_bind(v: rt.Variant, label: rt.Variant): void {
    label = rt.paramSlot(label, "String", 2, "guard_sees_outer_bind", this);
    let part = 5;
    do {
      const __m0 = rt.matchPattern(v, rt.patConst(rt.V.int(part)));
      if (__m0 !== null && rt.ops.truthy(this.g(rt.V.str("osb"), rt.V.bool(true)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" outer-bind"))]));
        break;
      }
      const __m1 = rt.matchPattern(v, rt.patWild());
      if (__m1 !== null && rt.ops.truthy(rt.V.bool((part > 4)))) {
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.V.str("  "), label), rt.V.str(" outer-guard-uses-bind"))]));
        break;
      }
    } while (false);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.pick(rt.V.int(1), rt.V.str("v1"));
    this.pick(rt.V.int(2), rt.V.str("v2"));
    this.pick(rt.V.int(3), rt.V.str("v3"));
    this.pick(rt.V.int(9), rt.V.str("v9"));
    this.comma(rt.V.int(2), rt.V.str("cm2"));
    this.comma(rt.V.int(4), rt.V.str("cm4"));
    this.comma(rt.V.int(6), rt.V.str("cm6"));
    this.comma(rt.V.int(7), rt.V.str("cm7"));
    this.comma(rt.V.int(99), rt.V.str("cm99"));
    this.only_guards(rt.V.int(1), rt.V.str("og1"));
    this.only_guards(rt.V.int(2), rt.V.str("og2"));
    this.only_guards(rt.V.int(3), rt.V.str("og3"));
    this.guard_and(rt.V.int(0), rt.V.str("ga"));
    this.outer_locals(rt.V.int(2), rt.V.str("ol2"));
    this.outer_locals(rt.V.int(3), rt.V.str("ol3"));
    this.outer_locals(rt.V.int(8), rt.V.str("ol8"));
    this.container_guards(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("cg-list"));
    this.container_guards(rt.dictOf([[rt.V.str("k"), rt.V.int(1)]]), rt.V.str("cg-dict"));
    this.container_guards(rt.V.int(7), rt.V.str("cg-other"));
    this.guard_sees_outer_bind(rt.V.int(5), rt.V.str("osb5"));
    this.guard_sees_outer_bind(rt.V.int(6), rt.V.str("osb6"));
    this.quit();
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
rt.registerMethodArities(__gd_d_Main, { "g": [2, 2], "pick": [2, 2], "comma": [2, 2], "only_guards": [2, 2], "guard_and": [2, 2], "outer_locals": [2, 2], "container_guards": [2, 2], "guard_sees_outer_bind": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
