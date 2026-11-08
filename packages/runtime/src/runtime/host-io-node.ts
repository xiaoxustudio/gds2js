import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, renameSync, rmdirSync, statSync, statfsSync, symlinkSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registerHostIo, type HostIo } from "./host-io";

function ok(fn: () => void): boolean {
  try {
    fn();
    return true;
  } catch {
    return false;
  }
}

function mkdirCode(fn: () => void): number {
  try {
    fn();
    return 0;
  } catch (e) {
    return (e as { code?: string }).code === "EEXIST" ? 32 : 1;
  }
}

/** 4.6.3 实测的那几格错误码：0 成、1 干不成、7 没这东西、12 路径不合法、32 已经有了。 */
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
  makeDir: (p) => mkdirCode(() => mkdirSync(p)),
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
  stat: (p) => {
    try {
      const st = statSync(p);
      return { mtime: Math.floor(st.mtimeMs / 1000), atime: Math.floor(st.atimeMs / 1000) };
    } catch {
      return null;
    }
  },
  hiddenAttr: (p) => {
    if (process.platform !== "win32") return p.split("/").pop()?.startsWith(".") === true;
    const r = spawnSync("attrib", [p], { encoding: "utf8" });
    if (r.status !== 0 || r.stdout === null) return null;
    return r.stdout.trim().split(/\s{4,}/)[0]!.includes("H");
  },
  setHiddenAttr: (p, hidden) => (spawnSync("attrib", [hidden ? "+H" : "-H", p]).status === 0 ? 0 : 1),
  readOnlyAttr: (p) => {
    try {
      const mode = statSync(p).mode;
      return (mode & 0o200) === 0;
    } catch {
      return null;
    }
  },
  setReadOnlyAttr: (p, ro) => (ok(() => chmodSync(p, ro ? 0o444 : 0o666)) ? 0 : 1),
  unixPermissions: (p) => {
    if (process.platform === "win32") return 0;
    try {
      return statSync(p).mode & 0o777;
    } catch {
      return 0;
    }
  },
  setUnixPermissions: (p, permissions) => {
    if (process.platform === "win32") return 2;
    return ok(() => chmodSync(p, permissions)) ? 0 : 1;
  },
  xattrs: (p) => {
    if (process.platform !== "win32") {
      const r = spawnSync("getfattr", ["--absolute-names", "--only-values", "--dump", p], { encoding: "utf8" });
      if (r.status !== 0 || r.stdout === null) return [];
      return [...r.stdout.matchAll(/^\s+user\.([^=]+)=/gm)].map((m) => "user." + (m[1] as string));
    }
    const r = spawnSync("powershell", ["-NoProfile", "-Command", `(Get-Item -LiteralPath '${p.replace(/'/g, "''")}' -Stream *).Stream`], { encoding: "utf8" });
    if (r.status !== 0 || r.stdout === null) return [];
    return r.stdout.split(/\r?\n/).map((x) => x.trim()).filter((x) => x !== "" && x !== ":$DATA");
  },
  getXattr: (p, name) => {
    try {
      return new Uint8Array(readFileSync(process.platform === "win32" ? `${p}:${name}` : p));
    } catch {
      return null;
    }
  },
  setXattr: (p, name, data) => (ok(() => writeFileSync(process.platform === "win32" ? `${p}:${name}` : p, data)) ? 0 : 1),
  removeXattr: (p, name) => (ok(() => unlinkSync(process.platform === "win32" ? `${p}:${name}` : p)) ? 0 : 1),
  createLink: (source, target) => (ok(() => symlinkSync(source, target)) ? 0 : 1),
  readLink: (p) => {
    try {
      return readlinkSync(p);
    } catch {
      return null;
    }
  },
  isLink: (p) => {
    try {
      return lstatSync(p).isSymbolicLink();
    } catch {
      return false;
    }
  },
  equivalent: (a, b) => {
    try {
      return realpathSync(a) === realpathSync(b);
    } catch {
      return false;
    }
  },
  caseSensitive: () => process.platform !== "win32" && process.platform !== "darwin",
  filesystemType: (p) => {
    if (process.platform !== "win32") return "";
    const r = spawnSync("powershell", ["-NoProfile", "-Command", `(Get-Volume -DriveLetter '${p.charAt(0)}').FileSystem`], { encoding: "utf8" });
    return r.status === 0 && r.stdout !== null ? r.stdout.trim() : "";
  },
  spaceLeft: (p) => {
    try {
      const st = statfsSync(p);
      return Number(st.bavail) * Number(st.bsize);
    } catch {
      return 0;
    }
  },
  drives: () => {
    if (process.platform !== "win32") return ["/"];
    const r = spawnSync("powershell", ["-NoProfile", "-Command", "(Get-PSDrive -PSProvider FileSystem).Name"], { encoding: "utf8" });
    return r.status === 0 && r.stdout !== null ? r.stdout.split(/\r?\n/).map((x) => x.trim()).filter((x) => x !== "") : [];
  },
  createTempFile: (prefix, extension) => {
    try {
      const dir = mkdtempSync(join(tmpdir(), prefix));
      const file = join(dir, prefix + extension);
      writeFileSync(file, "");
      return file;
    } catch {
      return null;
    }
  },
  makeTempDir: (prefix) => {
    try {
      return mkdtempSync(join(tmpdir(), prefix));
    } catch {
      return null;
    }
  },
};

registerHostIo(nodeHostIo);
