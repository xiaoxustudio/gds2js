import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { hostIo, hostIoMissing, resolveIoPath } from "../../host-io";
import { md5Bytes } from "../../md5";

const ERR_OK = 0;
const ERR_FILE_NOT_FOUND = 7;
const ERR_CANT_CREATE = 20;
const ERR_UNCONFIGURED = 31;

const GODOT_VERSION = [4, 6, 3];
const HEADER_BASE = 112;

interface Entry {
  path: string;
  source: number[] | null;
  removal: boolean;
}

function alignUp(n: number, alignment: number): number {
  return Math.ceil(n / alignment) * alignment;
}

function writeU32(out: number[], n: number): void {
  out.push(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255);
}

function writeU64(out: number[], n: number): void {
  const lo = n >>> 0;
  const hi = Math.floor(n / 0x100000000);
  writeU32(out, lo);
  writeU32(out, hi);
}

function textArg(v: Variant | undefined, who: string): string {
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("pck-arg", `PCKPacker 的 ${who} 只量过字符串`);
  return String(v.v);
}

function intArg(v: Variant | undefined, who: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("pck-arg", `PCKPacker 的 ${who} 只量过数`);
  return Math.trunc(Number(v.v as number | bigint));
}

export class GdPckPacker extends GdScriptObject {
  private target = "";
  private alignment = 32;
  private entries: Entry[] = [];
  private started = false;

  private build(): number[] {
    const alignment = this.alignment;
    const fileBase = alignUp(HEADER_BASE, alignment);
    const header: number[] = [0x47, 0x44, 0x50, 0x43];
    writeU32(header, 3);
    for (const v of GODOT_VERSION) writeU32(header, v);
    writeU32(header, 2);
    writeU64(header, fileBase);

    const data: number[] = [];
    const offsets: number[] = [];
    let cursor = 0;
    for (const entry of this.entries) {
      const bytes = entry.source ?? [];
      cursor = alignUp(cursor, alignment);
      offsets.push(cursor);
      if (!entry.removal) {
        while (data.length < cursor) data.push(0);
        data.push(...bytes);
        cursor += bytes.length;
      }
    }
    const dirOffset = alignUp(cursor, alignment);
    while (data.length < dirOffset) data.push(0);
    writeU64(header, fileBase + dirOffset);
    while (header.length < fileBase) header.push(0);

    const dir: number[] = [];
    writeU32(dir, this.entries.length);
    this.entries.forEach((entry, i) => {
      const pathBytes = [...new TextEncoder().encode(entry.path)];
      const pathLen = alignUp(pathBytes.length, 4);
      writeU32(dir, pathLen);
      dir.push(...pathBytes);
      for (let k = pathBytes.length; k < pathLen; k++) dir[dir.length] = 0;
      writeU64(dir, offsets[i] as number);
      writeU64(dir, entry.source === null ? 0 : entry.source.length);
      if (entry.source === null) for (let k = 0; k < 16; k++) dir.push(0);
      else dir.push(...md5Bytes(new Uint8Array(entry.source)).match(/../g)!.map((h) => parseInt(h, 16)));
      writeU32(dir, entry.removal ? 2 : 0);
    });
    return [...header, ...data, ...dir];
  }

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "pck_start") {
      const path = textArg(args[0], "pck_start 路径");
      const alignment = intArg(args[1], "pck_start 对齐");
      const key = textArg(args[2], "pck_start 密钥");
      const encryptDir = args[3] !== undefined && args[3].t === Tag.BOOL && args[3].v === true;
      if (alignment <= 0) return V.int(ERR_CANT_CREATE);
      if (key.length !== 64) return V.int(ERR_CANT_CREATE);
      if (encryptDir) throw new UnsupportedError("pck-encrypt-dir", "PCKPacker 的目录加密这一支没量过");
      this.target = path;
      this.alignment = alignment;
      this.entries = [];
      this.started = true;
      return V.int(ERR_OK);
    }
    if (name === "add_file") {
      const target = textArg(args[0], "add_file 目标");
      const source = textArg(args[1], "add_file 源");
      const table = hostIo();
      if (table === null) hostIoMissing();
      const abs = resolveIoPath(source);
      if (!table.exists(abs)) return V.int(ERR_FILE_NOT_FOUND);
      const data = table.read(abs);
      this.entries.push({ path: target.replace(/^res:\/\//, ""), source: data === null ? [] : [...data], removal: false });
      return V.int(ERR_OK);
    }
    if (name === "add_file_removal") {
      this.entries.push({ path: textArg(args[0], "add_file_removal 目标").replace(/^res:\/\//, ""), source: null, removal: true });
      return V.int(ERR_OK);
    }
    if (name === "flush") {
      if (!this.started) return V.int(ERR_UNCONFIGURED);
      const table = hostIo();
      if (table === null) hostIoMissing();
      const ok = table.write(resolveIoPath(this.target), new Uint8Array(this.build()));
      return V.int(ok ? ERR_OK : ERR_CANT_CREATE);
    }
    return null;
  }
}

export function pckPackerMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdPckPacker).__gdDispatch(name, args);
}

registerEngineCtor("PCKPacker", () => new GdPckPacker());
