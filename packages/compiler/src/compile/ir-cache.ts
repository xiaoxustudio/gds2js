import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Module } from "../lower/ir";

const STAMP_SOURCES = ["../lower/lower.ts", "../lower/ir.ts", "../analyze/index.ts", "../lower/globals.ts", "../parse/parser.ts", "../parse/cst.ts", "../parse/wasm-cst.ts"];

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

function looksLikeModule(v: unknown): v is Module {
  if (v === null || typeof v !== "object") return false;
  const m = v as Record<string, unknown>;
  return Array.isArray(m.topStmts) && Array.isArray(m.funcs) && Array.isArray(m.vars) && Array.isArray(m.signals) && Array.isArray(m.innerClasses);
}

let pruned = false;
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
    }
  }
}

export async function cachedLower(src: string, build: () => Promise<Module>): Promise<Module> {
  if (process.env.GDS2JS_IR_CACHE === "0") return build();
  const file = fileFor(keyOf(src));
  try {
    if (existsSync(file)) {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as unknown;
      if (looksLikeModule(parsed)) return parsed;
    }
  } catch {
  }
  const module = await build();
  try {
    mkdirSync(cacheDir(), { recursive: true });
    prune(cacheDir());
    writeFileSync(file, JSON.stringify(module), "utf8");
  } catch {
  }
  return module;
}
