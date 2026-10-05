/**
 * 外部依赖探测：给 E2E 各支门的 `it.skipIf(...)` / `describe.skipIf(...)` 提供判据。
 * 口径是「缺什么就 skip 并说出缺什么」，红只剩一个意思：真的坏了。
 *
 * 便宜的探测（existsSync）做成常量；要起子进程的（node 版本号）做成惰性函数，
 * 免得 corpus-diff 这种用不到 SEA 的门也白付一次 spawn。
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { delimiter, join } from "node:path";
import { GODOT_BIN, ROOT } from "./lib-bridge";

export const isWindows = process.platform === "win32";

/** Windows 上可执行文件的后缀按 PATHEXT 试；别的平台就试裸名。 */
const EXTS: string[] = isWindows
  ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter((e) => e !== "")
  : [""];

/** 在 PATH 上找一个可执行文件；找不到返回 null。不 spawn，所以很便宜。 */
export function which(cmd: string): string | null {
  const path = process.env.PATH ?? process.env.Path ?? "";
  for (const dir of path.split(delimiter)) {
    if (dir === "") continue;
    for (const ext of EXTS) {
      const p = join(dir, `${cmd}${ext.toLowerCase()}`);
      if (existsSync(p)) return p;
      if (ext !== "") {
        const p2 = join(dir, `${cmd}${ext}`);
        if (existsSync(p2)) return p2;
      }
    }
  }
  return null;
}

/** 裁判引擎。lib.mjs 的默认值是硬编码的 F:/godot/…，所以必须探存在性 ——
 *  今天 golden.mjs 不探，缺了会静默毒化整个语料。 */
export const hasGodot = existsSync(GODOT_BIN);

/** scriptc：scriptc 出货门与 cli-native 门的编译器。 */
export const hasScriptc = which("scriptc") !== null;

/** zig：cli-native.mjs 用它编 native/gds_ts.c（ZIG_CC 可覆盖）。 */
export const hasZig = which(process.env.ZIG_CC ?? "zig") !== null;

/** libtree-sitter 源码树（TS_SRC 可覆盖）：cli-native.mjs 要把 lib.c 编进去。 */
export const TS_SRC = process.env.TS_SRC ?? join(ROOT, "tmp", "libtree-sitter");
export const hasTsSrc = existsSync(join(TS_SRC, "lib", "src", "lib.c"));

/** 出货产物：export / pkg-modes / cli-native / bench-scriptc 都吃 dist，不吃 tsx 源码。 */
export const hasDist = existsSync(join(ROOT, "packages", "gds2js", "dist", "cli.mjs"));
export const hasStandalone = existsSync(join(ROOT, "packages", "gds2js", "dist", "standalone.cjs"));

/** `--pack node` 的 SEA 门槛。 */
export const SEA_MIN_NODE = "25.7.0";

function nodeVer(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", timeout: 60_000, windowsHide: true });
  const v = (r.stdout || "").trim();
  return r.status === 0 && /^\d+\.\d+\.\d+/.test(v) ? v : null;
}

/** 逐段比版本号，够新才要。 */
export function atLeast(ver: string, min: string): boolean {
  const a = ver.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const b = min.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return true;
}

/**
 * 能用来打 SEA 产物的那个 node：GDS2JS_NODE_BIN 优先，其次自己。都不够新就 null。
 * 惰性 —— 要起子进程问版本号，只有 export / cli-native 那几格真的需要。
 */
export function seaCapableNode(): string | null {
  const envBin = process.env.GDS2JS_NODE_BIN;
  if (envBin !== undefined && envBin !== "" && atLeast(nodeVer(envBin) ?? "0", SEA_MIN_NODE)) return envBin;
  const selfV = nodeVer(process.execPath) ?? "0.0.0";
  return atLeast(selfV, SEA_MIN_NODE) ? process.execPath : null;
}

/** 缺料时统一的一句话，让 skip 的原因在输出里可读。 */
export function missing(...what: string[]): string {
  return `no-lib：缺 ${what.join("、")}`;
}
