/**
 * `--runtime-mode single` 的内联打包 seam（#14）。
 *
 * 为什么要 seam：tsdown 是 npm 包，`await import("tsdown")` 在静态目标上落在嵌入式动态引擎里
 * （SC2012/SC2013，S227 量的第一份围栏清单里就有它），不带 `--dynamic` 编不过。
 * 原生构建由 `tools/cli-native.mjs` 生成同名文件，那一支 `bundlingAvailable()` 报 false，
 * `single` 就照「这个构建没带打包器」响亮拒 —— 而不是让整条 CLI 卡在编译期。
 */

/** 这个构建里有没有可用的打包器（node 侧看 tsdown 装没装，原生侧恒 false）。 */
export async function bundlingAvailable(): Promise<boolean> {
  try {
    return typeof (await import("tsdown")).build === "function";
  } catch {
    return false;
  }
}

/** 把 `entry` 连同它的 import 图压成 outDir 下的一个文件（调用方先确认 `bundlingAvailable()`）。 */
export async function bundleModule(entry: string, outDir: string): Promise<void> {
  const { build } = await import("tsdown");
  await build({
    entry,
    outDir,
    format: "esm",
    target: "node22",
    dts: false,
    clean: true,
    config: false,
    silent: true,
  } as Parameters<typeof build>[0]);
}
