import { Tag, V, intToBig, intToNum, type Variant } from "../tags";
import { UnsupportedError } from "../errors";
import { GBytes } from "../packed";
import * as fa from "../file-access";
import { asString } from "./core";

export const FA_STATIC_NAMES = new Set(["open", "file_exists", "get_open_error"]);

export const DA_STATIC_NAMES = new Set([
  "open",
  "get_open_error",
  "make_dir_absolute",
  "make_dir_recursive_absolute",
  "remove_absolute",
  "copy_absolute",
  "rename_absolute",
  "dir_exists_absolute",
]);

function pathArg(args: Variant[], at: number, who: string): string {
  const v = args[at] as Variant | undefined;
  if (v === undefined) throw new UnsupportedError("io-arity", `${who}() 的第 ${String(at + 1)} 参没给：路径只量过那几形`);
  if (v.t !== Tag.STRING) throw new UnsupportedError("io-arg-type", `${who}() 的第 ${String(at + 1)} 参只量过 String（收到的是别的东西）`);
  return asString(v, `${who}() 的第 ${String(at + 1)} 参`);
}

function intArg(args: Variant[], at: number, who: string): number {
  const v = args[at] as Variant | undefined;
  if (v === undefined || v.t !== Tag.INT) throw new UnsupportedError("io-arg-type", `${who}() 的第 ${String(at + 1)} 参只量过 int（收到的是别的东西）`);
  return intToNum(v.v as number | bigint);
}

function bigArg(args: Variant[], at: number, who: string): bigint {
  const v = args[at] as Variant | undefined;
  if (v === undefined || v.t !== Tag.INT) throw new UnsupportedError("io-arg-type", `${who}() 的第 ${String(at + 1)} 参只量过 int（收到的是别的东西）`);
  return intToBig(v.v as number | bigint);
}

function floatArg(args: Variant[], at: number, who: string): number {
  const v = args[at] as Variant | undefined;
  if (v === undefined || v.t !== Tag.FLOAT) throw new UnsupportedError("io-arg-type", `${who}() 的第 ${String(at + 1)} 参只量过 float（收到的是别的东西）`);
  return v.v as number;
}

function boolArg(args: Variant[], at: number, who: string, dflt: boolean): boolean {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  if (v.t !== Tag.BOOL) throw new UnsupportedError("io-arg-type", `${who}() 的第 ${String(at + 1)} 参只量过 bool（收到的是别的东西）`);
  return v.v === true;
}

function bytesArg(args: Variant[], at: number, who: string): number[] {
  const v = args[at] as Variant | undefined;
  if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GBytes) || (v.v as GBytes).kind !== "byte") {
    throw new UnsupportedError("io-arg-type", `${who}() 的第 ${String(at + 1)} 参只量过 PackedByteArray（收到的是别的东西）`);
  }
  return (v.v as GBytes).raw().map((e) => Number(e as number | bigint) & 0xff);
}

