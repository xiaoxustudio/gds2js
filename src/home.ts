/**
 * 自包含 exe（Node SEA）里的「家」。
 *
 * 为什么要它：CLI 打进 exe 之后，还有几样东西按**真实文件**找 —— `gdscript.wasm` 与
 * web-tree-sitter 自己那颗运行时 wasm（内联后它按 `import.meta.url` 找，在 exe 里就是 exe 同目录）、
 * `dist/product.mjs` / `standalone.cjs`、以及内嵌的 perry 工具链（perry.exe 要旁边的 LLVM-C.dll，
 * 实测缺它连 `--version` 都是 `0xC0000135`；运行时是 zst 且 perry 不会自己解）。
 * 与其在 exe 里重建一套模块解析，不如**首次运行把这几样解到临时目录**，让所有老代码路径原样工作。
 *
 * home 里**没有 node**：实测 SEA exe 不吃 node 旗标（`x.exe -p …` 把旗标当 argv 交给内嵌 main），
 * 所以塞一份 node 进去只为让 exe 里能再跑 `--build-sea`，代价是 34 MB 压缩资产。用户决定改成
 * node 走外部（`--node` / `GDS2JS_NODE_BIN` / PATH），exe 里内嵌的是 perry。
 * 也**没有 bundler**：exe 里跑 rolldown 站不住（内联代码的懒 require 找不到包），所以 export
 * 两支都改成不需要它 —— 见 `src/cli.ts` 的 `exportTree`。
 *
 * 关键前提：**非 SEA 一律返回 null**，调用方保持现有逻辑 —— 所以源码态 / npm 安装态 / 全部
 * 测试链路行为零变化（这条是硬要求：语料产物字节不许动）。
 */
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { inflateSync } from "node:zlib";

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

/**
 * exe 内嵌的那份 perry。目录形状**照 npm 包铺**（`perry/bin/perry.exe` + `perry/bin/LLVM-C.dll`
 * + `perry/lib/*.zst`），这样 Windows 的 DLL 搜索（先看 exe 同目录）和 `src/perry.ts` 里
 * 「从 bin 往上两级找 lib」那套逻辑在解出来的家目录里原样成立，不用写第二套。
 */
export function seaPerryExe(): string | null {
  return seaFile("perry/bin/perry.exe");
}

function ensureHome(api: SeaModule): string {
  const keys = api.getAssetKeys().filter((k) => k.startsWith("gds2js-home/"));
  if (keys.length === 0) throw new Error("exe 里没有 gds2js-home/* 资产");
  // 版本标签进目录名：换 exe 就换目录，旧版残留不会串台（也不去删别人的）
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
      // `--build-sea` 的 assets 是原样入包的（实测 20 MB 资产就让 exe +20 MB），
      // 所以打包那边（tools/self-pack.ts）统一先 deflate 再塞；这里逐个解回来。
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
