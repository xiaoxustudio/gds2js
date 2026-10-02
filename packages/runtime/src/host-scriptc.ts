/// <reference path="./gds2js-zstd.d.ts" />
// `--pack scriptc` 用到 compress()/decompress() 时铺的宿主：在静态宿主上把 runtime 的三组槽填满。
//   1 / 3（zlib deflate、gzip）：scriptc 内置的 node:zlib 静态降级（只收默认选项，正好对口）。
//   2（zstd）：`gds2js-zstd` 驱动 —— zstd-codec 的 emscripten asm.js 版在 --dynamic 岛里跑。
// 只给「真的调了 compress/decompress」的产物铺这份、并给 scriptc 加 --dynamic（见 cli.ts 的
// usesPackCodec IR 标志）—— 没用到压缩的产物继续是 1.6 MB 不带岛的形态。
// 这份会被**原样**铺进产物树（树根有 host.ts 与 runtime/），相对路径就按树根算；
// tools/scriptc-check.mjs 的替身树直接读这份、按 tree-face 清单改写相对说明符（没有同形副本）。
export * from "./host";
import { registerZipCodec } from "./runtime/packed";
import { deflateSync, inflateSync, gzipSync, gunzipSync } from "node:zlib";
import * as Zstd from "gds2js-zstd";

registerZipCodec(1, {
  pack: (b: Uint8Array): Uint8Array => deflateSync(b),
  unpack: (b: Uint8Array): Uint8Array => inflateSync(b),
});
registerZipCodec(3, {
  pack: (b: Uint8Array): Uint8Array => gzipSync(b),
  unpack: (b: Uint8Array): Uint8Array => gunzipSync(b),
});

function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 岛的 zstd 初始化在下一个 tick 才就绪，轮询等它 —— 不等的话首拍 compress(2) 会撞上响亮拒。
let waited = 0;
while (!Zstd.ready() && waited < 500) {
  await delay(10);
  waited++;
}
if (!Zstd.ready()) {
  throw new Error(`zstd 驱动没就绪（等了 ${waited} 拍）：${Zstd.initError()}`);
}
registerZipCodec(2, {
  pack: (b: Uint8Array): Uint8Array => Zstd.compress(b),
  unpack: (b: Uint8Array): Uint8Array => Zstd.decompress(b),
});
