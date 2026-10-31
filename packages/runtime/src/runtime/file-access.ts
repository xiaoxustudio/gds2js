import { hostIo, hostIoMissing, resolveIoPath } from "./host-io";
import { UnsupportedError } from "./errors";
import { NULL_OBJECT } from "./class/identity/null-object";
import { GdScriptObject } from "./class/object/script-object";
import { GBytes } from "./class/bytes/packed";
import { Tag, V, normInt, type Variant } from "./tags";
import { gBytesToVar, gBytesToVarWithObjects, gVarToBytes, gVarToBytesWithObjects } from "./var-bytes";

const ERR_OK = 0;
const ERR_FAILED = 1;
const ERR_NOT_FOUND = 7;
const ERR_BAD_PATH = 12;
const ERR_CORRUPT = 18;
const ERR_DOES_NOT_EXIST = 31;

export const FA_READ = 1;
export const FA_WRITE = 2;

export class GdFile extends GdScriptObject {
  __gd_engine_class__ = "FileAccess";
  given = "";
  abs = "";
  mode = FA_READ;
  opened = false;
  bytes: number[] = [];
  pos = 0;
  err = ERR_OK;
}

export class GdDir extends GdScriptObject {
  __gd_engine_class__ = "DirAccess";
  given = "";
  abs = "";
  names: string[] = [];
  cursor = 0;
  entryIsDir = false;
}

let lastFileOpenError = ERR_OK;
let lastDirOpenError = ERR_OK;

export function faLastOpenError(): number {
  return lastFileOpenError;
}

export function daLastOpenError(): number {
  return lastDirOpenError;
}

export function nullObject(): Variant {
  return V.object(NULL_OBJECT);
}

function io() {
  const table = hostIo();
  if (table === null) hostIoMissing();
  return table;
}

function parentOf(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i <= 0 ? "" : p.slice(0, i);
}

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder("utf-8");

function textBytes(s: string): number[] {
  return Array.from(ENCODER.encode(s));
}

function bytesText(bs: number[]): string {
  return DECODER.decode(Uint8Array.from(bs));
}

function viewOf(bs: number[]): DataView {
  const buf = new ArrayBuffer(bs.length);
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < bs.length; i++) u8[i] = (bs[i] as number) & 0xff;
  return new DataView(buf);
}

export function faOpen(path: string, mode: number): Variant {
  if (mode !== FA_READ && mode !== FA_WRITE) {
    throw new UnsupportedError("fa-mode", `FileAccess.open() 只量过 READ(1) 与 WRITE(2) 两种模式（收到 ${String(mode)}）：READ_WRITE / WRITE_READ 的读写交错没实测`);
  }
  if (path === "") {
    lastFileOpenError = ERR_BAD_PATH;
    return nullObject();
  }
  const abs = resolveIoPath(path);
  const table = io();
  if (table.isDir(abs)) {
    throw new UnsupportedError("fa-open-dir", "FileAccess.open() 落在目录上那一形没实测（引擎会打 drivers/windows 的 ERROR 块，消息集没搬）");
  }
  if (mode === FA_READ) {
    if (!table.exists(abs)) {
      lastFileOpenError = ERR_NOT_FOUND;
      return nullObject();
    }
    const file = new GdFile();
    file.given = path;
    file.abs = abs;
    file.mode = FA_READ;
    file.opened = true;
    file.bytes = Array.from(table.read(abs) ?? new Uint8Array(0));
    lastFileOpenError = ERR_OK;
    return V.object(file);
  }
  const dir = parentOf(abs);
  if (dir !== "" && !table.exists(dir)) {
    lastFileOpenError = ERR_NOT_FOUND;
    return nullObject();
  }
  if (!table.write(abs, new Uint8Array(0))) {
    throw new UnsupportedError("fa-create", `FileAccess.open(..., WRITE) 建不出文件（${path === "" ? "空串" : "另一形"}）：引擎那侧的失败消息集没实测`);
  }
  const file = new GdFile();
  file.given = path;
  file.abs = abs;
  file.mode = FA_WRITE;
  file.opened = true;
  lastFileOpenError = ERR_OK;
  return V.object(file);
}

export function faFileExists(path: string): boolean {
  if (path === "") return false;
  const abs = resolveIoPath(path);
  const table = io();
  return table.exists(abs) && !table.isDir(abs);
}

function requireOpen(file: GdFile, who: string): void {
  if (!file.opened) {
    throw new UnsupportedError("fa-closed", `FileAccess.${who}() 在 close() 之后调用：4.6.3 实测那一形要打 drivers/windows/file_access_windows.cpp 的 ERROR 块，消息集没搬，值也没法复现`);
  }
}

