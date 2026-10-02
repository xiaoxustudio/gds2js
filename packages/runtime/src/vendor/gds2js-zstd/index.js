// zstd 驱动（岛侧运行）：初始化 zstd-codec 并把 `Simple` 编解码器兜出来。
// 初始化是异步的（emscripten 的 onRuntimeInitialized 下一个 tick 才响），宿主那边轮询
// `ready()`；`initError()` 交失败原因的字符串（含栈），别让初始化失败变成静默的没就绪。
import "./shim.js";
import { ZstdCodec } from "zstd-codec";

let simple = null;
let err = null;
try {
  ZstdCodec.run((zstd) => {
    simple = new zstd.Simple();
  });
} catch (e) {
  err = e;
}

export function ready() {
  return simple !== null;
}

export function initError() {
  if (err === null) return "";
  const e = err;
  return String(e && e.stack ? e.stack : e).slice(0, 600);
}

export function compress(b) {
  if (simple === null) throw new Error("gds2js-zstd: not ready");
  return simple.compress(b);
}

export function decompress(b) {
  if (simple === null) throw new Error("gds2js-zstd: not ready");
  return simple.decompress(b);
}
