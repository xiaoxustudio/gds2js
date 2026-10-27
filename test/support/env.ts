import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { delimiter, join } from "node:path";
import { GODOT_BIN, ROOT } from "./lib-bridge";

export const isWindows = process.platform === "win32";

const EXTS: string[] = isWindows
  ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter((e) => e !== "")
  : [""];

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

export const hasGodot = existsSync(GODOT_BIN);

export const hasScriptc = which("scriptc") !== null;

export const hasDist = existsSync(join(ROOT, "packages", "gds2js", "dist", "cli.mjs"));
export const hasStandalone = existsSync(join(ROOT, "packages", "gds2js", "dist", "standalone.cjs"));

export const SEA_MIN_NODE = "25.7.0";

function nodeVer(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", timeout: 60_000, windowsHide: true });
  const v = (r.stdout || "").trim();
  return r.status === 0 && /^\d+\.\d+\.\d+/.test(v) ? v : null;
}

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
