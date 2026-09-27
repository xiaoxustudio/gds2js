// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = 9007199254740994;
    print(rt.show(rt.V.str("f1 ")), rt.show(rt.toInt(rt.V.float(a))), rt.show(rt.V.str(" | ")), rt.show(rt.V.float(a)));
    let b = 9007199254740994;
    print(rt.show(rt.V.str("f2 ")), rt.show(rt.toInt(rt.V.float(b))));
    let c = 0.12345678901234568;
    print(rt.show(rt.V.str("f3 ")), rt.show(rt.toInt(rt.V.float((c * 100000000000000000)))), rt.show(rt.V.str(" | ")), rt.show(rt.V.float(c)));
    let d = 1.2345678901e-7;
    print(rt.show(rt.V.str("f4 ")), rt.show(rt.toInt(rt.V.float((d * 1e+25)))), rt.show(rt.V.str(" | ")), rt.show(rt.V.float(d)));
    let e = 1;
    print(rt.show(rt.V.str("f5 ")), rt.show(rt.toInt(rt.V.float((e * 1000000000000000000)))));
    let f = 100000000000000000;
    print(rt.show(rt.V.str("f6 ")), rt.show(rt.toInt(rt.V.float(f))));
    let g = 1234567890123456800;
    print(rt.show(rt.V.str("f7 ")), rt.show(rt.toInt(rt.V.float(g))));
    let h = 1;
    print(rt.show(rt.V.str("f8 ")), rt.show(rt.V.float(h)), rt.show(rt.V.str(" | ")), rt.show(rt.toInt(rt.V.float(h))));
    print(rt.show(rt.V.str("f9 ")), rt.show(rt.toInt(rt.V.float((1e-23 * 1e+30)))), rt.show(rt.V.str(" | ")), rt.show(rt.V.float((1e-23 * 1e+30))));
    print(rt.show(rt.V.str("f10 ")), rt.show(rt.V.bool((a === 9007199254740994))), rt.show(rt.V.str(" | ")), rt.show(rt.V.bool((a > 9007199254740992))), rt.show(rt.V.str(" | ")), rt.show(rt.V.bool((d < 1.2345678901e-7))));
    let i = 1000000.25;
    print(rt.show(rt.V.str("f11 ")), rt.show(rt.toInt(rt.V.float(i))), rt.show(rt.V.str(" | ")), rt.show(rt.V.float(i)));
    let j = rt.V.float((-9007199254740994));
    print(rt.show(rt.V.str("f12 ")), rt.show(rt.toInt(j)));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
