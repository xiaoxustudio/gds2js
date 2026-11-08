import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GBytes } from "../bytes/packed";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { hostIo, hostIoMissing, resolveIoPath } from "../../host-io";
import { strToVar, varToStr } from "../../values";
import { Aes } from "../../aes";
import { md5Bytes } from "../../md5";

const ERR_OK = 0;
const ERR_FAILED = 1;
const ERR_FILE_NOT_FOUND = 7;
const ERR_FILE_CORRUPT = 16;
const ERR_INVALID_PARAMETER = 31;
const ERR_PARSE_ERROR = 43;

const utf8 = (s: string): number[] => [...new TextEncoder().encode(s)];

function hexBytes(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

function md5Of(bytes: readonly number[]): number[] {
  return hexBytes(md5Bytes(new Uint8Array(bytes as number[])));
}

function passwordKey(password: string): number[] {
  return utf8(md5Bytes(new TextEncoder().encode(password)));
}

function cfbCrypt(aes: Aes, iv: number[], data: number[], decrypt: boolean): number[] {
  const out: number[] = [];
  let feedback = iv.slice();
  for (let off = 0; off < data.length; off += 16) {
    const block = data.slice(off, off + 16);
    const ks = aes.encryptBlock(feedback);
    const result = block.map((b, i) => b ^ (ks[i] as number));
    out.push(...result);
    feedback = decrypt ? block : result;
  }
  return out;
}

function encryptPayload(plain: number[], key: number[]): number[] {
  const iv: number[] = [];
  const cryptoObj = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (cryptoObj?.getRandomValues !== undefined) {
    const buf = new Uint8Array(16);
    cryptoObj.getRandomValues(buf);
    for (const b of buf) iv.push(b);
  } else {
    for (let i = 0; i < 16; i++) iv.push(Math.floor(Math.random() * 256));
  }
  const padded = plain.slice();
  while (padded.length % 16 !== 0) padded.push(0);
  const cipher = cfbCrypt(new Aes(key), iv, padded, false);
  const header = [...utf8("GDEC"), ...md5Of(plain)];
  let len = plain.length;
  for (let i = 0; i < 8; i++) {
    header.push(len & 255);
    len = Math.floor(len / 256);
  }
  return [...header, ...iv, ...cipher];
}

function decryptPayload(raw: number[], key: number[]): number[] | null {
  if (raw.length < 44) return null;
  if (String.fromCharCode(...raw.slice(0, 4)) !== "GDEC") return null;
  const md5 = raw.slice(4, 20);
  let len = 0;
  for (let i = 7; i >= 0; i--) len = len * 256 + (raw[20 + i] as number);
  const iv = raw.slice(28, 44);
  const plain = cfbCrypt(new Aes(key), iv, raw.slice(44), true).slice(0, len);
  const check = md5Of(plain);
  if (check.some((b, i) => b !== md5[i])) return null;
  return plain;
}

export class GdConfigFile extends GdScriptObject {
  sections = new Map<string, Map<string, Variant>>();

  private text(): string {
    const parts: string[] = [];
    for (const [section, entries] of this.sections) {
      const lines = [`[${section}]`, ""];
      for (const [key, value] of entries) lines.push(`${key}=${varToStr(value)}`);
      parts.push(lines.join("\n"));
    }
    return parts.length === 0 ? "" : `${parts.join("\n\n")}\n`;
  }

  private parseText(text: string): boolean {
    const next = new Map<string, Map<string, Variant>>();
    const lines = text.split(/\r?\n/);
    let section: Map<string, Variant> | null = null;
    for (let i = 0; i < lines.length; i++) {
      const line = (lines[i] as string).trim();
      if (line === "" || line.startsWith(";") || line.startsWith("#")) continue;
      if (line.startsWith("[")) {
        if (!line.endsWith("]")) return false;
        const name = line.slice(1, -1);
        section = next.get(name) ?? new Map<string, Variant>();
        next.set(name, section);
        continue;
      }
      const at = line.indexOf("=");
      if (at < 0) continue;
      if (section === null) return false;
      const key = line.slice(0, at);
      let valueText = line.slice(at + 1);
      while (!balanced(valueText) && i + 1 < lines.length) {
        i++;
        valueText += `\n${lines[i] as string}`;
      }
      let value: Variant;
      try {
        value = strToVar(V.str(valueText));
      } catch {
        return false;
      }
      section.set(key, value);
    }
    this.sections = next;
    return true;
  }

  private read(path: string): number[] | null {
    const table = hostIo();
    if (table === null) hostIoMissing();
    const abs = resolveIoPath(path);
    if (!table.exists(abs)) return null;
    const data = table.read(abs);
    return data === null ? null : [...data];
  }

  private write(path: string, bytes: number[]): boolean {
    const table = hostIo();
    if (table === null) hostIoMissing();
    return table.write(resolveIoPath(path), new Uint8Array(bytes));
  }

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    switch (name) {
      case "clear":
        this.sections.clear();
        return V.nil();
      case "encode_to_text":
        return V.str(this.text());
      case "parse": {
        const text = args[0];
        if (text === undefined || text.t !== Tag.STRING) throw new UnsupportedError("config-arg", "ConfigFile.parse() 只量过 String");
        return V.int(this.parseText(String(text.v)) ? ERR_OK : ERR_PARSE_ERROR);
      }
      case "set_value": {
        const section = textArg(args[0], "section");
        const key = textArg(args[1], "key");
        const value = args[2] as Variant;
        let entries = this.sections.get(section);
        if (entries === undefined) {
          entries = new Map();
          this.sections.set(section, entries);
        }
        if (value === undefined || value.t === Tag.NIL) entries.delete(key);
        else entries.set(key, value);
        return V.nil();
      }
      case "get_value": {
        const section = textArg(args[0], "section");
        const key = textArg(args[1], "key");
        const hit = this.sections.get(section)?.get(key);
        if (hit !== undefined) return hit;
        return args[2] === undefined ? V.nil() : (args[2] as Variant);
      }
      case "has_section":
        return V.bool(this.sections.has(textArg(args[0], "section")));
      case "has_section_key":
        return V.bool(this.sections.get(textArg(args[0], "section"))?.has(textArg(args[1], "key")) === true);
      case "get_sections":
        return V.object(GBytes.of([...this.sections.keys()], "string"));
      case "get_section_keys":
        return V.object(GBytes.of([...(this.sections.get(textArg(args[0], "section"))?.keys() ?? [])], "string"));
      case "erase_section":
        this.sections.delete(textArg(args[0], "section"));
        return V.nil();
      case "erase_section_key":
        this.sections.get(textArg(args[0], "section"))?.delete(textArg(args[1], "key"));
        return V.nil();
      case "load": {
        const raw = this.read(textArg(args[0], "path"));
        if (raw === null) return V.int(ERR_FILE_NOT_FOUND);
        return V.int(this.parseText(new TextDecoder().decode(new Uint8Array(raw))) ? ERR_OK : ERR_PARSE_ERROR);
      }
      case "save": {
        const ok = this.write(textArg(args[0], "path"), utf8(this.text()));
        return V.int(ok ? ERR_OK : ERR_FAILED);
      }
      case "load_encrypted": {
        const path = textArg(args[0], "path");
        const key = keyArg(args[1]);
        if (key === null) return V.int(ERR_INVALID_PARAMETER);
        const raw = this.read(path);
        if (raw === null) return V.int(ERR_FILE_NOT_FOUND);
        const plain = decryptPayload(raw, key);
        if (plain === null) return V.int(ERR_FILE_CORRUPT);
        return V.int(this.parseText(new TextDecoder().decode(new Uint8Array(plain))) ? ERR_OK : ERR_PARSE_ERROR);
      }
      case "load_encrypted_pass": {
        const path = textArg(args[0], "path");
        const password = textArg(args[1], "password");
        const raw = this.read(path);
        if (raw === null) return V.int(ERR_FILE_NOT_FOUND);
        const plain = decryptPayload(raw, passwordKey(password));
        if (plain === null) return V.int(ERR_FILE_CORRUPT);
        return V.int(this.parseText(new TextDecoder().decode(new Uint8Array(plain))) ? ERR_OK : ERR_PARSE_ERROR);
      }
      case "save_encrypted": {
        const path = textArg(args[0], "path");
        const key = keyArg(args[1]);
        if (key === null) return V.int(ERR_INVALID_PARAMETER);
        return V.int(this.write(path, encryptPayload(utf8(this.text()), key)) ? ERR_OK : ERR_FAILED);
      }
      case "save_encrypted_pass": {
        const path = textArg(args[0], "path");
        const password = textArg(args[1], "password");
        return V.int(this.write(path, encryptPayload(utf8(this.text()), passwordKey(password))) ? ERR_OK : ERR_FAILED);
      }
      default:
        throw new UnsupportedError("configfile-member", `ConfigFile.${name}() 这一支没量过`);
    }
  }
}

function balanced(text: string): boolean {
  let depth = 0;
  let quote = false;
  let escape = false;
  for (const c of text) {
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      quote = !quote;
      continue;
    }
    if (quote) continue;
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
  }
  return depth <= 0 && !quote;
}

function textArg(v: Variant | undefined, who: string): string {
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("config-arg", `ConfigFile 的 ${who} 只量过字符串`);
  return String(v.v);
}

function keyArg(v: Variant | undefined): number[] | null {
  if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) throw new UnsupportedError("config-arg", "ConfigFile 的密钥只量过 PackedByteArray");
  const key = (v.v as GBytes).raw().map((b) => Number(b) & 255);
  return key.length === 32 ? key : null;
}

export function configFileMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdConfigFile).__gdDispatch(name, args);
}

registerEngineCtor("ConfigFile", () => new GdConfigFile());
