/** 构建期由 tools/cli-native.mjs 同名换实现：原生 exe 不带打包器，--runtime-mode single 照实拒。 */

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
