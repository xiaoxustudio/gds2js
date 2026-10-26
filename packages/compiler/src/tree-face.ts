export const TREE_FACE = {
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
  tree: {
    runtimeDir: "runtime",
    host: "host.ts",
    sharedDouble: "shared/double.ts",
    zstdHost: "host-scriptc.ts",
    zstdDts: "gds2js-zstd.d.ts",
    zstdPackages: ["gds2js-zstd", "zstd-codec"],
  },
  home: {
    distDir: "dist",
    srcPrefix: "src",
    runtimeDir: "src/runtime",
    host: "src/host.ts",
    sharedDouble: "src/shared/double.ts",
  },
} as const;
