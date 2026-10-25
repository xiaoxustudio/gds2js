import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export function homeDirNamed(name: string, tag: string): string {
  const fromEnv = process.env.GDS2JS_HOME;
  return fromEnv === undefined || fromEnv === "" ? join(tmpdir(), `${name}-${tag}`) : fromEnv;
}

export function writeAsset(dest: string, data: Uint8Array | string): void {
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, data);
}
