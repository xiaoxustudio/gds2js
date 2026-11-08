import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray, GDict } from "../../values";
import { GBytes } from "../bytes/packed";
import { rid } from "../identity/rid";
import { NULL_OBJECT } from "../identity/null-object";
import { nodePathValue } from "../identity/node-path";
import { asString } from "../../method/core";
import { printLine, stackBlockLines, writeOrderedStderr } from "../../frames";
import {
  nodeAddUserSignal,
  engineClassNew,
  GdEngineInstance,
  nodeArgSay,
  nodeAttach,
  nodeCanProcess,
  nodeHasUserSignal,
  nodeRemoveUserSignal,
  nodeDetach,
  nodeFaceOf,
  nodeFree,
  nodeGroups,
  nodeAddToGroup,
  nodeIsInGroup,
  nodeRemoveFromGroup,
  nodeSignalOf,
  nodeMoveChild,
  nodeQueueFree,
  nodeOfVariant,
  nodeNameSet,
  nodeParent,
  type NodeRec,
} from "./node";
import { callDeferred, isCallableBox, type CallableBox } from "../identity/callable";
import { callCallableBox } from "../../method/callable";
import { getMeta, hasMeta, metaKeys, removeMeta, setMeta, GdScriptObject } from "./script-object";
import { scenePathOf, sceneTree, treeCreateTween } from "./scene-tree";
import { node2dApplyGlobal, node2dGlobalTransform, node2dMethod, NODE2D_METHOD_NAMES } from "./node2d";
import { node3dGlobalTransform, node3dMethod, NODE3D_METHOD_NAMES } from "./node3d";
import { GdTimer, timerMethod } from "./timer";
import { ctlMethod, CTL_METHOD_NAMES } from "./control";

type NodePropWriteHook = (rec: NodeRec, key: string, value: Variant) => void;
let NODE_PROP_WRITE: NodePropWriteHook | null = null;
export function registerNodePropWriteHook(fn: NodePropWriteHook): void {
  NODE_PROP_WRITE = fn;
}

type NodePropReadHook = (rec: NodeRec, key: string) => Variant;
let NODE_PROP_READ: NodePropReadHook | null = null;
export function registerNodePropReadHook(fn: NodePropReadHook): void {
  NODE_PROP_READ = fn;
}

const NODE2D_METHODS = new Set(["to_local", "to_global", "rotate", "translate", "move_local_x", "move_local_y", "apply_scale", "get_relative_transform_to_parent"]);

const NODE2D_ONLY_METHODS = new Set(NODE2D_METHOD_NAMES);
const NODE3D_METHODS = new Set(["to_local", "to_global", "translate", "rotate", "rotate_x", "rotate_y", "rotate_z", "orthonormalize", "get_parent_node_3d", ...NODE3D_METHOD_NAMES]);
const CTL_METHODS = new Set(["get_minimum_size", "get_combined_minimum_size", "get_anchor", ...CTL_METHOD_NAMES]);

function cloneEngineNode(rec: NodeRec): NodeRec {
  let made: NodeRec;
  if (rec instanceof GdTimer) made = new GdTimer();
  else if (rec instanceof GdEngineInstance) made = new GdEngineInstance(rec.__gd_engine_class__);
  else throw new UnsupportedError("node-duplicate-script", "duplicate() 只量过引擎节点；脚本实例的字段克隆需要反射，这一形没建模");
  made.__gd_node_name__ = rec.__gd_node_name__;
  made.__gd_node_process__ = rec.__gd_node_process__;
  made.__gd_node_physics__ = rec.__gd_node_physics__;
  made.__gd_node_process_mode__ = rec.__gd_node_process_mode__;
  made.__gd_node_visible__ = rec.__gd_node_visible__;
  made.__gd_node_top_level__ = rec.__gd_node_top_level__;
  made.__gd_node_groups__ = rec.__gd_node_groups__.slice();
  if (rec.__gd_node_t2d__ !== undefined) made.__gd_node_t2d__ = Object.assign(Object.create(Object.getPrototypeOf(rec.__gd_node_t2d__)), rec.__gd_node_t2d__);
  if (rec.__gd_node_t3d__ !== undefined) made.__gd_node_t3d__ = Object.assign({}, rec.__gd_node_t3d__);
  if (rec.__gd_node_ctl__ !== undefined) made.__gd_node_ctl__ = Object.assign({}, rec.__gd_node_ctl__);
  for (const c of rec.__gd_node_children__) {
    const f = nodeFaceOf(c);
    if (f === null) continue;
    const cloned = cloneEngineNode(f);
    cloned.__gd_node_parent__ = made as unknown as object;
    made.__gd_node_children__.push(cloned as unknown as object);
  }
  return made;
}

function engineError(at: string, message: string): void {
  writeOrderedStderr(stackBlockLines("ERROR", at, [V.str(message)]));
}

function walkParts(node: NodeRec, parts: string[]): NodeRec | null {
  let cur: NodeRec = node;
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") {
      const up = nodeFaceOf(cur.__gd_node_parent__);
      if (up === null) return null;
      cur = up;
      continue;
    }
    const hit = cur.__gd_node_children__.find((c) => nodeFaceOf(c)?.__gd_node_name__ === p);
    if (hit === undefined) return null;
    cur = hit as NodeRec;
  }
  return cur;
}

function nodeWalkOr(node: NodeRec, text: string): NodeRec | null {
  if (text === "" || text.startsWith("/") || text.startsWith("%")) return null;
  return walkParts(node, text.split("/"));
}

