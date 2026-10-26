import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HOME_ASSETS, HOME_KEYS } from "./home-assets.gen";
import { fnv1a, homeDirNamed, writeAsset } from "./home-lib";

let home: string | null | undefined;

function tagOf(): string {
  let s = "";
  for (const k of HOME_KEYS) s += k + ":" + String((HOME_ASSETS[k] as string).length);
  return fnv1a(s);
}

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
