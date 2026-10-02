// 岛侧兼容垫片（必须在 zstd-codec 之前执行）。三处都是 quickjs-ng 环境与 emscripten
// 的浏览器/Node 假设对不上的地方，逐条实测过：
//   1) 岛的 TextDecoder 只支持 utf-8，emscripten 顶层要 `new TextDecoder("utf-16le")` ——
//      包成包装类：utf-8 走原生，utf-16le 用手工解码。
//   2) 岛暴露了部分 `process`，emscripten 会误判成 Node 环境，走到 `NODEFS.staticInit()`
//      里的 `process.binding("constants")`（岛没有）当场 "not a function" —— 换成不满足
//      Node 判定的最小对象，让它走 SHELL 分支。
//   3) SHELL 分支会摸 quickjs-shell 的内建全局 —— 补桩（read/readbuffer 只在真要读文件时
//      才会被调用，这条路径不读文件）。
const Orig = globalThis.TextDecoder;
if (typeof Orig === "function") {
  globalThis.TextDecoder = class TextDecoder {
    constructor(label) {
      const l = String(label === undefined ? "utf-8" : label).toLowerCase();
      this._le = l === "utf-16le" || l === "utf16le";
      this._d = this._le ? null : new Orig(label);
    }
    decode(bytes) {
      if (!this._le) return this._d.decode(bytes);
      if (bytes === undefined || bytes === null) return "";
      let s = "";
      for (let i = 0; i + 1 < bytes.length; i += 2) s += String.fromCharCode((bytes[i] | (bytes[i + 1] << 8)) & 0xffff);
      return s;
    }
  };
}

try {
  globalThis.process = { versions: {} };
} catch (e) {}

if (typeof globalThis.scriptArgs === "undefined") globalThis.scriptArgs = [];
if (typeof globalThis.print === "undefined") globalThis.print = function () {};
if (typeof globalThis.printErr === "undefined") globalThis.printErr = function () {};
if (typeof globalThis.read === "undefined") globalThis.read = function (f) { throw new Error("gds2js-zstd: read(" + f + ") unavailable"); };
if (typeof globalThis.readbuffer === "undefined") globalThis.readbuffer = function (f) { throw new Error("gds2js-zstd: readbuffer(" + f + ") unavailable"); };
if (typeof globalThis.readline === "undefined") globalThis.readline = function () { return null; };
if (typeof globalThis.quit === "undefined") globalThis.quit = function () {};
