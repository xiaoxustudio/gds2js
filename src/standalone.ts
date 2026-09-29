import * as host from "./host";
import * as runtime from "./runtime/index";

/** 运行生命周期的入口：new Main().run() 由产物末尾调用；SceneTree 基类来自宿主。 */
export const SceneTree = host.SceneTree;
/** 宿主的全局 print（GDScript 语义：多参无分隔拼接）。 */
export const print = host.print;
/** 整个运行时命名空间，产物里以 `rt.*` 引用。 */
export const rt = runtime;
