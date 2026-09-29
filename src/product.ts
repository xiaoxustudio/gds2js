/**
 * 「自带运行时」的 ESM 单文件总入口 —— 给 `export` 两支用。
 *
 * 与 `src/standalone.ts`（CJS、给 local/single 模式）的差别在形状不在内容：
 * 这份保持产物的两条 import 形状（`import * as rt` 与具名的 `print`/`SceneTree`），
 * 并且**零相对 import** —— 打出来的 `dist/product.mjs` 自己就是全部。
 *
 * 为什么要单文件：实测把 dist 那套带 chunk 的运行时（runtime/host + 3 个内容哈希 chunk）
 * 交给 perry，它能收 5 个原生模块也出货，但跑起来 `rt.V` 是 `undefined`（跨 chunk 的别名
 * 重导出丢了一根绑定）；同一份代码打平成 1 个文件后与 golden 逐字节一致。
 * Node 那一支走 SEA 的 `useVfs`，模块树本来就能多文件，用这份只是省得再分片。
 *
 * 两条 star 导出不能有重名（ESM 里歧义名会被静默剔掉）：runtime 的 194 个导出与 host 的
 * `SceneTree/captured/flush/print/resetOut` 实测无交集，构建时若哪天撞上会直接报错。
 */
export * from "./runtime/index";
export * from "./host";
