import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { selfFile, selfHome } from "@gds2js/compiler/home";

export const PRODUCT_RUNTIME_FILE = "product.mjs";

const cliDir = dirname(fileURLToPath(import.meta.url));

export function runtimeTsDir(): string | null {
  const home = selfHome();
  const cands = [
    process.env.GDS2JS_RUNTIME_SRC,
    join(cliDir, "..", "..", "runtime", "src", "runtime"),
    home === null ? null : join(home, "src", "runtime"),
  ];
  for (const c of cands) if (c !== undefined && c !== null && c !== "" && existsSync(join(c, "index.ts"))) return c;
  return null;
}

/** 打平的运行时（product.mjs）所在目录：自带家目录优先，其次从 npm 安装态解析。 */
export function runtimeDistDir(): string {
  const fromHome = selfFile("dist/runtime.mjs");
  if (fromHome) return dirname(fromHome);
  return dirname(createRequire(import.meta.url).resolve("gds2js/runtime"));
}

export function productRuntimePath(): string {
  const p = selfFile(`dist/${PRODUCT_RUNTIME_FILE}`) ?? join(runtimeDistDir(), PRODUCT_RUNTIME_FILE);
  if (!existsSync(p)) throw new Error(`没有 dist/${PRODUCT_RUNTIME_FILE}（先 pnpm build）：找的是 ${p}`);
  return p;
}

const EXE_TAIL = process.platform === "win32" ? ".exe" : "";

export function scriptcFromNpm(): string | null {
  try {
    let dir = dirname(createRequire(import.meta.url).resolve("scriptc"));
    for (let i = 0; i < 5; i++) {
      const cand = join(dir, "bin", "scriptc" + EXE_TAIL);
      if (existsSync(cand)) return cand;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
  }
  return null;
}

export function scriptcCandidates(): string[] {
  const out: string[] = [];
  const fromEnv = process.env.SCRIPTC_BIN;
  if (fromEnv !== undefined && fromEnv.trim() !== "") out.push(fromEnv.trim());
  out.push(join(cliDir, "scriptc", "scriptc" + EXE_TAIL));
  const pkg = scriptcFromNpm();
  if (pkg !== null) out.push(pkg);
  out.push("scriptc");
  return out;
}
