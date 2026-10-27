import { Tag, V, tagName, type Variant } from "../tags";
import { UnsupportedError } from "../errors";
import { GArray } from "../values";
import { NULL_OBJECT } from "../identity";
import { asString } from "./core";
import {
  GdEngineInstance,
  isEngineNode,
  nodeArgSay,
  nodeAttach,
  nodeDetach,
  nodeFree,
  nodeMoveChild,
  nodeOf,
  nodeNameSet,
} from "../node";

function pathText(v: Variant | undefined): string {
  if (v === undefined) throw new UnsupportedError("node-arity", "路径实参缺了");
  return asString(v, "路径实参");
}

function walkParts(node: GdEngineInstance, parts: string[]): GdEngineInstance | null {
  let cur: GdEngineInstance = node;
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") {
      const up = cur.__gd_node_parent__;
      if (up === null) return null;
      cur = up;
      continue;
    }
    const hit = cur.__gd_node_children__.find((c) => c.__gd_node_name__ === p);
    if (hit === undefined) return null;
    cur = hit;
  }
  return cur;
}

function nodeWalkOr(node: GdEngineInstance, text: string): GdEngineInstance | null {
  if (text === "" || text.startsWith("/") || text.startsWith("%")) return null;
  return walkParts(node, text.split("/"));
}

function childArg(args: Variant[], name: string): GdEngineInstance {
  const a = args[0] as Variant | undefined;
  if (a === undefined) throw new UnsupportedError("node-arity", `Node.${name}() 少了子节点实参`);
  const c = nodeOf(a);
  if (c === null) nodeArgSay(a, name);
  return c as GdEngineInstance;
}

function indexArg(v: Variant | undefined, name: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) {
    throw new UnsupportedError("node-arg-type", `Node.${name}() 的下标只量过数（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  }
  return Number(v.v);
}

export function engineInstanceMethod(inner: GdEngineInstance, name: string, args: Variant[]): Variant {
  if (name === "get_class") return V.str(inner.__gd_engine_class__);
  if (!isEngineNode(inner)) throw new UnsupportedError("engine-class-method", `${inner.__gd_engine_class__}.${name}() 这一支没量过`);
  if (inner.__gd_freed__) throw new UnsupportedError("node-freed-call", `在已 free() 的实例上调 ${name}() 那一形没建模：引擎发 SCRIPT ERROR 并中断脚本`);
  switch (name) {
    case "add_child": {
      if (args.length === 0 || args.length > 2) throw new UnsupportedError("node-arity", `add_child() 只量过 1 与 2 个实参（收到 ${args.length} 个）`);
      nodeAttach(inner, childArg(args, name));
      return V.nil();
    }
    case "remove_child": {
      nodeDetach(inner, childArg(args, name));
      return V.nil();
    }
    case "move_child": {
      nodeMoveChild(inner, childArg(args, name), indexArg(args[1], name));
      return V.nil();
    }
    case "get_child": {
      const at = indexArg(args[0], name);
      const hit = inner.__gd_node_children__[at];
      if (at < 0 || hit === undefined) throw new UnsupportedError("node-child-oob", "get_child() 越界那一形没建模：引擎发 ERROR 并回 null");
      return V.object(hit);
    }
    case "get_child_count":
      return V.int(inner.__gd_node_children__.length);
    case "get_children": {
      const out: Variant[] = [];
      for (const c of inner.__gd_node_children__) out.push(V.object(c));
      return V.array(GArray.of(out));
    }
    case "get_parent": {
      const p = inner.__gd_node_parent__;
      return p === null ? V.object(NULL_OBJECT) : V.object(p);
    }
    case "get_index": {
      const p = inner.__gd_node_parent__;
      return V.int(p === null ? -1 : p.__gd_node_children__.indexOf(inner));
    }
    case "get_node": {
      const hit = nodeWalkOr(inner, pathText(args[0]));
      if (hit === null) throw new UnsupportedError("node-path-shape", "Node.get_node() 走不通的路径那一形没建模：引擎发 ERROR 并回 null");
      return V.object(hit);
    }
    case "get_node_or_null": {
      const hit = nodeWalkOr(inner, pathText(args[0]));
      return hit === null ? V.object(NULL_OBJECT) : V.object(hit);
    }
    case "has_node":
      return V.bool(nodeWalkOr(inner, pathText(args[0])) !== null);
    case "is_inside_tree":
      return V.bool(false);
    case "free":
      nodeFree(inner);
      return V.nil();
    case "set_name":
      nodeNameSet(inner, asString(args[0] as Variant, "set_name() 的实参"));
      return V.nil();
    case "get_name":
      return V.str(inner.__gd_node_name__);
    default:
      throw new UnsupportedError("node-method", `Node.${name}() 这一支没量过（queue_free / duplicate / find_child / get_path / get_tree 那几支还没建模）`);
  }
}
