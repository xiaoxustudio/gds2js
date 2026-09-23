import { ops, strOps } from "../../../src/runtime/ops";
import { range } from "../../../src/runtime/builtins";
import { V } from "../../../src/runtime/tags";
import { GArray, GDict, show } from "../../../src/runtime/values";
import { SceneTree, print } from "../../../tools/harness/scene-tree";

/**
 * 手写等价物 —— emitter 落地后由编译产物取代。
 * 存在的意义：在还没有 emitter 的时候就把运行时算子接到差分测试台上，
 * 让 ops 的正确性由 Godot 的 golden 来判定，而不是由我来判定。
 */
class Main extends SceneTree {
  override async _initialize(): Promise<void> {
    const a = GArray.of([V.int(1), V.int(2)]);
    const b = a;
    b.append(V.int(3));
    print(show(V.array(a)));
    print(show(V.array(b)));
    print(show(ops.eq(V.array(a), V.array(b))));
    const c = a.duplicate();
    c.append(V.int(9));
    print(show(V.array(a)));
    this.quit();
  }
}

await new Main().run();
