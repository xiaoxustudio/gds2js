/** 构建期由 tools/cli-native.mjs 同名换实现（复制本文件为 home.ts）：原生 exe 的自带家目录 = 构建期嵌进来的文件表（home-assets.gen.ts）。
 * 契约与 SEA 那支一字不差：解出一个只读目录，给目录本身和目录里某个文件的落盘路径 —— selfHome()/selfFile() 的调用点一行不用改。 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HOME_ASSETS, HOME_KEYS } from "./home-assets.gen";
import { fnv1a, homeDirNamed, writeAsset } from "./home-lib";

let home: string | null | undefined;

/** 目录名只要求「内容换了它就换」（FNV-1a over 键长与内容长度），不是密码学用途。 */
function tagOf(): string {
  let s = "";
  for (const k of HOME_KEYS) s += k + ":" + String((HOME_ASSETS[k] as string).length);
  return fnv1a(s);
}

/** 解出来的家目录（进程内只算一次）。原生 exe 里恒不为 null（除非临时目录写不进去）。 */
export function selfHome(): string | null {
  if (home !== undefined) return home;
  const tag = tagOf();
  const dir = homeDirNamed("gds2js-home-native", tag);
  try {
    const ready = join(dir, ".ready");
    if (!existsSync(ready) || readText(ready) !== tag) {
      for (const k of HOME_KEYS) writeAsset(join(dir, k), HOME_ASSETS[k] as string);
      writeFileSync(ready, tag, "utf8");
    }
    home = dir;
  } catch (e) {
    console.error("gds2js: 解出 exe 自带的家目录失败：" + (e instanceof Error ? e.message : String(e)));
    console.error("  可以用 GDS2JS_HOME 指到一个可写的目录。");
    home = null;
  }
  return home;
}

function readText(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

export function selfFile(rel: string): string | null {
  const h = selfHome();
  if (!h) return null;
  const p = join(h, rel);
  return existsSync(p) ? p : null;
}
