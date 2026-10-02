/** 构建期由 tools/cli-native.mjs 同名换实现（复制本文件为 bundle.ts）：exe 里没有打包器，single 照实响亮拒。 */
export async function bundlingAvailable(): Promise<boolean> {
  return false;
}

export async function bundleModule(entry: string, outDir: string): Promise<void> {
  throw new Error(`这个构建里没带打包器（${entry} → ${outDir}）`);
}
