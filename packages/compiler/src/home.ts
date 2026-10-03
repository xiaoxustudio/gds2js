/** 构建期由 tools/cli-native.mjs 同名换实现：原生 exe 的自带家目录是构建期嵌进二进制的文件，不是 SEA 资产。 */
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { inflateSync } from "node:zlib";

type SeaModule = { isSea(): boolean; getAssetKeys(): string[]; getRawAsset(key: string): Uint8Array | undefined };

let sea: SeaModule | null | undefined;

function seaApi(): SeaModule | null {
  if (sea !== undefined) return sea;
  try {
    sea = createRequire(import.meta.url)("node:sea") as SeaModule;
  } catch {
    sea = null;
  }
  return sea;
}

/** 解出来的家目录（进程内只算一次）。null = 这个构建没有自带家目录（npm 安装态就是 null）。 */
let home: string | null | undefined;

export function selfHome(): string | null {
  if (home !== undefined) return home;
  const api = seaApi();
  if (!api || !api.isSea()) return (home = null);
  try {
    home = ensureHome(api);
  } catch (e) {
    console.error(`gds2js: 解出自包含运行环境失败：${e instanceof Error ? e.message : String(e)}`);
    console.error("  可以用 GDS2JS_HOME 指到一个已解出的目录，或改用 npm 安装态跑。");
    home = null;
  }
  return home;
}

export function selfFile(rel: string): string | null {
  const h = selfHome();
  if (!h) return null;
  const p = join(h, rel);
  return existsSync(p) ? p : null;
}

function ensureHome(api: SeaModule): string {
  const keys = api.getAssetKeys().filter((k) => k.startsWith("gds2js-home/"));
  if (keys.length === 0) throw new Error("exe 里没有 gds2js-home/* 资产");
  const tag = `${process.versions.node}-${hash(keys.join("|"))}`;
  const dir = process.env.GDS2JS_HOME || join(tmpdir(), `gds2js-home-${tag}`);
  if (!existsSync(join(dir, ".ready"))) {
    const tmp = `${dir}.tmp-${process.pid}`;
    mkdirSync(tmp, { recursive: true });
    for (const key of keys) {
      const rel = key.slice("gds2js-home/".length);
      if (!rel || rel.includes("..")) throw new Error(`资产名不合法：${key}`);
      const bytes = api.getRawAsset(key);
      if (!bytes) throw new Error(`资产读不出来：${key}`);
      const dest = join(tmp, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, inflateSync(bytes));
    }
    writeFileSync(join(tmp, ".ready"), tag, "utf8");
    if (!existsSync(dir)) {
      try {
        renameSync(tmp, dir);
      } catch {
        if (!existsSync(join(dir, ".ready"))) throw new Error(`解包落位失败：${dir}`);
      }
    }
  }
  return dir;
}

/** FNV-1a：只要稳定、不要密码学强度。 */
function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
