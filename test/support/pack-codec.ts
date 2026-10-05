/**
 * 「产物文本里有没有 PackedByteArray 的 compress()/decompress()」这条文本口径
 * （发射器形状是 `rt.method(x, "compress", …)`）。与 IR 上的 `usesPackCodec` 标志是
 * **两条独立判据**，逐用例必须一致 —— 互锁断言在 packages/compiler/test/emit-invariants.test.ts。
 * 共享的只有这个正则本身，两边判据仍互相独立，所以互锁有牙。
 */
export const NEED_ZSTD_TEXT = /,\s*"(?:compress|decompress)"\s*,/;

/** 产物带 autoRun 尾巴：顶层自己 new 了入口实例。这样的产物必须自兜底，
 *  因为直接跑它时外面没有 CLI 那层 try/catch。 */
export const ENTRY_TAIL = /const __gd_entry = new \w+\(\);/;
export const FALLBACK_TAIL = /rt\.reportRunFailure\(/;
