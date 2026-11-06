import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray } from "../../values";
import { NULL_OBJECT } from "../identity/null-object";
import { nodePathValue } from "../identity/node-path";
import { asString } from "../../method/core";
import { stackBlockLines, writeOrderedStderr } from "../../frames";
import {
  nodeArgSay,
  nodeAttach,
  nodeCanProcess,
  nodeDetach,
  nodeFaceOf,
  nodeFree,
  nodeGroups,
  nodeAddToGroup,
  nodeIsInGroup,
  nodeRemoveFromGroup,
  nodeMoveChild,
  nodeQueueFree,
  nodeOfVariant,
  nodeNameSet,
  type NodeRec,
} from "./node";
import { callDeferred } from "../identity/callable";
import { getMeta, hasMeta, removeMeta, setMeta, GdScriptObject } from "./script-object";
import { scenePathOf, sceneTree, treeCreateTween } from "./scene-tree";
import { node2dApplyGlobal, node2dGlobalTransform, node2dMethod } from "./node2d";
import { node3dGlobalTransform, node3dMethod } from "./node3d";
import { ctlMethod } from "./control";

const NODE2D_METHODS = new Set(["to_local", "to_global", "rotate", "translate", "move_local_x", "move_local_y", "apply_scale", "get_relative_transform_to_parent"]);
const NODE3D_METHODS = new Set(["to_local", "to_global", "translate", "orthonormalize", "get_parent_node_3d"]);

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
  if (rec.__gd_engine_class__ === "Node3D" && NODE3D_METHODS.has(name)) {
    const hit = node3dMethod(target, name, args);
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
