/**
 * 「树面」= runtime 源码要落成的两种形态，一纸清单同时管住四个消费者：
 *   1. packages/gds2js/src/cli/export-ts-tree.ts —— `--pack scriptc` 的产物树（exportTsTree / exportTsProjectTree / copyZstdHost）
 *   2. tools/scriptc-check.mjs    —— 替身树（tmp/sc-gate/<id>/）对宿主源码相对路径的改写
 *   3. tools/cli-native.mjs       —— 原生 exe 内嵌家目录（HOME）的资产键
 *   4. 盘面本身：packages/runtime/src —— repo.* 指到的文件必须存在
 *
 * 不变量（tools/tree-face-check.ts 对账）：
 *   - tree.* 与 repo.* 同名同构 —— 产物树按源码原位铺，产物的 import 不用改；
 *   - home.* = home.srcPrefix + "/" + repo.* —— 家目录里那棵假树就是同一份布局带前缀。
 */
export const TREE_FACE = {
  /** 仓库侧源位置：以下相对名都以 repo.runtimeSrcRoot 为底。 */
  repo: {
    runtimeSrcRoot: "packages/runtime/src",
    runtimeDir: "runtime",
    runtimeIndex: "index.ts",
    host: "host.ts",
    sharedDouble: "shared/double.ts",
    zstdHost: "host-scriptc.ts",
    zstdDts: "gds2js-zstd.d.ts",
    vendorDir: "vendor",
  },
  /** `--pack scriptc` 产物树里的相对布局（相对产物根）。 */
  tree: {
    runtimeDir: "runtime",
    host: "host.ts",
    sharedDouble: "shared/double.ts",
    zstdHost: "host-scriptc.ts",
    zstdDts: "gds2js-zstd.d.ts",
    zstdPackages: ["gds2js-zstd", "zstd-codec"],
  },
  /** 原生 exe 内嵌家目录（HOME）的键布局（相对解出目录）。 */
  home: {
    distDir: "dist",
    srcPrefix: "src",
    runtimeDir: "src/runtime",
    host: "src/host.ts",
    sharedDouble: "src/shared/double.ts",
  },
} as const;
