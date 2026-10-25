
export async function bundlingAvailable(): Promise<boolean> {
  try {
    return typeof (await import("tsdown")).build === "function";
  } catch {
    return false;
  }
}

export async function bundleModule(entry: string, outDir: string, quiet = false): Promise<void> {
  const { build } = await import("tsdown");
  const opts: Record<string, unknown> = {
    entry,
    outDir,
    format: "esm",
    target: "node22",
    dts: false,
    clean: true,
    config: false,
    silent: true,
  };
  if (quiet) opts.logLevel = "silent";
  await build(opts as Parameters<typeof build>[0]);
}
