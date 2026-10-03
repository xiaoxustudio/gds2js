// node 宿主的补一针：`compress()` / `decompress()` 那一族要 node 的 zlib，而 runtime 只留三个槽
// （见 `packages/runtime/src/runtime/packed.ts` 的注释 —— 「把 unknown cast 成一张函数表」在静态编译目标上不可编）。
// 这一支**不进** `--pack scriptc` 的 import 图：静态产物没有 zlib，那三格本来就该响亮拒。
//
// 也不能静态 `import "node:zlib"` —— `single` 那支产物是把 runtime 整个内联进一个自包含 ESM，
// 静态 import 要么留下顶层 import（打包门的「零顶层 import」当场红），要么被改写成
// ESM 里的 `require("node:zlib")` 而 `ReferenceError`（两条都在 pkg-modes-check 里抓到过）。
// 所以走 `process.getBuiltinModule`：`process` 是全局、不产生任何 import，SEA 与内联产物 alike 都能用。
export * from "./host";
import { registerZipCodec } from "./runtime/packed";

type ZipFn = (b: Uint8Array) => Uint8Array;

function zlibTable(): Record<string, ZipFn | undefined> | null {
  const proc = (globalThis as { process?: { getBuiltinModule?: (id: string) => unknown } }).process;
  const get = proc?.getBuiltinModule;
  if (typeof get !== "function") return null;
  const hit = get.call(proc, "node:zlib") as Record<string, ZipFn | undefined> | undefined;
  return hit === undefined ? null : hit;
}

const table = zlibTable();
if (table !== null) {
  const pair = (packName: string, unpackName: string): { pack: ZipFn; unpack: ZipFn } | null => {
    const pack = table[packName];
    const unpack = table[unpackName];
    return pack === undefined || unpack === undefined ? null : { pack, unpack };
  };
  // 这版 node 没带 zstd 就是拿不到：那一格照旧响，不悄悄降级
  const deflate = pair("deflateSync", "inflateSync");
  if (deflate !== null) registerZipCodec(1, deflate);
  const zstd = pair("zstdCompressSync", "zstdDecompressSync");
  if (zstd !== null) registerZipCodec(2, zstd);
  const gzip = pair("gzipSync", "gunzipSync");
  if (gzip !== null) registerZipCodec(3, gzip);
}
