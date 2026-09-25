// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.method(rt.V.str("ß"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ß"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ﬀ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ﬀ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ﬁ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ﬁ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ﬓ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ﬓ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("İ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("İ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ı"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ı"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ǳ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ǳ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ǅ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ǅ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ŉ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ŉ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ΐ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ΐ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("և"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("և"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ᾼ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ᾼ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ᾋ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ᾋ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ẖ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ẖ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("꟎"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("꟎"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("꟏"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("꟏"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("𖺠"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("𖺠"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("𖺻"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("𖺻"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("Ⅎ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("Ⅎ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("Ȿ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("Ȿ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("中"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("中"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("😀"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("😀"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("Straße"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("Straße"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ﬁǳ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ﬁǳ"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("İstanbul"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("İstanbul"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("中Aß"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("中Aß"), "to_lower", [])));
    print(rt.show(rt.method(rt.V.str("ǅǆǇǈ"), "to_upper", [])));
    print(rt.show(rt.method(rt.V.str("ǅǆǇǈ"), "to_lower", [])));
    this.quit();
  }
  
}

await new Main().run();
