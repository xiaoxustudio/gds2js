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
    print(show(ops.inOp(V.int(2), V.array(GArray.of([V.int(1), V.int(2)])))));
    print(show(ops.inOp(V.str("e"), V.str("hello"))));
    const d = new GDict();
    d.set(V.str("k"), V.int(1));
    print(show(ops.inOp(V.str("k"), V.dict(d))));
    print(show(ops.inOp(V.int(9), V.array(GArray.of([V.int(1), V.int(2)])))));
    this.quit();
  }
}

await new Main().run();