function pathArg(args: Variant[], name: string): string {
  const a = args[0] as Variant | undefined;
  if (a === undefined) throw new UnsupportedError("node-arity", `Node.${name}() 少了路径实参`);
  return asString(a, "路径实参");
}

function groupArg(args: Variant[], name: string): string {
  const a = args[0] as Variant | undefined;
  if (a === undefined) throw new UnsupportedError("node-arity", `Node.${name}() 少了组名实参`);
  if (a.t !== Tag.STRING && a.t !== Tag.STRING_NAME) {
    throw new UnsupportedError("node-group-arg-type", `Node.${name}() 的组名只量过字符串（收到 ${tagName(a.t)}）`);
  }
  return String(a.v);
}

function childArg(args: Variant[], name: string): NodeRec {  const a = args[0] as Variant | undefined;
  if (a === undefined) throw new UnsupportedError("node-arity", `Node.${name}() 少了子节点实参`);
  const c = nodeOfVariant(a);
  if (c === null) nodeArgSay(a, name);
  return c as NodeRec;
}

function indexArg(v: Variant | undefined, name: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) {
    throw new UnsupportedError("node-arg-type", `Node.${name}() 的下标只量过数（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  }
  return Number(v.v);
}

function insideTree(rec: NodeRec): boolean {
  const tree = sceneTree();
  if (tree === null) return false;
  let cur: object | null = rec as unknown as object;
  for (;;) {
    if (cur === tree.root) return true;
    cur = nodeFaceOf(cur)?.__gd_node_parent__ ?? null;
    if (cur === null) return false;
  }
}

function globMatch(pattern: string, text: string): boolean {
  let out = "^";
  for (const ch of pattern) {
    if (ch === "*") out += ".*";
    else if (ch === "?") out += ".";
    else out += ch.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
  }
  return new RegExp(out + "$").test(text);
}

function ownedBy(target: NodeRec, hit: NodeRec): boolean {
  return hit.__gd_node_owner__ !== null;
}

function collectDescendants(rec: NodeRec, recursive: boolean, out: NodeRec[]): void {
  for (const c of rec.__gd_node_children__) {
    const f = nodeFaceOf(c);
    if (f === null) continue;
    out.push(f);
    if (recursive) collectDescendants(f, true, out);
  }
}

function boolArg(args: Variant[], at: number, fallback: boolean): boolean {
  const v = args[at];
  if (v === undefined) return fallback;
  if (v.t !== Tag.BOOL) throw new UnsupportedError("node-arg-type", `这一支的布尔实参只量过 bool（收到 ${tagName(v.t)}）`);
  return v.v === true;
}

function ancestry(rec: NodeRec): NodeRec[] {
  const out: NodeRec[] = [rec];
  let cur = nodeFaceOf(rec.__gd_node_parent__);
  while (cur !== null) {
    out.push(cur);
    cur = nodeFaceOf(cur.__gd_node_parent__);
  }
  return out;
}

function indexPath(rec: NodeRec): number[] {
  const out: number[] = [];
  let cur: NodeRec | null = rec;
  while (cur !== null) {
    const parent = nodeFaceOf(cur.__gd_node_parent__);
    if (parent === null) break;
    out.unshift(parent.__gd_node_children__.indexOf(cur as unknown as object));
    cur = parent;
  }
  return out;
}

function pathTo(from: NodeRec, to: NodeRec): string {
  if (from === to) return ".";
  const a = ancestry(from);
  const b = ancestry(to);
  let common = -1;
  for (let i = 0; i < a.length && i < b.length; i++) {
    if (a[a.length - 1 - i] === b[b.length - 1 - i]) common = i;
    else break;
  }
  if (common < 0) throw new UnsupportedError("node-path-common", "get_path_to() 的两个节点不在同一棵树里，这一形没建模");
  const ups = a.length - 1 - common;
  const down = b.slice(0, b.length - 1 - common).reverse().map((n) => n.__gd_node_name__);
  const parts: string[] = [];
  for (let i = 0; i < ups; i++) parts.push("..");
  parts.push(...down);
  return parts.join("/");
}

function callOnNode(rec: NodeRec, name: string, args: Variant[]): Variant | null {
  const dispatched = (rec as unknown as GdScriptObject).__gdDispatch(name, args);
  if (dispatched !== null) return dispatched;
  if (name === "set_meta") {
    setMeta(rec, args[0] as Variant, args[1] as Variant);
    return V.nil();
  }
  if (name === "get_meta") return getMeta(rec, args[0] as Variant, args[1]);
  if (name === "has_meta") return V.bool(hasMeta(rec, args[0] as Variant));
  return null;
}

export function nodeMethod(target: unknown, name: string, args: Variant[]): Variant {
  const rec = nodeFaceOf(target);
  if (rec === null) throw new UnsupportedError("node-face-missing", `${name}() 要落在带节点面的对象上`);
  if (name === "get_class") return V.str(rec.__gd_engine_class__);
  if (name === "add_user_signal") {
    nodeAddUserSignal(rec, asString(args[0] as Variant, "信号名"));
    return V.nil();
  }
  if (name === "has_user_signal") return V.bool(nodeHasUserSignal(rec, asString(args[0] as Variant, "信号名")));
  if (name === "remove_user_signal") {
    nodeRemoveUserSignal(rec, asString(args[0] as Variant, "信号名"));
    return V.nil();
  }
  if (name === "has_signal") {
    return V.bool(nodeSignalOf(rec, asString(args[0] as Variant, "信号名")) !== null);
  }
  if (name === "connect" || name === "disconnect" || name === "is_connected" || name === "emit_signal") {
    const sig = nodeSignalOf(rec, asString(args[0] as Variant, "信号名"));
    if (sig === null) throw new UnsupportedError("node-signal-missing", `节点上没有信号 ${String((args[0] as Variant).v)}`);
    if (name === "emit_signal") {
      sig.emitList(args.slice(1));
      return V.nil();
    }
    const cb = args[1];
    if (cb === undefined || !isCallableBox(cb.v)) throw new UnsupportedError("node-signal-callable", `${name}() 的 Callable 实参没量过`);
    if (name === "is_connected") return V.bool(sig.isConnected(cb.v));
    if (name === "disconnect") {
      sig.disconnectFrom(cb.v);
      return V.nil();
    }
    const flag = args[2] === undefined ? 0 : Number((args[2] as Variant).v);
    if (flag !== 0 && flag !== 4 && flag !== 8) throw new UnsupportedError("node-signal-flag", `connect() 的 flags=${flag} 没量过`);
    return V.int(sig.connectTo(cb.v, (a) => callCallableBox(cb.v as never, a), flag));
  }
  if (name === "set_meta") {
    setMeta(rec, args[0] as Variant, args[1] as Variant);
    return V.nil();
  }
  if (name === "get_meta") return getMeta(rec, args[0] as Variant, args[1]);
  if (name === "has_meta") return V.bool(hasMeta(rec, args[0] as Variant));
  if (name === "remove_meta") {
    removeMeta(rec, args[0] as Variant);
    return V.nil();
  }
  if (rec.__gd_freed__) throw new UnsupportedError("node-freed-call", `在已 free() 的实例上调 ${name}() 那一形没建模：引擎发 SCRIPT ERROR 并中断脚本`);
  if ((rec.__gd_engine_class__ === "Node2D" || rec.__gd_engine_class__ === "Control") && NODE2D_METHODS.has(name)) return node2dMethod(target, name, args);
  if (rec.__gd_engine_class__ === "Node2D" && NODE2D_ONLY_METHODS.has(name)) return node2dMethod(target, name, args);
  if (rec.__gd_engine_class__ === "Node3D" && NODE3D_METHODS.has(name)) {
    const hit = node3dMethod(target, name, args);
    if (hit !== null) return hit;
  }
  if (rec.__gd_engine_class__ === "Timer") {
    const hit = timerMethod(target, name, args);
    if (hit !== null) return hit;
  }
  if (rec.__gd_engine_class__ === "Control" && CTL_METHODS.has(name)) {
    const hit = ctlMethod(target, name, args);
    if (hit !== null) return hit;
  }
  switch (name) {
    case "add_child": {
      if (args.length === 0 || args.length > 2) throw new UnsupportedError("node-arity", `add_child() 只量过 1 与 2 个实参（收到 ${args.length} 个）`);
      nodeAttach(rec, childArg(args, name));
      return V.nil();
    }
    case "remove_child": {
      nodeDetach(rec, childArg(args, name));
      return V.nil();
    }
    case "move_child": {
      const child = childArg(args, name);
      const to = indexArg(args[1], name);
      if (to >= rec.__gd_node_children__.length) {
        engineError("move_child (scene/main/node.cpp:520)", `Invalid new child index: ${String(to)}.`);
        return V.nil();
      }
      nodeMoveChild(rec, child, to);
      return V.nil();
    }
    case "get_child": {
      const at = indexArg(args[0], name);
      const hit = rec.__gd_node_children__[at];
      if (hit === undefined) {
        engineError("get_child (scene/main/node.cpp:1849)", `Index p_index = ${String(at)} is out of bounds ((int)data.children_cache.size() - data.internal_children_front_count_cache - data.internal_children_back_count_cache = ${String(rec.__gd_node_children__.length)}).`);
        return V.object(NULL_OBJECT);
      }
      return V.object(hit);
    }
    case "get_child_count":
      return V.int(rec.__gd_node_children__.length);
    case "get_children": {
      const out: Variant[] = [];
      for (const c of rec.__gd_node_children__) out.push(V.object(c));
      return V.array(GArray.of(out));
    }
    case "get_parent": {
      const p = rec.__gd_node_parent__;
      return p === null ? V.object(NULL_OBJECT) : V.object(p);
    }
    case "get_index": {
      const p = nodeFaceOf(rec.__gd_node_parent__);
      return V.int(p === null ? -1 : p.__gd_node_children__.indexOf(rec as unknown as object));
    }
    case "find_child": {
      const pat = pathArg(args, name);
      const recursive = boolArg(args, 1, true);
      const owned = boolArg(args, 2, true);
      const all: NodeRec[] = [];
      collectDescendants(rec, recursive, all);
      const hit = all.find((n) => globMatch(pat, n.__gd_node_name__) && (!owned || ownedBy(rec, n)));
      return hit === undefined ? V.object(NULL_OBJECT) : V.object(hit as unknown as object);
    }
    case "find_children": {
      const pat = pathArg(args, name);
      const type = args[1] === undefined ? "" : asString(args[1] as Variant, "类型名");
      const recursive = boolArg(args, 2, true);
      const owned = boolArg(args, 3, true);
      const all: NodeRec[] = [];
      collectDescendants(rec, recursive, all);
      const hits = all.filter((n) => globMatch(pat, n.__gd_node_name__) && (type === "" || n.__gd_engine_class__ === type) && (!owned || ownedBy(rec, n)));
      return V.array(GArray.of(hits.map((n) => V.object(n as unknown as object))));
    }
    case "find_parent": {
      const pat = pathArg(args, name);
      let cur = nodeFaceOf(rec.__gd_node_parent__);
      while (cur !== null) {
        if (globMatch(pat, cur.__gd_node_name__)) return V.object(cur as unknown as object);
        cur = nodeFaceOf(cur.__gd_node_parent__);
      }
      return V.object(NULL_OBJECT);
    }
    case "get_path_to": {
      const other = childArg(args, name);
      return nodePathValue(pathTo(rec, other));
    }
    case "is_ancestor_of": {
      const other = childArg(args, name);
      return V.bool(other !== rec && ancestry(other).includes(rec));
    }
    case "is_greater_than": {
      const other = childArg(args, name);
      const a = indexPath(rec);
      const b = indexPath(other);
      let out = false;
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) {
        if (a[i] !== b[i]) {
          out = (a[i] as number) > (b[i] as number);
          return V.bool(out);
        }
      }
      return V.bool(a.length > b.length);
    }
    case "add_sibling": {
      const sibling = childArg(args, name);
      const parent = nodeFaceOf(rec.__gd_node_parent__);
      if (parent === null) throw new UnsupportedError("node-no-parent", "add_sibling() 落在没有父亲的节点上，这一形没建模");
      nodeAttach(parent, sibling);
      nodeMoveChild(parent, sibling, parent.__gd_node_children__.indexOf(rec as unknown as object) + 1);
      return V.nil();
    }
    case "reparent": {
      const next = childArg(args, name);
      const keep = boolArg(args, 1, true);
      const before = keep && rec.__gd_engine_class__ === "Node2D" ? node2dGlobalTransform(rec) : null;
      const old = nodeFaceOf(rec.__gd_node_parent__);
      if (old !== null) nodeDetach(old, rec);
      nodeAttach(next, rec);
      if (before !== null) node2dApplyGlobal(rec, before);
      return V.nil();
    }
    case "replace_by": {
      const next = childArg(args, name);
      const keepGroups = boolArg(args, 1, false);
      const parent = nodeFaceOf(rec.__gd_node_parent__);
      if (parent === null) throw new UnsupportedError("node-no-parent", "replace_by() 落在没有父亲的节点上，这一形没建模");
      const at = parent.__gd_node_children__.indexOf(rec as unknown as object);
      nodeDetach(parent, rec);
      nodeAttach(parent, next);
      nodeMoveChild(parent, next, at);
      if (keepGroups) for (const g of rec.__gd_node_groups__) nodeAddToGroup(next, g);
      return V.nil();
    }
    case "get_owner": {
      const owner = rec.__gd_node_owner__;
      return owner === null ? V.object(NULL_OBJECT) : V.object(owner);
    }
    case "set_owner": {
      const v = args[0];
      if (v === undefined) throw new UnsupportedError("node-arity", "set_owner() 少了实参");
      if (v.t === Tag.NIL) {
        rec.__gd_node_owner__ = null;
        return V.nil();
      }
      rec.__gd_node_owner__ = childArg(args, name) as unknown as object;
      return V.nil();
    }
    case "is_node_ready":
      return V.bool(rec.__gd_node_ready__);
    case "request_ready":
      rec.__gd_node_ready__ = false;
      return V.nil();
    case "notification": {
      const what = args[0];
      if (what === undefined || (what.t !== Tag.INT && what.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "notification() 的编号只量过数");
      const dispatched = (rec as unknown as GdScriptObject).__gdDispatch("_notification", [V.int(Number(what.v))]);
      return dispatched === null ? V.nil() : dispatched;
    }
    case "propagate_notification": {
      const what = args[0];
      if (what === undefined || (what.t !== Tag.INT && what.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "propagate_notification() 的编号只量过数");
      const all: NodeRec[] = [];
      collectDescendants(rec, true, all);
      for (const n of all) (n as unknown as GdScriptObject).__gdDispatch("_notification", [V.int(Number(what.v))]);
      (rec as unknown as GdScriptObject).__gdDispatch("_notification", [V.int(Number(what.v))]);
      return V.nil();
    }
    case "propagate_call": {
      const mname = args[0];
      if (mname === undefined || (mname.t !== Tag.STRING && mname.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "propagate_call() 的方法名只量过字符串");
      const rest = args.length > 1 && args[1] !== undefined && args[1].t === Tag.ARRAY ? ((args[1].v as GArray).raw() as Variant[]) : [];
      const parentFirst = boolArg(args, 2, false);
      const all: NodeRec[] = [];
      collectDescendants(rec, true, all);
      const list = parentFirst ? [rec, ...all] : [...all.reverse(), rec];
      for (const n of list) {
        const r = callOnNode(n, String(mname.v), rest);
        if (r === null) throw new UnsupportedError("node-propagate-method", `propagate_call() 的方法 ${String(mname.v)}() 没量过`);
      }
      return V.nil();
    }
    case "_input":
    case "_shortcut_input":
    case "_unhandled_input":
    case "_unhandled_key_input":
      return V.nil();
    case "_get_configuration_warnings":
    case "_get_accessibility_configuration_warnings":
      return V.array(GArray.of([]));
    case "_get_focused_accessibility_element":
      return rid(0n);
    case "get_viewport":
    case "get_window":
    case "get_last_exclusive_window": {
      const tree = sceneTree();
      return tree === null ? V.object(NULL_OBJECT) : V.object(tree.root);
    }
    case "get_multiplayer": {
      const tree = sceneTree();
      if (tree === null) return V.object(NULL_OBJECT);
      if (rec.__gd_node_mp_api__ === undefined) rec.__gd_node_mp_api__ = V.object(new GdEngineInstance("SceneMultiplayer"));
      return rec.__gd_node_mp_api__;
    }
    case "get_multiplayer_authority":
      return V.int(rec.__gd_node_mp_authority__ ?? 1);
    case "set_multiplayer_authority": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_multiplayer_authority() 只量过数");
      const id = Math.trunc(Number(v.v));
      const recursive = args[1] !== undefined && args[1].t === Tag.BOOL && args[1].v === true;
      const assign = (n: NodeRec, value: number): void => {
        n.__gd_node_mp_authority__ = value;
        if (!recursive) return;
        for (const c of n.__gd_node_children__) assign(c as NodeRec, value);
      };
      assign(rec, id);
      return V.nil();
    }
    case "is_multiplayer_authority":
      return V.bool(insideTree(rec) && (rec.__gd_node_mp_authority__ ?? 1) === 1);
    case "get_node_rpc_config":
      return rec.__gd_node_rpc_config__ === undefined ? V.nil() : (rec.__gd_node_rpc_config__ as Variant);
    case "rpc_config": {
      const m = args[0];
      if (m === undefined || (m.t !== Tag.STRING && m.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "rpc_config() 的方法名只量过字符串");
      let cfg = rec.__gd_node_rpc_config__ as Variant | undefined;
      if (cfg === undefined) {
        cfg = V.dict(new GDict());
        rec.__gd_node_rpc_config__ = cfg;
      }
      (cfg.v as GDict).set(V.stringName(String(m.v)), args[1] as Variant);
      return V.nil();
    }
    case "rpc":
    case "rpc_id": {
      if (insideTree(rec)) throw new UnsupportedError("node-rpc-in-tree", `${name}() 在树里的返回值没量过`);
      return V.int(3);
    }
    case "to_string": {
      const tag = `<${rec.__gd_engine_class__}#${String(rec.gdObjectId)}>`;
      return V.str(rec.__gd_node_name__ === "" ? tag : `${rec.__gd_node_name__}:${tag}`);
    }
    case "tr":
    case "tr_n": {
      const singular = args[0];
      if (singular === undefined || (singular.t !== Tag.STRING && singular.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", `${name}() 的消息只量过字符串`);
      if (name === "tr") return V.str(String(singular.v));
      const plural = args[1];
      const n = args[2];
      if (plural === undefined || (plural.t !== Tag.STRING && plural.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "tr_n() 的复数消息只量过字符串");
      if (n === undefined || (n.t !== Tag.INT && n.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "tr_n() 的数量只量过数");
      return V.str(Number(n.v) === 1 ? String(singular.v) : String(plural.v));
    }
    case "can_translate_messages":
      return V.bool(rec.__gd_obj_message_translation__ !== false);
    case "set_message_translation":
      rec.__gd_obj_message_translation__ = boolArg(args, 0, true);
      return V.nil();
    case "is_blocking_signals":
      return V.bool(rec.__gd_obj_block_signals__ === true);
    case "set_block_signals":
      rec.__gd_obj_block_signals__ = boolArg(args, 0, false);
      return V.nil();
    case "cancel_free":
    case "notification":
    case "notify_property_list_changed":
      return V.nil();
    case "property_can_revert":
      return V.bool(false);
    case "property_get_revert":
      return V.nil();
    case "get_meta_list":
      return V.array(GArray.of(metaKeys(rec).map((k) => V.stringName(k))));
    case "get_incoming_connections":
      return V.array(GArray.of([]));
    case "get_script":
      return rec.__gd_obj_script__ === undefined ? V.nil() : rec.__gd_obj_script__;
    case "set_script":
      rec.__gd_obj_script__ = args[0] as Variant;
      return V.nil();
    case "get_method_argument_count": {
      const m = args[0];
      if (m === undefined || (m.t !== Tag.STRING && m.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "get_method_argument_count() 的方法名只量过字符串");
      const who = String(m.v);
      if (who === "get_meta" || who === "set_meta") return V.int(2);
      if (who === "has_meta" || who === "remove_meta") return V.int(1);
      return V.int(0);
    }
    case "get_method_list":
    case "get_property_list":
    case "get_signal_list":
      return V.array(GArray.of([]));
    case "get_signal_connection_list": {
      const sg = nodeSignalOf(rec, asString(args[0] as Variant, "信号名"));
      if (sg === null) return V.array(GArray.of([]));
      const out: Variant[] = [];
      for (const row of sg.connections()) {
        const d = new GDict();
        d.set(V.str("signal"), V.object(sg));
        d.set(V.str("callable"), V.object(row.box));
        d.set(V.str("flags"), V.int(row.flags));
        out.push(V.dict(d));
      }
      return V.array(GArray.of(out));
    }
    case "has_connections": {
      const sg = nodeSignalOf(rec, asString(args[0] as Variant, "信号名"));
      return V.bool(sg !== null && sg.hasConnections());
    }
    case "get_indexed": {
      const p = args[0];
      if (p === undefined || (p.t !== Tag.STRING && p.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "get_indexed() 的路径只量过字符串");
      const path = String(p.v);
      if (path.includes(":") || path.includes("/")) throw new UnsupportedError("node-indexed-path", `get_indexed("${path}") 的复合路径没量过`);
      if (NODE_PROP_READ === null) throw new UnsupportedError("node-prop-read", "节点属性读取钩子未注册");
      return NODE_PROP_READ(rec, path);
    }
    case "set_indexed": {
      const p = args[0];
      if (p === undefined || (p.t !== Tag.STRING && p.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "set_indexed() 的路径只量过字符串");
      const path = String(p.v);
      if (path.includes(":") || path.includes("/")) throw new UnsupportedError("node-indexed-path", `set_indexed("${path}") 的复合路径没量过`);
      if (NODE_PROP_WRITE === null) throw new UnsupportedError("node-prop-write", "节点属性写入钩子未注册");
      NODE_PROP_WRITE(rec, path, args[1] as Variant);
      return V.nil();
    }
    case "atr":
    case "atr_n": {
      const msg = args[0];
      if (msg === undefined || (msg.t !== Tag.STRING && msg.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", `${name}() 的消息只量过字符串`);
      if (name === "atr") return V.str(String(msg.v));
      const plural = args[1];
      const n = args[2];
      if (plural === undefined || (plural.t !== Tag.STRING && plural.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "atr_n() 的复数消息只量过字符串");
      if (n === undefined || (n.t !== Tag.INT && n.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "atr_n() 的数量只量过数");
      return V.str(Number(n.v) === 1 ? String(msg.v) : String(plural.v));
    }
    case "can_auto_translate":
      return V.bool(true);
    case "get_auto_translate_mode":
      return V.int(rec.__gd_node_auto_translate_mode__ ?? 0);
    case "set_auto_translate_mode": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_auto_translate_mode() 只量过数");
      rec.__gd_node_auto_translate_mode__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "get_editor_description":
      return V.str(rec.__gd_node_editor_description__ ?? "");
    case "set_editor_description": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "set_editor_description() 只量过字符串");
      rec.__gd_node_editor_description__ = String(v.v);
      return V.nil();
    }
    case "is_part_of_edited_scene":
      return V.bool(false);
    case "is_unique_name_in_owner":
      return V.bool(rec.__gd_node_unique_in_owner__ === true);
    case "set_unique_name_in_owner":
      rec.__gd_node_unique_in_owner__ = boolArg(args, 0, false);
      return V.nil();
    case "is_editable_instance":
      return V.bool(false);
    case "set_editable_instance":
      return V.nil();
    case "set_display_folded":
      return V.nil();
    case "get_scene_instance_load_placeholder":
      return V.bool(rec.__gd_node_scene_placeholder__ === true);
    case "set_scene_instance_load_placeholder":
      rec.__gd_node_scene_placeholder__ = boolArg(args, 0, false);
      return V.nil();
    case "get_physics_interpolation_mode":
      return V.int(rec.__gd_node_physics_interp__ ?? 0);
    case "set_physics_interpolation_mode": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_physics_interpolation_mode() 只量过数");
      rec.__gd_node_physics_interp__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "reset_physics_interpolation":
      return V.nil();
    case "get_process_thread_group":
      return V.int(rec.__gd_node_thread_group__ ?? 0);
    case "set_process_thread_group": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_process_thread_group() 只量过数");
      rec.__gd_node_thread_group__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "get_process_thread_group_order":
      return V.int(rec.__gd_node_thread_order__ ?? 0);
    case "set_process_thread_group_order": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_process_thread_group_order() 只量过数");
      rec.__gd_node_thread_order__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "get_process_thread_messages":
      return V.int(rec.__gd_node_thread_messages__ ?? 0);
    case "set_process_thread_messages": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_process_thread_messages() 只量过数");
      rec.__gd_node_thread_messages__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "is_processing_input":
      return V.bool(rec.__gd_node_process_input__ === true);
    case "set_process_input":
      rec.__gd_node_process_input__ = boolArg(args, 0, false);
      return V.nil();
    case "is_processing_shortcut_input":
      return V.bool(rec.__gd_node_process_shortcut__ === true);
    case "set_process_shortcut_input":
      rec.__gd_node_process_shortcut__ = boolArg(args, 0, false);
      return V.nil();
    case "is_processing_unhandled_input":
      return V.bool(rec.__gd_node_process_unhandled__ === true);
    case "set_process_unhandled_input":
      rec.__gd_node_process_unhandled__ = boolArg(args, 0, false);
      return V.nil();
    case "is_processing_unhandled_key_input":
      return V.bool(rec.__gd_node_process_unhandled_key__ === true);
    case "set_process_unhandled_key_input":
      rec.__gd_node_process_unhandled_key__ = boolArg(args, 0, false);
      return V.nil();
    case "set_process_internal":
    case "set_physics_process_internal":
      return V.nil();
    case "get_translation_domain":
      return V.str(rec.__gd_node_translation_domain__ ?? "");
    case "set_translation_domain": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "set_translation_domain() 只量过字符串");
      rec.__gd_node_translation_domain__ = String(v.v);
      return V.nil();
    }
    case "set_translation_domain_inherited": {
      const parent = nodeFaceOf(nodeParent(rec));
      rec.__gd_node_translation_domain__ = parent?.__gd_node_translation_domain__ ?? "";
      return V.nil();
    }
    case "set_message_translation":
      return V.nil();
    case "call_thread_safe":
    case "call_deferred_thread_group": {
      const m = args[0];
      if (m === undefined || (m.t !== Tag.STRING && m.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", `${name}() 的方法名只量过字符串`);
      return nodeMethod(rec, String(m.v), args.slice(1));
    }
    case "set_deferred_thread_group":
    case "set_thread_safe":
    case "set_deferred": {
      const p = args[0];
      if (p === undefined || (p.t !== Tag.STRING && p.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", `${name}() 的属性名只量过字符串`);
      const v = args[1] as Variant;
      if (NODE_PROP_WRITE === null) throw new UnsupportedError("node-prop-write", "节点属性写入钩子未注册");
      if (name === "set_deferred_thread_group" || name === "set_deferred") {
        callDeferred(() => (NODE_PROP_WRITE as NodePropWriteHook)(rec, String(p.v), v));
        return V.nil();
      }
      NODE_PROP_WRITE(rec, String(p.v), v);
      return V.nil();
    }
    case "notify_thread_safe":
    case "notify_deferred_thread_group": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", `${name}() 只量过数`);
      return V.nil();
    }
    case "get_orphan_node_ids":
      return V.object(new GBytes([], "int64"));
    case "print_orphan_nodes":
      return V.nil();
    case "queue_accessibility_update":
    case "update_configuration_warnings":
      return V.nil();
    case "get_accessibility_element":
      return rid(0n);
    case "_enter_tree":
    case "_exit_tree":
    case "_ready":
    case "_process":
    case "_physics_process":
      return V.nil();
    case "set_process": {
      rec.__gd_node_process__ = args[0] === undefined ? true : args[0].t === Tag.BOOL && args[0].v === true;
      return V.nil();
    }
    case "is_processing":
      return V.bool(insideTree(rec) && rec.__gd_node_process__ !== false);
    case "set_physics_process": {
      rec.__gd_node_physics__ = args[0] === undefined ? true : args[0].t === Tag.BOOL && args[0].v === true;
      return V.nil();
    }
    case "is_physics_processing":
      return V.bool(insideTree(rec) && rec.__gd_node_physics__ !== false);
    case "set_process_mode": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_process_mode() 只量过数");
      rec.__gd_node_process_mode__ = Number(v.v);
      return V.nil();
    }
    case "get_process_mode":
      return V.int(rec.__gd_node_process_mode__);
    case "get_reference_count":
      return V.int(rec.__gd_refcount__ ?? 1);
    case "reference": {
      const n = rec.__gd_refcount__ ?? 1;
      if (n <= 0) return V.bool(false);
      rec.__gd_refcount__ = n + 1;
      return V.bool(true);
    }
    case "unreference": {
      const n = rec.__gd_refcount__ ?? 1;
      if (n <= 0) return V.bool(false);
      rec.__gd_refcount__ = n - 1;
      return V.bool(rec.__gd_refcount__ === 0);
    }
    case "init_ref": {
      const n = rec.__gd_refcount__ ?? 1;
      rec.__gd_refcount__ = n + 1;
      return V.bool(true);
    }
    case "get_scene_file_path":
      return V.str(rec.__gd_scene_file_path__);
    case "set_scene_file_path": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "set_scene_file_path() 只量过字符串");
      rec.__gd_scene_file_path__ = String(v.v);
      return V.nil();
    }
    case "get_process_priority":
      return V.int(rec.__gd_node_process_priority__);
    case "set_process_priority": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_process_priority() 只量过数");
      rec.__gd_node_process_priority__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "get_physics_process_priority":
      return V.int(rec.__gd_node_physics_priority__);
    case "set_physics_process_priority": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "set_physics_process_priority() 只量过数");
      rec.__gd_node_physics_priority__ = Math.trunc(Number(v.v));
      return V.nil();
    }
    case "is_processing_internal":
    case "is_physics_processing_internal":
      return V.bool(false);
    case "is_physics_interpolated":
      return V.bool(true);
    case "is_physics_interpolated_and_enabled":
      return V.bool(false);
    case "is_displayed_folded":
      return V.bool(false);
    case "get_process_delta_time": {
      const tree = sceneTree();
      return V.float(tree === null ? 1 / 60 : tree.processDt);
    }
    case "get_physics_process_delta_time": {
      const tree = sceneTree();
      return V.float(tree === null ? 1 / 60 : tree.processDt);
    }
    case "create_tween": {
      const tree = sceneTree();
      if (tree === null) throw new UnsupportedError("node-no-tree", "不在树里的 create_tween() 这一形没建模");
      return treeCreateTween(tree);
    }
    case "duplicate": {
      const flags = args[0];
      if (flags !== undefined && (flags.t !== Tag.INT && flags.t !== Tag.FLOAT)) throw new UnsupportedError("node-arg-type", "duplicate() 的 flags 只量过数");
      return V.object(cloneEngineNode(rec) as unknown as object);
    }
    case "get_tree_string":
    case "get_tree_string_pretty": {
      const pretty = name.endsWith("pretty");
      const lines: string[] = [pretty ? ` ┖╴${rec.__gd_node_name__}` : "."];
      const walk = (node: NodeRec, prefix: string, path: string): void => {
        node.__gd_node_children__.forEach((child, i) => {
          const f = nodeFaceOf(child);
          if (f === null) return;
          const last = i === node.__gd_node_children__.length - 1;
          if (pretty) lines.push(`${prefix}${last ? " ┖╴" : " ┠╴"}${f.__gd_node_name__}`);
          else lines.push(path === "" ? f.__gd_node_name__ : `${path}/${f.__gd_node_name__}`);
          walk(f, `${prefix}   `, path === "" ? f.__gd_node_name__ : `${path}/${f.__gd_node_name__}`);
        });
      };
      walk(rec, "   ", "");
      return V.str(lines.join("\n"));
    }
    case "print_tree":
    case "print_tree_pretty": {
      const pretty = name.endsWith("pretty");
      const lines = pretty ? [` ┖╴${rec.__gd_node_name__}`] : ["."];
      const walk = (node: NodeRec, prefix: string, path: string): void => {
        node.__gd_node_children__.forEach((child, i) => {
          const f = nodeFaceOf(child);
          if (f === null) return;
          const last = i === node.__gd_node_children__.length - 1;
          if (pretty) lines.push(`${prefix}${last ? " ┖╴" : " ┠╴"}${f.__gd_node_name__}`);
          else lines.push(path === "" ? f.__gd_node_name__ : `${path}/${f.__gd_node_name__}`);
          walk(f, `${prefix}   `, path === "" ? f.__gd_node_name__ : `${path}/${f.__gd_node_name__}`);
        });
      };
      walk(rec, "   ", "");
      for (const l of lines) printLine(l);
      return V.nil();
    }
    case "can_process": {
      const tree = sceneTree();
      return V.bool(nodeCanProcess(rec, tree !== null && tree.paused));
    }
    case "set_deferred": {
      const mname = args[0];
      if (mname === undefined || (mname.t !== Tag.STRING && mname.t !== Tag.STRING_NAME)) throw new UnsupportedError("node-arg-type", "set_deferred() 的方法名只量过字符串");
      const rest = args.length > 1 && args[1] !== undefined && args[1].t === Tag.ARRAY ? ((args[1].v as GArray).raw() as Variant[]) : [];
      callDeferred(() => {
        if (callOnNode(rec, String(mname.v), rest) === null) throw new UnsupportedError("node-set-deferred", `set_deferred() 的方法 ${String(mname.v)}() 没量过`);
      });
      return V.nil();
    }
    case "get_node": {
      const want = pathArg(args, name);
      const hit = nodeWalkOr(rec, want);
      if (hit === null) {
        engineError("get_node (scene/main/node.cpp:1963)", `Node not found: "${want}" (relative to "${rec.__gd_node_name__}").`);
        return V.object(NULL_OBJECT);
      }
      return V.object(hit);
    }
    case "get_node_or_null": {
      const hit = nodeWalkOr(rec, pathArg(args, name));
      return hit === null ? V.object(NULL_OBJECT) : V.object(hit);
    }
    case "has_node":
      return V.bool(nodeWalkOr(rec, pathArg(args, name)) !== null);
    case "get_node_and_resource": {
      const hit = nodeWalkOr(rec, pathArg(args, name));
      if (hit === null) return V.array(GArray.of([]));
      return V.array(GArray.of([V.object(hit), V.nil(), nodePathValue("")]));
    }
    case "has_node_and_resource":
      return V.bool(nodeWalkOr(rec, pathArg(args, name)) !== null);
    case "is_inside_tree":
      return V.bool(insideTree(rec));
    case "free":
      nodeFree(rec);
      return V.nil();
    case "queue_free":
      nodeQueueFree(rec);
      return V.nil();
    case "is_queued_for_deletion":
      return V.bool(rec.__gd_node_queued__);
    case "set_name":
      nodeNameSet(rec, asString(args[0] as Variant, "属性写入"));
      return V.nil();
    case "get_name":
      return V.stringName(rec.__gd_node_name__);
    case "add_to_group": {
      if (args.length === 0 || args.length > 2) throw new UnsupportedError("node-arity", `add_to_group() 只量过 1 与 2 个实参（收到 ${args.length} 个）`);
      const group = groupArg(args, name);
      if (group === "") {
        engineError("add_to_group (scene/main/node.cpp:2448)", `Cannot add node '${rec.__gd_node_name__}' to a group with an empty name.`);
        return V.nil();
      }
      nodeAddToGroup(rec, group);
      return V.nil();
    }
    case "remove_from_group":
      nodeRemoveFromGroup(rec, groupArg(args, name));
      return V.nil();
    case "is_in_group":
      return V.bool(nodeIsInGroup(rec, groupArg(args, name)));
    case "get_groups":
      if (args.length !== 0) throw new UnsupportedError("node-arity", `get_groups() 只量过 0 个实参（收到 ${args.length} 个）`);
      return V.array(GArray.of(nodeGroups(rec)));
    case "get_tree": {
      const tree = sceneTree();
      if (tree === null || !insideTree(rec)) {
        engineError("get_tree (scene/main/node.h:549)", 'Parameter "data.tree" is null.');
        return V.object(NULL_OBJECT);
      }
      return V.object(tree);
    }
    case "get_path": {
      const tree = sceneTree();
      if (tree === null || !insideTree(rec)) {
        engineError("get_path (scene/main/node.cpp:2419)", "Cannot get path of node as it is not in a scene tree.");
        return nodePathValue("");
      }
      return nodePathValue(scenePathOf(rec as unknown as object));
    }
    case "show":
    case "hide":
    case "is_visible_in_tree": {
      if (rec.__gd_engine_class__ === "Node3D") {
        throw new UnsupportedError("node3d-method", `Node3D.${name}() 这一支没量过（引擎里 show / hide 是 CanvasItem 那一族，Node3D 身上只量过 visible 读写）`);
      }
      if (rec.__gd_engine_class__ === "Control") {
        const cm = ctlMethod(target, name, args);
        if (cm !== null) return cm;
      }
      return node2dMethod(target, name, args);
    }
    case "get_global_transform": {
      if (rec.__gd_engine_class__ === "Node3D") return node3dGlobalTransform(target);
      if (rec.__gd_engine_class__ === "Control") {
        const cm = ctlMethod(target, name, args);
        if (cm !== null) return cm;
      }
      return node2dMethod(target, name, args);
    }
    default:
      throw new UnsupportedError("node-method", `Node.${name}() 这一支没量过（duplicate / find_child / get_path_to / has_method 那几支还没建模）`);
  }
}
