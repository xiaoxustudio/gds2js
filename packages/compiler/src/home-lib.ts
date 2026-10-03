/** 两个自带家目录实现（SEA 的 home.ts / 原生内嵌的 home.native.ts）共用的纯件。 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/** FNV-1a：只要稳定、不要密码学强度。 */
export function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** 家目录落位：GDS2JS_HOME 覆盖，否则 tmp 下按内容指纹命名。 */
export function homeDirNamed(name: string, tag: string): string {
  const fromEnv = process.env.GDS2JS_HOME;
  return fromEnv === undefined || fromEnv === "" ? join(tmpdir(), `${name}-${tag}`) : fromEnv;
}

/** 落一份资产（自动建目录）。 */
export function writeAsset(dest: string, data: Uint8Array | string): void {
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, data);
}
