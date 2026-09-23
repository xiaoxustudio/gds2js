/**
 * 测试脚手架 —— 现在只是 `src/host.ts`（产品化宿主）的转发层。
 * 保留这个文件是为了让 corpus 的生成代码和 tools 里的脚本不用改 import。
 */
export { print, flush, captured, resetOut as reset, SceneTree } from "../../src/host";
