// 放 setupFiles 而不是每个 test 文件里：它是往 runtime 的 packed 槽里注册 zlib，
// 只有 compress/decompress 那几格真的要用（见 packages/runtime/src/runtime/packed.ts）。
import "@gds2js/runtime/host-node";
