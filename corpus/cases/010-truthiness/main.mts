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
    print(ops.truthy(V.array(new GArray())));
    print(ops.truthy(V.dict(new GDict())));
    print(ops.truthy(V.int(0)));
    print(ops.truthy(V.float(0)));
    print(ops.truthy(V.str("")));
    print(ops.truthy(V.array(GArray.of([V.int(0)]))));
    print(ops.truthy(V.str("0")));
    if (ops.truthy(V.array(new GArray()))) {
      print("empty-array-true");
    } else {
      print("empty-array-false");
    }
    this.quit();
  }
}

await new Main().run();
