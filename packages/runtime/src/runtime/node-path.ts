import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GodotRuntimeError, UnsupportedError } from "./errors";

export class GdNodePath {
  constructor(
    readonly absolute: boolean,
    readonly names: readonly string[],
    readonly subnames: readonly string[],
    readonly empty: boolean,
  ) {}
}

/** 4.3 的那三条判空条件：零名字、非绝对、无子名 ⇒ 空路径（实测 `""` 判空、`"/"` 与 `"x:"` 与 `"."` 都不判空）。 */
function isEmptyPath(absolute: boolean, names: readonly string[], subnames: readonly string[]): boolean {
  return names.length === 0 && subnames.length === 0 && !absolute;
}

function splitNames(path: string): string[] {
  const names: string[] = [];
  let from = 0;
  let seen = false;
  for (let i = 0; i < path.length + 1; i++) {
    const c = i < path.length ? path[i] : "";
    if (c === "/" || i === path.length) {
      if (seen) names.push(path.slice(from, i));
      from = i + 1;
      seen = false;
    } else {
      seen = true;
    }
  }
  return names;
}

function splitSubnames(text: string): string[] | null {
  const out: string[] = [];
  let from = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text[i] === ":") {
      const seg = text.slice(from, i);
      if (seg === "") {
        if (i === text.length) continue;
        return null;
      }
      out.push(seg);
      from = i + 1;
    }
  }
  return out;
}

export function parseNodePath(text: string): GdNodePath | null {
  if (text === "") return new GdNodePath(false, [], [], true);
  const absolute = text[0] === "/";
  let path = text;
  let subnames: string[] = [];
  const colon = text.indexOf(":");
  if (colon >= 0) {
    path = text.slice(0, colon);
    const sub = splitSubnames(text.slice(colon + 1));
    if (sub === null) return null;
    subnames = sub;
  }
  const names = splitNames(absolute ? path.slice(1) : path);
  return new GdNodePath(absolute, names, subnames, isEmptyPath(absolute, names, subnames));
}

/** 取 NodePath 实例，不是 NodePath 对象给 null（ops 与打印那几处分派用）。 */
export function asNodePath(v: Variant): GdNodePath | null {
  return v.t === Tag.OBJECT && v.v instanceof GdNodePath ? (v.v as GdNodePath) : null;
}

export function sameNodePath(a: GdNodePath, b: GdNodePath): boolean {
  if (a.absolute !== b.absolute || a.names.length !== b.names.length || a.subnames.length !== b.subnames.length) return false;
  for (let i = 0; i < a.names.length; i++) if (a.names[i] !== b.names[i]) return false;
  for (let i = 0; i < a.subnames.length; i++) if (a.subnames[i] !== b.subnames[i]) return false;
  return true;
}

export function nodePathText(p: GdNodePath): string {
  let out = p.absolute ? "/" : "";
  out += p.names.join("/");
  if (p.subnames.length > 0) out += ":" + p.subnames.join(":");
  return out;
}

export function toPropertyPath(p: GdNodePath): GdNodePath {
  if (p.names.length === 0) return p;
  return new GdNodePath(false, [], [p.names.join("/"), ...p.subnames], false);
}

export function nodePathValue(text: string): Variant {
  const p = parseNodePath(text);
  if (p === null) {
    throw new UnsupportedError("node-path-invalid", `NodePath("${text}") 的解析式子没量过（引擎给空路径并打一句 core/string/ 的 ERROR）`);
  }
  return V.object(p);
}

export function emptyNodePath(): Variant {
  return V.object(new GdNodePath(false, [], [], true));
}

const NP_ZERO_ARG = ["get_concatenated_names", "get_concatenated_subnames", "get_name_count", "get_subname_count", "is_absolute", "is_empty", "get_as_property_path"];

export const NODE_PATH_SLICE_END_DEFAULT = 2147483647;

