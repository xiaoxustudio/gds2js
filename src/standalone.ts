/**
 * 单文件/本地模式用的"自带运行时"总入口。
 *
 * 编译产物正常形态是 `import "gds2js/runtime"` + `import "gds2js/host"`，靠包解析。
 * 但打成自包含 .mjs（single）或旁挂一份（local）时，产物不能依赖 node_modules，
 * 于是把「运行时 + 宿主」打成一个包，产物只需拿到 `rt` 命名空间和 `print`/`SceneTree`。
 *
 * 三个导出对应 emitter standalone 头部解构的名字（见 emit 端 runtimeMode）。
 */
import * as host from "./host";
import * as runtime from "./runtime/index";

/** 运行生命周期的入口：new Main().run() 由产物末尾调用；SceneTree 基类来自宿主。 */
export const SceneTree = host.SceneTree;
/** 宿主的全局 print（GDScript 语义：多参无分隔拼接）。 */
export const print = host.print;
/** 整个运行时命名空间，产物里以 `rt.*` 引用。 */
export const rt = runtime;
