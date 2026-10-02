// 原包这里是 emscripten 的 wasm 绑定（742 KB）。scriptc 的岛（quickjs-ng）没有 WebAssembly，
// `module.js` 的环境探测永远走 asm.js 那条，这个桩永远不被调用 —— 留着只为让静态 require 能解析。
module.exports = function zstdCodecBindingWasmUnavailable() {
  throw new Error("zstd-codec: wasm 绑定在 scriptc 岛里不可用（岛没有 WebAssembly，应走 asm.js 绑定）");
};