/** 一界折成 `[0, total]` 内的下标：先夹到 `[-total, total]`，负数再加 `total`（引擎的 `CLAMP` + `+= total_count`）。 */
function sliceBound(raw: number, total: number): number {
  const c = Math.min(Math.max(raw, -total), total);
  return c < 0 ? c + total : c;
}

function vecSlice(list: readonly string[], begin: number, end: number): string[] {
  const size = list.length;
  const b = Math.min(Math.max(begin, 0), size);
  const e = Math.min(Math.max(end, 0), size);
  if (b > e) return [];
  return list.slice(b, e);
}

export function nodePathSlice(p: GdNodePath, beginRaw: number, endRaw: number): GdNodePath {
  const nameCount = p.names.length;
  const total = nameCount + p.subnames.length;
  const begin = sliceBound(beginRaw, total);
  const end = sliceBound(endRaw, total);
  const names = vecSlice(p.names, begin, end);
  const subnames = vecSlice(p.subnames, Math.max(begin - nameCount, 0), Math.max(end - nameCount, 0));
  const absolute = p.absolute && begin === 0;
  return new GdNodePath(absolute, names, subnames, isEmptyPath(absolute, names, subnames));
}

const NP_ONE_ARG = ["get_name", "get_subname"];

function nodePathIndex(v: Variant, name: string): number {
  if (v.t !== Tag.INT) {
    throw new UnsupportedError("node-path-arg", `NodePath.${name}() 的下标实参只量过 int（收到 ${tagName(v.t)}）`);
  }
  return intToNum(v.v as IntPayload);
}

let nodePathHashHook: ((p: GdNodePath) => number) | null = null;

export function registerNodePathHashHook(f: (p: GdNodePath) => number): void {
  nodePathHashHook = f;
}

export function nodePathMethod(p: GdNodePath, name: string, args: readonly Variant[]): Variant {
  if (name === "hash") {
    if (nodePathHashHook === null) {
      throw new UnsupportedError("node-path-hash", "NodePath.hash() 的式子没登记（builtins.ts 未加载）");
    }
    return V.int(nodePathHashHook(p));
  }
  if (NP_ZERO_ARG.indexOf(name) >= 0) {
    if (args.length > 0) {
      throw new GodotRuntimeError("arity", `Too many arguments for "${name}()" call. Expected at most 0 but received ${String(args.length)}.`);
    }
    if (name === "get_name_count") return V.int(p.names.length);
    if (name === "get_subname_count") return V.int(p.subnames.length);
    if (name === "is_absolute") return V.bool(p.absolute);
    if (name === "is_empty") return V.bool(p.empty);
    if (name === "get_concatenated_names") return V.stringName(p.names.join("/"));
    if (name === "get_concatenated_subnames") return V.stringName(p.subnames.join("/"));
    return V.object(toPropertyPath(p));
  }
  if (NP_ONE_ARG.indexOf(name) >= 0) {
    if (args.length === 0) {
      throw new GodotRuntimeError("arity", `Too few arguments for "${name}()" call. Expected at least 1 but received 0.`);
    }
    if (args.length > 1) {
      throw new GodotRuntimeError("arity", `Too many arguments for "${name}()" call. Expected at most 1 but received ${String(args.length)}.`);
    }
    const list = name === "get_name" ? p.names : p.subnames;
    const idx = nodePathIndex(args[0] as Variant, name);
    if (idx < 0 || idx >= list.length) {
      throw new UnsupportedError(
        "node-path-index",
        `NodePath.${name}(${String(idx)}) 越界：引擎打一句带它自己 C++ 文件与行号的 ERROR（实测 at: get_name (core/string/node_path.cpp:69)）再回空 StringName，那句复刻不了就不发`,
      );
    }
    return V.stringName(list[idx] as string);
  }
  throw new GodotRuntimeError("node-path-method", `Invalid call. Nonexistent function '${name}' in base 'NodePath'.`);
}
