// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.formatOf(rt.V.str("%d"), rt.V.int(42))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%d"), rt.V.float(3.7))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%d"), rt.V.float((-3.7)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%d"), rt.V.int((-42)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%f"), rt.V.float(3.5))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%f"), rt.V.int(3))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%.2f"), rt.V.float(3.14159))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%.2f"), rt.V.float((-3.14159)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%.0f"), rt.V.float(2.5))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%.0f"), rt.V.float(3.5))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%.1f"), rt.V.float(2.25))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%.3d"), rt.V.int(42))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%x"), rt.V.int(255))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%X"), rt.V.int(255))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%o"), rt.V.int(8))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%x"), rt.V.int((-1)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%o"), rt.V.int((-1)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%x"), rt.V.int(0))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%c"), rt.V.int(65))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%c"), rt.V.int(128512))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%s"), rt.V.int(42))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%s"), rt.V.float(1.5))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%s"), rt.V.str("txt"))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("50%% of %d"), rt.V.int(7))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("[%5d]"), rt.V.int(42))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("[%-5d]"), rt.V.int(42))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%05d"), rt.V.int((-42)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("[%8s]"), rt.V.str("ab"))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("[%-8s]"), rt.V.str("ab"))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%06x"), rt.V.int(255))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%08.2f"), rt.V.float(3.14159))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%+d"), rt.V.int(42))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%+d"), rt.V.int((-42)))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%+f"), rt.V.float(3.5))]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%s-%d-%f"), rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.int(2), rt.V.float(3.5)])))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
