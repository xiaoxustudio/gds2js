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
  const deflate = pair("deflateSync", "inflateSync");
  if (deflate !== null) registerZipCodec(1, deflate);
  const zstd = pair("zstdCompressSync", "zstdDecompressSync");
  if (zstd !== null) registerZipCodec(2, zstd);
  const gzip = pair("gzipSync", "gunzipSync");
  if (gzip !== null) registerZipCodec(3, gzip);
}
