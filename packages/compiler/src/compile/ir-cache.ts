// IR 缓存的 node 侧实现（静态出货面走同名的 `ir-cache.native.ts` 透传 —— `node:crypto` 不在岛上的 builtin 清单里）。
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Module } from "../lower/ir";

/** 改了这些文件，缓存里的 IR 就一律作废 —— 开发期最常见的「编译器改了却读到旧 IR」由这里挡掉。 */
const STAMP_SOURCES = ["../lower/lower.ts", "../lower/ir.ts", "../lower/analyze.ts", "../lower/globals.ts", "../parse/parser.ts", "../parse/cst.ts", "../parse/wasm-cst.ts"];

/**
 * 编译器内容戳：决定缓存能不能复用。
 * 仓库里跑（未打包）时叠上 `STAMP_SOURCES` 的内容 —— 改了 lowering 立刻全线失效；
 * 打包成 dist/cli.mjs 后那些源码读不到，就哈希**自己所在这份 bundle 文件本身** ——
 * bundle 变了（含版本、含任何编译器改动）缓存自然换目录。
 */
function compilerStamp(): string {
  const h = createHash("sha256");
  try {
    h.update(readFileSync(fileURLToPath(import.meta.url)));
  } catch {
    h.update("unreadable-self");
  }
  for (const rel of STAMP_SOURCES) {
    try {
      h.update(rel);
      h.update(readFileSync(fileURLToPath(new URL(rel, import.meta.url))));
    } catch {
      // 打包后读不到单个源文件，bundle 内容已经覆盖它们
    }
  }
  return h.digest("hex").slice(0, 16);
}

let stamp = "";
function getStamp(): string {
  if (stamp === "") stamp = compilerStamp();
  return stamp;
}

function cacheDir(): string {
  const base = process.env.GDS2JS_IR_CACHE_DIR === undefined || process.env.GDS2JS_IR_CACHE_DIR === "" ? join(tmpdir(), "gds2js-ir") : process.env.GDS2JS_IR_CACHE_DIR;
  return join(base, getStamp());
}

function fileFor(key: string): string {
  return join(cacheDir(), key + ".json");
}

/** 源文本 + 编译器戳 → 内容地址（SHA-256 的前 32 位十六进制）。 */
function keyOf(src: string): string {
  return createHash("sha256").update(getStamp() + "\n" + src).digest("hex").slice(0, 32);
}

/** 只认结构对了的缓存：截断/半写/旧格式一律当没命中，绝不把坏 IR 交给发射器。 */
function looksLikeModule(v: unknown): v is Module {
  if (v === null || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return Array.isArray(m.topStmts) && Array.isArray(m.funcs) && Array.isArray(m.vars) && Array.isArray(m.signals) && Array.isArray(m.innerClasses);
}

let pruned = false;
/** 每个进程最多扫一次：目录堆到两万份以上时，丢掉一个月没碰过的，缓存不许无限长。 */
function prune(dir: string): void {
  if (pruned) return;
  pruned = true;
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  if (names.length < 20000) return;
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  for (const n of names) {
    const p = join(dir, n);
    try {
      if (statSync(p).mtimeMs < cutoff) rmSync(p);
    } catch {
      // 单个文件动不了就跳过
    }
  }
}

/** lowering 的缓存位：命中直接给 IR，没命中算完再存回去。读写失败一律降级成「不缓存」，不许拖垮编译。 */
export async function cachedLower(src: string, build: () => Promise<Module>): Promise<Module> {
  if (process.env.GDS2JS_IR_CACHE === "0") return build();
  const file = fileFor(keyOf(src));
  try {
    if (existsSync(file)) {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as unknown;
      if (looksLikeModule(parsed)) return parsed;
    }
  } catch {
    // 坏缓存当没命中
  }
  const module = await build();
  try {
    mkdirSync(cacheDir(), { recursive: true });
    prune(cacheDir());
    writeFileSync(file, JSON.stringify(module), "utf8");
  } catch {
    // 缓存目录不可写（只读盘、沙箱）：照样出正确的 IR，只是每次重算
  }
  return module;
}
