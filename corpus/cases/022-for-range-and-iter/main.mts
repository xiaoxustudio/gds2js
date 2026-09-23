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
    const acc = new GArray();
    for (const i of range(3).raw()) acc.append(i);
    print(show(V.array(acc)));
    const d = new GDict();
    d.set(V.str("a"), V.int(1));
    d.set(V.str("b"), V.int(2));
    const ks = new GArray();
    for (const k of d.keys()) ks.append(k);
    print(show(V.array(ks)));
    const vs = new GArray();
    for (const x of GArray.of([V.int(10), V.int(20)]).raw()) vs.append(x);
    print(show(V.array(vs)));
    this.quit();
  }
}

await new Main().run();