function requireWrite(file: GdFile, who: string): void {
  requireOpen(file, who);
  if (file.mode !== FA_WRITE) {
    throw new UnsupportedError("fa-readonly", `FileAccess.${who}() 在 READ 打开的句柄上写：没实测，响亮拒`);
  }
}

function put(file: GdFile, bs: number[]): void {
  for (let i = 0; i < bs.length; i++) {
    while (file.bytes.length <= file.pos + i) file.bytes.push(0);
    (file.bytes as number[])[file.pos + i] = bs[i] as number;
  }
  file.pos += bs.length;
}

function take(file: GdFile, n: number): { bs: number[]; short: boolean } {
  const bs: number[] = [];
  for (let i = 0; i < n; i++) bs.push(file.pos + i < file.bytes.length ? (file.bytes[file.pos + i] as number) : 0);
  const short = file.pos + n > file.bytes.length;
  if (short) file.err = ERR_CORRUPT;
  file.pos += n;
  return { bs, short };
}

function readScalar(file: GdFile, n: number, full: (v: DataView) => number | bigint): Variant {
  requireOpen(file, "get");
  const got = take(file, n);
  const value = full(viewOf(got.bs));
  return typeof value === "bigint" ? V.int(normInt(value)) : V.int(value);
}

function readFloat(file: GdFile, n: number, full: (v: DataView) => number): Variant {
  requireOpen(file, "get");
  const got = take(file, n);
  return V.float(got.short ? 0 : full(viewOf(got.bs)));
}

export function fileStoreBytes(file: GdFile, bs: number[]): void {
  put(file, bs);
}

export function fileStoreText(file: GdFile, s: string): void {
  requireWrite(file, "store_string");
  put(file, textBytes(s));
}

export function fileStoreNumber(file: GdFile, width: number, value: bigint): void {
  requireWrite(file, `store_${String(width * 8)}`);
  const buf = new ArrayBuffer(width);
  const view = new DataView(buf);
  if (width === 1) view.setUint8(0, Number(value) & 0xff);
  else if (width === 2) view.setUint16(0, Number(value) & 0xffff, true);
  else if (width === 4) view.setUint32(0, Number(BigInt.asUintN(32, value)), true);
  else view.setBigInt64(0, BigInt.asIntN(64, value), true);
  put(file, Array.from(new Uint8Array(buf)));
}

export function fileStoreFloat(file: GdFile, width: number, value: number): void {
  requireWrite(file, width === 4 ? "store_float" : "store_double");
  const view = new DataView(new ArrayBuffer(width));
  if (width === 4) view.setFloat32(0, value, true);
  else view.setFloat64(0, value, true);
  put(file, Array.from(new Uint8Array(view.buffer)));
}

export function fileStoreVar(file: GdFile, value: Variant, fullObjects: boolean): void {
  requireWrite(file, "store_var");
  const packed = (fullObjects ? gVarToBytesWithObjects(value) : gVarToBytes(value)).v as GBytes;
  const payload = packed.raw().map((e) => Number(e as number | bigint) & 0xff);
  const head = new DataView(new ArrayBuffer(4));
  head.setUint32(0, payload.length, true);
  put(file, Array.from(new Uint8Array(head.buffer)).concat(payload));
}

export function fileGetVar(file: GdFile, fullObjects: boolean): Variant {
  requireOpen(file, "get_var");
  const head = take(file, 4);
  const n = head.short ? 0 : viewOf(head.bs).getUint32(0, true);
  if (head.short || n < 4 || file.pos + n > file.bytes.length) {
    if (!head.short) take(file, Math.min(n, Math.max(0, file.bytes.length - file.pos)));
    file.err = ERR_CORRUPT;
    return V.nil();
  }
  const body = take(file, n);
  const packed = V.object(GBytes.of(body.bs, "byte"));
  return fullObjects ? gBytesToVarWithObjects(packed) : gBytesToVar(packed);
}

export function fileReadBuffer(file: GdFile, n: number): Variant {
  requireOpen(file, "get_buffer");
  const left = Math.max(0, file.bytes.length - file.pos);
  const got = Math.min(n, left);
  if (got < n) file.err = ERR_CORRUPT;
  const bs = file.bytes.slice(file.pos, file.pos + got);
  file.pos += got;
  return V.object(GBytes.of(bs, "byte"));
}

