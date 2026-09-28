/**
 * 自包含 exe（Node SEA）里的「家」。
 *
 * 为什么要它：CLI 打进 exe 之后，还有四样东西按**真实文件**找 —— `gdscript.wasm`、
 * `dist/runtime.mjs`/`host.mjs`/`standalone.cjs`、rolldown 那颗 20MB 的原生绑定（Node 文档
 * 写明 `process.dlopen` 只认真实文件，VFS 也救不了它）、以及拿来做 SEA 的 node.exe。
 * 与其在 exe 里重建一套模块解析，不如**首次运行把这几样解到临时目录**，让所有老代码路径原样工作。
 *
 * 关键前提：**非 SEA 一律返回 null**，调用方保持现有逻辑 —— 所以源码态 / npm 安装态 / 全部
 * 测试链路行为零变化（这条是硬要求：语料产物字节不许动）。
 */
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/** SEA 里 `process.execPath` 是 exe 自己，所以家目录只能从「解出来的那一份」拿。 */
type SeaModule = { isSea(): boolean; getAssetKeys(): string[]; getRawAsset(key: string): Uint8Array | undefined };

let sea: SeaModule | null | undefined;

function seaApi(): SeaModule | null {
  if (sea !== undefined) return sea;
  try {
    // node:sea 要 Node ≥20.12；取不到就当不在 SEA 里（源码态 / 老 node 都走这条）
    sea = createRequire(import.meta.url)("node:sea") as SeaModule;
  } catch {
    sea = null;
  }
  return sea;
}

/** 解出来的家目录（进程内只算一次）。null = 不在 SEA 里。 */
let home: string | null | undefined;

export function seaHome(): string | null {
  if (home !== undefined) return home;
  const api = seaApi();
  if (!api || !api.isSea()) return (home = null);
  try {
    home = ensureHome(api);
  } catch (e) {
    // 解不出来（TEMP 只读 / 磁盘满 / 资产缺失）绝不能退回「猜个路径」——那是静默错的开始
    console.error(`gds2js: 解出自包含运行环境失败：${e instanceof Error ? e.message : String(e)}`);
    console.error("  可以用 GDS2JS_HOME 指到一个已解出的目录，或改用 npm 安装态跑。");
    home = null;
  }
  return home;
}

/** 家目录里的一个文件（相对路径用 `/` 分隔，与打进 assets 时的 key 一致）。 */
export function seaFile(rel: string): string | null {
  const h = seaHome();
  if (!h) return null;
  const p = join(h, rel);
  return existsSync(p) ? p : null;
}

/** exe 内嵌的那份 node（用户批准「把 node 塞进去」：`--build-sea` 需要真实的 node 二进制）。 */
export function seaNodeExe(): string | null {
  return seaFile("node/node.exe") ?? seaFile("node/node");
}

function ensureHome(api: SeaModule): string {
  const keys = api.getAssetKeys().filter((k) => k.startsWith("gds2js-home/"));
  if (keys.length === 0) throw new Error("exe 里没有 gds2js-home/* 资产");
  // 版本标签进目录名：换 exe 就换目录，旧版残留不会串台（也不去删别人的）
  const tag = `${process.versions.node}-${hash(keys.join("|"))}`;
  const dir = process.env.GDS2JS_HOME || join(tmpdir(), `gds2js-home-${tag}`);
  if (existsSync(join(dir, ".ready"))) return dir;
  const tmp = `${dir}.tmp-${process.pid}`;
  mkdirSync(tmp, { recursive: true });
  for (const key of keys) {
    const rel = key.slice("gds2js-home/".length);
    if (!rel || rel.includes("..")) throw new Error(`资产名不合法：${key}`);
    const bytes = api.getRawAsset(key);
    if (!bytes) throw new Error(`资产读不出来：${key}`);
    const dest = join(tmp, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, bytes);
  }
  writeFileSync(join(tmp, ".ready"), tag, "utf8");
  if (!existsSync(dir)) {
    try {
      renameSync(tmp, dir);
    } catch {
      if (!existsSync(join(dir, ".ready"))) throw new Error(`解包落位失败：${dir}`);
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
