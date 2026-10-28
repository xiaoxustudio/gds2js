import { Tag, V, tagName, type Variant } from "../tags";
import { UnsupportedError } from "../errors";
import { GArray } from "../values";
import { NULL_OBJECT } from "../identity";
import { nodePathValue } from "../node-path";
import { asString } from "./core";
import { stackBlockLines, writeOrderedStderr } from "../frames";
import {
  nodeArgSay,
  nodeAttach,
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
} from "../node";
import { scenePathOf, sceneTree } from "../scene";
import { node2dMethod } from "../node2d";
import { ctlMethod } from "../control";

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

export function nodeMethod(target: unknown, name: string, args: Variant[]): Variant {
  const rec = nodeFaceOf(target);
  if (rec === null) throw new UnsupportedError("node-face-missing", `${name}() 要落在带节点面的对象上`);
  if (name === "get_class") return V.str(rec.__gd_engine_class__);
  if (rec.__gd_freed__) throw new UnsupportedError("node-freed-call", `在已 free() 的实例上调 ${name}() 那一形没建模：引擎发 SCRIPT ERROR 并中断脚本`);
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
      nodeMoveChild(rec, childArg(args, name), indexArg(args[1], name));
      return V.nil();
    }
    case "get_child": {
      const at = indexArg(args[0], name);
      const hit = rec.__gd_node_children__[at];
      if (at < 0 || hit === undefined) throw new UnsupportedError("node-child-oob", "get_child() 越界那一形没建模：引擎发 ERROR 并回 null");
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
    case "get_node": {
      const hit = nodeWalkOr(rec, pathArg(args, name));
      if (hit === null) throw new UnsupportedError("node-path-shape", "Node.get_node() 走不通的路径那一形没建模：引擎发 ERROR 并回 null");
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
      return V.str(rec.__gd_node_name__);
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
    case "is_visible_in_tree":
    case "get_global_transform": {
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
