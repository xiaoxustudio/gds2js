// 静态出货面的 `ir-cache.ts` 替换实现：岛里没有 `node:crypto`（出货面 builtin 清单只有 child_process/fs/module/os/path/url），
// 而缓存只是省时间、不影响正确性 —— 岛上直接透传给 lowering。
import type { Module } from "../lower/ir";

export async function cachedLower(_src: string, build: () => Promise<Module>): Promise<Module> {
  return build();
}
