import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { registerHostIo, type HostIo } from "./host-io";

function ok(fn: () => void): boolean {
  try {
    fn();
    return true;
  } catch {
    return false;
  }
}

/** 4.6.3 实测的那几格错误码：0 成、1 干不成、7 没这东西、12 路径不合法。 */
export const nodeHostIo: HostIo = {
  exists: (p) => {
    try {
      return existsSync(p);
    } catch {
      return false;
    }
  },
  isDir: (p) => {
    try {
      return statSync(p).isDirectory();
    } catch {
      return false;
    }
  },
  read: (p) => {
    try {
      return new Uint8Array(readFileSync(p));
    } catch {
      return null;
    }
  },
  write: (p, bytes) => ok(() => writeFileSync(p, bytes)),
  size: (p) => {
    try {
      return statSync(p).size;
    } catch {
      return 0;
    }
  },
  makeDir: (p) => (ok(() => mkdirSync(p)) ? 0 : 1),
  remove: (p) =>
    ok(() => {
      if (statSync(p).isDirectory()) rmdirSync(p);
      else unlinkSync(p);
    })
      ? 0
      : 1,
  rename: (from, to) => (ok(() => renameSync(from, to)) ? 0 : 1),
  copy: (from, to) => (ok(() => copyFileSync(from, to)) ? 0 : 7),
  list: (p) => {
    try {
      return readdirSync(p);
    } catch {
      return [];
    }
  },
};

registerHostIo(nodeHostIo);