export function fileAccessStatic(name: string, args: Variant[]): Variant {
  if (name === "open") {
    if (args.length !== 2) throw new UnsupportedError("io-arity", `FileAccess.open() 只量过 (路径, 模式) 两个实参（收到 ${String(args.length)} 个）`);
    return fa.faOpen(pathArg(args, 0, "open"), intArg(args, 1, "open"));
  }
  if (name === "file_exists") {
    if (args.length !== 1) throw new UnsupportedError("io-arity", `FileAccess.file_exists() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
    return V.bool(fa.faFileExists(pathArg(args, 0, "file_exists")));
  }
  if (args.length !== 0) throw new UnsupportedError("io-arity", `FileAccess.get_open_error() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
  return V.int(fa.faLastOpenError());
}

export function dirAccessStatic(name: string, args: Variant[]): Variant {
  if (name === "open") {
    if (args.length !== 1) throw new UnsupportedError("io-arity", `DirAccess.open() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
    return fa.dirOpen(pathArg(args, 0, "open"));
  }
  if (name === "get_open_error") {
    if (args.length !== 0) throw new UnsupportedError("io-arity", `DirAccess.get_open_error() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
    return V.int(fa.daLastOpenError());
  }
  if (name === "dir_exists_absolute") {
    if (args.length !== 1) throw new UnsupportedError("io-arity", `DirAccess.dir_exists_absolute() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
    return V.bool(fa.dirExistsAbsolute(pathArg(args, 0, "dir_exists_absolute")));
  }
  if (name === "make_dir_absolute") {
    if (args.length !== 1) throw new UnsupportedError("io-arity", `DirAccess.make_dir_absolute() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
    return V.int(fa.dirMakeAbsolute(pathArg(args, 0, "make_dir_absolute")));
  }
  if (name === "make_dir_recursive_absolute") {
    if (args.length !== 1) throw new UnsupportedError("io-arity", `DirAccess.make_dir_recursive_absolute() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
    return V.int(fa.dirMakeRecursiveAbsolute(pathArg(args, 0, "make_dir_recursive_absolute")));
  }
  if (name === "remove_absolute") {
    if (args.length !== 1) throw new UnsupportedError("io-arity", `DirAccess.remove_absolute() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
    return V.int(fa.dirRemoveAbsolute(pathArg(args, 0, "remove_absolute")));
  }
  const pair = name === "copy_absolute" || name === "rename_absolute";
  if (pair) {
    if (args.length !== 2) throw new UnsupportedError("io-arity", `DirAccess.${name}() 只量过 2 个实参（收到 ${String(args.length)} 个）`);
    const from = pathArg(args, 0, name);
    const to = pathArg(args, 1, name);
    return V.int(name === "copy_absolute" ? fa.dirCopyAbsolute(from, to) : fa.dirRenameAbsolute(from, to));
  }
  throw new UnsupportedError("da-static", `DirAccess.${name}() 这一支静态面没量过`);
}

export function fileMethod(file: fa.GdFile, name: string, args: Variant[]): Variant {
  switch (name) {
    case "store_string": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", `store_string() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
      fa.fileStoreText(file, pathArg(args, 0, "store_string"));
      return V.nil();
    }
    case "store_line": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", `store_line() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
      fa.fileStoreText(file, `${pathArg(args, 0, "store_line")}
`);
      return V.nil();
    }
    case "store_buffer": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", `store_buffer() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
      fa.requireWriteFile(file, "store_buffer");
      fa.fileStoreBytes(file, bytesArg(args, 0, "store_buffer"));
      return V.nil();
    }
    case "store_8":
    case "store_16":
    case "store_32":
    case "store_64": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", `${name}() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
      fa.fileStoreNumber(file, name === "store_8" ? 1 : name === "store_16" ? 2 : name === "store_32" ? 4 : 8, bigArg(args, 0, name));
      return V.nil();
    }
    case "store_float":
    case "store_real": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", `${name}() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
      fa.fileStoreFloat(file, 4, floatArg(args, 0, name));
      return V.nil();
    }
    case "store_double": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", "store_double() 只量过 1 个实参");
      fa.fileStoreFloat(file, 8, floatArg(args, 0, name));
      return V.nil();
    }
    case "store_var": {
      if (args.length < 1 || args.length > 2) throw new UnsupportedError("io-arity", `store_var() 只量过 1 到 2 个实参（收到 ${String(args.length)} 个）`);
      fa.fileStoreVar(file, args[0] as Variant, boolArg(args, 1, "store_var", false));
      return V.nil();
    }
    case "get_8":
    case "get_16":
    case "get_32":
    case "get_64": {
      if (args.length !== 0) throw new UnsupportedError("io-arity", `${name}() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      if (name === "get_8") return fa.fileReadNumber(file, 1, (v) => v.getUint8(0));
      if (name === "get_16") return fa.fileReadNumber(file, 2, (v) => v.getUint16(0, true));
      if (name === "get_32") return fa.fileReadNumber(file, 4, (v) => v.getUint32(0, true));
      return fa.fileReadNumber(file, 8, (v) => v.getBigInt64(0, true));
    }
    case "get_float":
    case "get_real": {
      if (args.length !== 0) throw new UnsupportedError("io-arity", `${name}() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return fa.fileReadFloat(file, 4, (v) => v.getFloat32(0, true));
    }
    case "get_double": {
      if (args.length !== 0) throw new UnsupportedError("io-arity", "get_double() 只量过 0 个实参");
      return fa.fileReadFloat(file, 8, (v) => v.getFloat64(0, true));
    }
    case "get_buffer": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", `get_buffer() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
      return fa.fileReadBuffer(file, intArg(args, 0, "get_buffer"));
    }
    case "get_var": {
      if (args.length > 1) throw new UnsupportedError("io-arity", `get_var() 只量过 0 到 1 个实参（收到 ${String(args.length)} 个）`);
      return fa.fileGetVar(file, boolArg(args, 0, "get_var", false));
    }
    case "get_as_text": {
      if (args.length !== 0) throw new UnsupportedError("io-arity", "get_as_text() 只量过 0 个实参");
      return V.str(fa.fileReadAll(file));
    }
    case "get_line": {
      if (args.length !== 0) throw new UnsupportedError("io-arity", "get_line() 只量过 0 个实参");
      return V.str(fa.fileReadLine(file));
    }
    case "get_csv_line": {
      if (args.length > 2) throw new UnsupportedError("io-arity", `get_csv_line() 的第三参只量过 0 到 2 个实参（收到 ${String(args.length)} 个）`);
      if (args.length === 2) boolArg(args, 1, "get_csv_line", false);
      const delim = args.length === 0 ? "," : pathArg(args, 0, "get_csv_line");
      const line = fa.fileReadLine(file);
      return V.object(GBytes.of(delim === "" ? [line] : line.split(delim), "string"));
    }
    case "get_length":
      return fa.fileGuardLength(file);
    case "get_position":
      return fa.fileGuardPosition(file);
    case "seek": {
      if (args.length !== 1) throw new UnsupportedError("io-arity", "seek() 只量过 1 个实参");
      fa.fileSeek(file, intArg(args, 0, "seek"));
      return V.nil();
    }
    case "eof_reached":
      return V.bool(fa.fileEof(file));
    case "is_open":
      return V.bool(file.opened);
    case "get_error":
      return V.int(file.err);
    case "get_path":
      return V.str(file.given);
    case "get_path_absolute":
      return V.str(file.abs);
    case "flush":
      fa.fileFlush(file);
      return V.nil();
    case "close":
      fa.fileClose(file);
      return V.nil();
    default:
      throw new UnsupportedError(
        "fa-method",
        `FileAccess.${name}() 这一支没量过（pascal_string / resize / seek_end / 加密压缩 / 时间戳 / 大小 / 端序 / 权限那一族都在实测之外）`,
      );
  }
}

