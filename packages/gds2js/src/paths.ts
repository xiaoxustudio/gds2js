/** CLI 侧的路径候选链只在这里维护 —— 每条注明服务的场景；命令层从这取，不再各写一份。 */
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { selfFile, selfHome } from "@gds2js/compiler/home";

/** export 用的自带运行时文件名（由 `tsdown.product.config.ts` 打成零 import 的单文件）。 */
export const PRODUCT_RUNTIME_FILE = "product.mjs";

/** 与 CLI 同目录（打包后 `import.meta.url` 仍指 CLI 本体所在目录），「随包分发」的候选都按它算。 */
const cliDir = dirname(fileURLToPath(import.meta.url));

/** runtime 与宿主的 **TS 源码**位置：静态产物编的是源码图，不是打平的 product.mjs。每跳服务的场景：
 *  - `GDS2JS_RUNTIME_SRC`：显式覆盖（测试/嵌入方指路）；
 *  - `../../runtime/src/runtime`：仓库里 `packages/gds2js/{src,dist}` 两种出发点都命中；
 *  - 家目录 `src/runtime`：SEA / 原生 exe 的自带家目录（原来那条「迁移期 `../packages/...`」与「同目录 `runtime/`」在 monorepo 布局下不再命中，已删）。
 */
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

/** scriptc 二进制的文件名尾巴。 */
const EXE_TAIL = process.platform === "win32" ? ".exe" : "";

/** npm 依赖里那份 scriptc 的可执行文件：从解析到的包入口往上找几层，认 `bin/scriptc(.exe)` 那个形状。 */
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
    // 没装成依赖，正常
  }
  return null;
}

/** 查找顺序：`SCRIPTC_BIN` → 与 CLI 同目录的 `scriptc/`（随包分发）→ npm 依赖里那份 → PATH 上的 `scriptc`。 */
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
