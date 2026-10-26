/// <reference path="./gds2js-zstd.d.ts" />
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
