import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GodotRuntimeError, UnsupportedError } from "./errors";

/** NodePath 值型：`typeof` 22，等式看「绝对位 + 名字表 + 子名表」，三种打印形（`str()` 的裸路径串、容器里的
 *  `^"…"`、`var_to_str` 的 `NodePath("…")`，后两形都过 `c_escape()`）。解析式子与 4.3 的 `node_path.cpp` 完全同形：
 *  **没有任何转义**，第一个 `:` 就是子名段的起点 —— S267 ④ 把 `a\:b` 读成「一个带转义冒号的名字」是误判，
 *  实测（`tmp/probe-nodepath/q-e1.gd`）它是「名字 `a\` + 子名 `b`」：名数 1、子名数 1、`str()` 打回 `a\:b`。 */
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

/** 名字段：按每个 `/` 断（反斜杠不转义它，实测 `a\/b` 是两个名字、第一个就是 `a\`）；空段丢掉。 */
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

/** 子名段：`:` 断，结尾那个空段允许（4.3 源码里那句注释 `Allow end-of-path :`，实测 `x:` 是 0 个子名）；
 *  中间的空段引擎是 `ERR_FAIL_MSG("Invalid NodePath 'a::b'.")` 直接回空路径，那一形我们拒（见 `nodePathValue`）。 */
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

/** 解析失败（中间空子名那一形）给 null；其余形状全按实测发出。 */
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

/** `str()` / `print()` / `"%s"` 那一串：绝对位 + 名字用 `/` 拼 + 子名用 `:` 拼（名字里的反斜杠原样留着）。 */
export function nodePathText(p: GdNodePath): string {
  let out = p.absolute ? "/" : "";
  out += p.names.join("/");
  if (p.subnames.length > 0) out += ":" + p.subnames.join(":");
  return out;
}

/** `get_as_property_path()`：名字表清空、`names.join("/")` 变成第一个子名，绝对位丢掉；零名字时原样回
 *  （实测 `""` → `""`、`"/"` → `/`、`"a/b"` → `:a/b`、`"a/b:1"` → `:a/b:1`、`"x:"` → `:x`）。 */
export function toPropertyPath(p: GdNodePath): GdNodePath {
  if (p.names.length === 0) return p;
  return new GdNodePath(false, [], [p.names.join("/"), ...p.subnames], false);
}

/** 解析式子拿不到形状（`a::b` 那种中间空子名）时走的拒：引擎当场把值当空路径，同时往 stderr 打一句带它自己
 *  C++ 文件与行号的 `ERROR:`（实测 `at: NodePath (core/string/node_path.cpp:418)`），那句发不出来就不复刻。 */
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

/** 零实参的六支名（元数句与返回值都在 4.6.3 一支一名量过，探头 `tmp/probe-nodepath/h-*.gd`）。 */
const NP_ZERO_ARG = ["get_name_count", "get_subname_count", "is_absolute", "is_empty", "get_as_property_path"];

/** 一支下标的两支（`get_name` / `get_subname`）：结果给 StringName，实测 typeof 21。 */
const NP_ONE_ARG = ["get_name", "get_subname"];

/** 下标只量过 int 来源（`get_name(0)` / `(1)` / `(3)` / `(-1)` 四格），其余来源响亮拒。 */
function nodePathIndex(v: Variant, name: string): number {
  if (v.t !== Tag.INT) {
    throw new UnsupportedError("node-path-arg", `NodePath.${name}() 的下标实参只量过 int（收到 ${tagName(v.t)}）`);
  }
  return intToNum(v.v as IntPayload);
}

/** NodePath 的方法面：七支发出，`hash()` 与越界那两形按 S267 ⑥ 拒，其余名给运行期那句 Nonexistent function。 */
export function nodePathMethod(p: GdNodePath, name: string, args: readonly Variant[]): Variant {
  if (name === "hash") {
    throw new UnsupportedError(
      "node-path-hash",
      "NodePath 的哈希式子没逆出来（实测 hash(NodePath(\"a\")) = 3608900604、hash(NodePath(\"a/b\")) = 1780534522，4.3 那支「绝对位起手 1 再逐名异或」不成立，S267 ⑥a），不发",
    );
  }
  if (NP_ZERO_ARG.indexOf(name) >= 0) {
    if (args.length > 0) {
      throw new GodotRuntimeError("arity", `Too many arguments for "${name}()" call. Expected at most 0 but received ${String(args.length)}.`);
    }
    if (name === "get_name_count") return V.int(p.names.length);
    if (name === "get_subname_count") return V.int(p.subnames.length);
    if (name === "is_absolute") return V.bool(p.absolute);
    if (name === "is_empty") return V.bool(p.empty);
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