export function fileReadLine(file: GdFile): string {
  requireOpen(file, "get_line");
  const field: number[] = [];
  let p = file.pos;
  while (p < file.bytes.length) {
    const c = file.bytes[p] as number;
    if (c === 10) {
      p += 1;
      break;
    }
    if (c === 13) {
      p += file.bytes[p + 1] === 10 ? 2 : 1;
      break;
    }
    field.push(c);
    p += 1;
  }
  file.pos = p;
  return bytesText(field);
}

export function fileReadAll(file: GdFile): string {
  requireOpen(file, "get_as_text");
  return bytesText(file.bytes.slice(file.pos));
}

export function fileFlush(file: GdFile): void {
  requireOpen(file, "flush");
  if (file.mode === FA_WRITE) io().write(file.abs, Uint8Array.from(file.bytes));
}

export function fileClose(file: GdFile): void {
  if (!file.opened) return;
  file.opened = false;
  if (file.mode === FA_WRITE) io().write(file.abs, Uint8Array.from(file.bytes));
}

export function fileSeek(file: GdFile, to: number): void {
  requireOpen(file, "seek");
  if (to < 0 || to > file.bytes.length) {
    throw new UnsupportedError("fa-seek", `seek() 只量过落在已有内容之内（含末尾）的位置（收到 ${String(to)}，长度 ${String(file.bytes.length)}）`);
  }
  file.pos = to;
}

export function fileEof(file: GdFile): boolean {
  requireOpen(file, "eof_reached");
  if (file.mode === FA_WRITE) return false;
  return file.pos >= file.bytes.length;
}

export function dirOpen(path: string): Variant {
  if (path === "") {
    lastDirOpenError = ERR_BAD_PATH;
    return nullObject();
  }
  const abs = resolveIoPath(path);
  const table = io();
  if (!table.exists(abs) || !table.isDir(abs)) {
    lastDirOpenError = ERR_DOES_NOT_EXIST;
    return nullObject();
  }
  lastDirOpenError = ERR_OK;
  const dir = new GdDir();
  dir.given = path;
  dir.abs = abs;
  return V.object(dir);
}

function dirPath(dir: GdDir, name: string): string {
  if (name.includes("://")) {
    throw new UnsupportedError("da-rel-path", `DirAccess 实例方法的实参只量过相对当前目录的名字（收到带 :// 的那一形）：绝对路径走 DirAccess.*_absolute 那几支静态`);
  }
  return `${dir.abs}/${name}`.split("//").join("/");
}

function dirNames(dir: GdDir): string[] {
  return io().list(dir.abs);
}

function dirKindSet(dir: GdDir): Set<string> {
  const table = io();
  const out = new Set<string>();
  for (const name of dirNames(dir)) {
    if (table.isDir(`${dir.abs}/${name}`)) out.add(name);
  }
  return out;
}

export function dirListStrings(names: string[]): Variant {
  return V.object(GBytes.of(names, "string"));
}

export function dirFiles(dir: GdDir): Variant {
  const dirs = dirKindSet(dir);
  return dirListStrings(dirNames(dir).filter((n) => !dirs.has(n)));
}

export function dirDirectories(dir: GdDir): Variant {
  const dirs = dirKindSet(dir);
  return dirListStrings(dirNames(dir).filter((n) => dirs.has(n)));
}

export function dirListBegin(dir: GdDir): void {
  dir.names = dirNames(dir);
  dir.cursor = 0;
  dir.entryIsDir = false;
}

export function dirGetNext(dir: GdDir): string {
  if (dir.cursor >= dir.names.length) return "";
  const name = dir.names[dir.cursor] as string;
  dir.cursor += 1;
  dir.entryIsDir = io().isDir(`${dir.abs}/${name}`);
  return name;
}

export function dirChange(dir: GdDir, name: string): number {
  const to = dirPath(dir, name);
  if (!io().isDir(to)) return ERR_NOT_FOUND;
  dir.abs = to;
  dir.given = dir.given.endsWith("/") ? `${dir.given}${name}` : `${dir.given}/${name}`;
  return ERR_OK;
}

export function fileReadNumber(file: GdFile, n: number, full: (v: DataView) => number | bigint): Variant {
  return readScalar(file, n, full);
}

export function fileReadFloat(file: GdFile, n: number, full: (v: DataView) => number): Variant {
  return readFloat(file, n, full);
}

export function requireWriteFile(file: GdFile, who: string): void {
  requireWrite(file, who);
}

export function fileGuardLength(file: GdFile): Variant {
  requireOpen(file, "get_length");
  return V.int(file.bytes.length);
}

export function fileGuardPosition(file: GdFile): Variant {
  requireOpen(file, "get_position");
  return V.int(file.pos);
}