export function dirMethod(dir: fa.GdDir, name: string, args: Variant[]): Variant {
  switch (name) {
    case "get_current_dir":
      return V.str(dir.given);
    case "get_files":
      return fa.dirFiles(dir);
    case "get_directories":
      return fa.dirDirectories(dir);
    case "list_dir_begin":
      fa.dirListBegin(dir);
      return V.int(fa.ERR_OK);
    case "list_dir_end":
      fa.dirListBegin(dir);
      dir.cursor = dir.names.length;
      return V.nil();
    case "get_next":
      return V.str(fa.dirGetNext(dir));
    case "current_is_dir":
      return V.bool(dir.entryIsDir);
    case "file_exists":
      return V.bool(fa.dirFileExists(dir, pathArg(args, 0, "file_exists")));
    case "dir_exists":
      return V.bool(fa.dirSubExists(dir, pathArg(args, 0, "dir_exists")));
    case "change_dir":
      return V.int(fa.dirChange(dir, pathArg(args, 0, "change_dir")));
    case "make_dir":
      return V.int(fa.dirMake(dir, pathArg(args, 0, "make_dir")));
    case "make_dir_recursive":
      return V.int(fa.dirMakeRecursive(dir, pathArg(args, 0, "make_dir_recursive")));
    case "remove":
      return V.int(fa.dirRemove(dir, pathArg(args, 0, "remove")));
    case "rename":
      return V.int(fa.dirRename(dir, pathArg(args, 0, "rename"), pathArg(args, 1, "rename")));
    case "copy":
      return V.int(fa.dirCopy(dir, pathArg(args, 0, "copy"), pathArg(args, 1, "copy")));
    default:
      throw new UnsupportedError("da-method", `DirAccess.${name}() 这一支没量过（get_size / is_read_only / get_access / links / 驱动器那一族都在实测之外）`);
  }
}