function dirEntryKind(dir: GdDir, name: string): "file" | "dir" | "none" {
  if (name === "") return "none";
  const p = dirPath(dir, name);
  const table = io();
  if (!table.exists(p)) return "none";
  return table.isDir(p) ? "dir" : "file";
}

export function dirFileExists(dir: GdDir, name: string): boolean {
  return dirEntryKind(dir, name) === "file";
}

export function dirSubExists(dir: GdDir, name: string): boolean {
  return dirEntryKind(dir, name) === "dir";
}

export function dirMake(dir: GdDir, name: string): number {
  if (name === "") return ERR_BAD_PATH;
  return io().makeDir(dirPath(dir, name));
}

function makeDirsRecursively(abs: string): number {
  const table = io();
  if (table.isDir(abs)) return ERR_OK;
  const parts = abs.split(/[\\/]/);
  const rooted = /^[A-Za-z]:/.test(parts[0] as string);
  let cur = rooted ? `${parts[0]}/` : "";
  for (let i = rooted ? 1 : 0; i < parts.length; i++) {
    if ((parts[i] as string) === "") continue;
    cur = cur === "" || cur.endsWith(":") ? `${cur}${parts[i]}` : `${cur}/${parts[i]}`;
    if (table.exists(cur)) {
      if (!table.isDir(cur)) return ERR_FAILED;
      continue;
    }
    if (table.makeDir(cur) !== ERR_OK) return ERR_FAILED;
  }
  return table.isDir(abs) ? ERR_OK : ERR_FAILED;
}

export function dirMakeRecursive(dir: GdDir, name: string): number {
  if (name === "") return ERR_BAD_PATH;
  return makeDirsRecursively(dirPath(dir, name));
}

export function dirMakeRecursiveAbsolute(path: string): number {
  if (path === "") return ERR_BAD_PATH;
  return makeDirsRecursively(resolveIoPath(path));
}

export function dirRemove(dir: GdDir, name: string): number {
  return io().remove(dirGlobalized(name, "remove"));
}

/** 4.6.3 实测：copy / rename / remove 那三支按全局化路径处理，不跟着 current_dir 走（`user://work/b.txt` 那形才成）。 */
function dirGlobalized(name: string, who: string): string {
  if (!name.includes("://") && !/^[A-Za-z]:[\/]/.test(name)) {
    throw new UnsupportedError("da-abs-arg", `DirAccess.${who}() 的实参只量过带前缀的全局化路径（相对当前目录那一形引擎落回进程 cwd，两条轨不同源）`);
  }
  return resolveIoPath(name);
}

export function dirRename(dir: GdDir, from: string, to: string): number {
  return io().rename(dirGlobalized(from, "rename"), dirGlobalized(to, "rename"));
}

export function dirCopy(dir: GdDir, from: string, to: string): number {
  const a = dirGlobalized(from, "copy");
  if (!io().exists(a)) {
    throw new UnsupportedError("da-copy-missing", "DirAccess.copy() 的源不存在那一形会打 core/io/dir_access.cpp 的 ERROR 块：返回值量过（7），消息集没搬，响亮拒");
  }
  return io().copy(a, dirGlobalized(to, "copy"));
}

export function dirMakeAbsolute(path: string): number {
  if (path === "") return ERR_BAD_PATH;
  return io().makeDir(resolveIoPath(path));
}

export function dirCopyAbsolute(from: string, to: string): number {
  if (from === "" || to === "") return ERR_BAD_PATH;
  const a = resolveIoPath(from);
  const b = resolveIoPath(to);
  if (!io().exists(a)) {
    throw new UnsupportedError("da-copy-missing", "DirAccess.copy_absolute() 的源不存在那一形会打 core/io/dir_access.cpp 的 ERROR 块：返回值量过（7），消息集没搬，响亮拒");
  }
  return io().copy(a, b);
}


export function dirRemoveAbsolute(path: string): number {
  if (path === "") return ERR_BAD_PATH;
  return io().remove(resolveIoPath(path));
}

export function dirRenameAbsolute(from: string, to: string): number {
  if (from === "" || to === "") return ERR_BAD_PATH;
  return io().rename(resolveIoPath(from), resolveIoPath(to));
}

export function dirExistsAbsolute(path: string): boolean {
  if (path === "") return false;
  const abs = resolveIoPath(path);
  const table = io();
  return table.exists(abs) && table.isDir(abs);
}

export { ERR_OK, ERR_FAILED, ERR_NOT_FOUND, ERR_BAD_PATH, ERR_CORRUPT };
