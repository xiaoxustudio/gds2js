import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GdScriptObject, markFreed } from "./script-object";

const CONSTRUCTIBLE = new Set(["Node", "Node2D", "Control", "Node3D", "RefCounted", "Object"]);

export class GdNodeObject extends GdScriptObject {
  __gd_engine_class__: string = "";
  __gd_freed__: boolean = false;
  __gd_node_queued__: boolean = false;
  __gd_node_t2d__?: unknown;
  __gd_node_visible__?: boolean;
  __gd_node_top_level__?: boolean;
  __gd_ctl__?: unknown;
  __gd_node_t3d__?: unknown;
  __gd_node_name__: string = "";
  __gd_node_parent__: object | null = null;
  __gd_node_children__: object[] = [];
  __gd_node_groups__: string[] = [];
}

export type NodeRec = GdNodeObject;

export class GdEngineInstance extends GdNodeObject {
  constructor(cls: string) {
    super();
    this.__gd_engine_class__ = cls;
  }
}

export function engineClassNewable(cls: string): boolean {
  return CONSTRUCTIBLE.has(cls);
}

export function engineClassNew(cls: string): Variant {
  if (!CONSTRUCTIBLE.has(cls)) throw new UnsupportedError("engine-class-ctor", `${cls}.new() 这一支没量过（只量过 Node / Node2D / Control / Node3D / RefCounted / Object）`);
  return V.object(new GdEngineInstance(cls));
}

export function nodeInit(inst: object, cls: string): void {
  const rec = inst as unknown as NodeRec;
  rec.__gd_engine_class__ = cls;
  rec.__gd_node_queued__ = false;
  rec.__gd_node_name__ = "";
  rec.__gd_node_parent__ = null;
  rec.__gd_node_children__ = [];
  rec.__gd_node_groups__ = [];
}

const NAME_BAD = /[:.@/]/g;

export function nodeFaceOf(target: unknown): NodeRec | null {
  if (typeof target !== "object" || target === null) return null;
  const probe = target as Partial<GdNodeObject>;
  if (typeof probe.__gd_engine_class__ !== "string" || !Array.isArray(probe.__gd_node_children__)) return null;
  return target as unknown as GdNodeObject;
}

export function isEngineNode(target: unknown): boolean {
  return nodeFaceOf(target) !== null;
}

export function nodeClass(target: unknown): string {
  const rec = nodeFaceOf(target);
  return rec === null ? "" : rec.__gd_engine_class__;
}

export function nodeName(target: unknown): string {
  const rec = nodeFaceOf(target);
  return rec === null ? "" : rec.__gd_node_name__;
}

export function nodeChildren(target: unknown): object[] {
  const rec = nodeFaceOf(target);
  return rec === null ? [] : rec.__gd_node_children__;
}

export function nodeParent(target: unknown): object | null {
  const rec = nodeFaceOf(target);
  return rec === null ? null : rec.__gd_node_parent__;
}

export function nodeNameSet(node: NodeRec, raw: string): void {
  if (raw === "") throw new UnsupportedError("node-name-empty", "把 name 写成空串那一形没建模：引擎发 ERROR 且留着原名");
  node.__gd_node_name__ = raw.replace(NAME_BAD, "_");
}

function autoName(node: NodeRec): string {
  return `@${node.__gd_engine_class__}@${String((node as unknown as GdScriptObject).gdObjectId)}`;
}

export function nodeAttach(parent: NodeRec, child: NodeRec): void {
  if (child === parent) throw new UnsupportedError("node-add-self", "add_child(self) 那一形没建模：引擎发 ERROR 并什么都不做");
  if (child.__gd_node_parent__ !== null) throw new UnsupportedError("node-already-parented", "把已有父亲的节点再 add_child 那一形没建模：引擎发 ERROR 并什么都不做");
  if (child.__gd_node_name__ === "" || parent.__gd_node_children__.some((c) => nodeName(c) === child.__gd_node_name__)) {
    child.__gd_node_name__ = autoName(child);
  }
  child.__gd_node_parent__ = parent as unknown as object;
  parent.__gd_node_children__.push(child as unknown as object);
}

export function nodeDetach(parent: NodeRec, child: NodeRec): void {
  const at = parent.__gd_node_children__.indexOf(child as unknown as object);
  if (at < 0) throw new UnsupportedError("node-remove-nonchild", "remove_child 一个不是自己孩子的节点那一形没量过");
  parent.__gd_node_children__.splice(at, 1);
  child.__gd_node_parent__ = null;
}

export function nodeMoveChild(parent: NodeRec, child: NodeRec, to: number): void {
  const at = parent.__gd_node_children__.indexOf(child as unknown as object);
  if (at < 0) throw new UnsupportedError("node-move-nonchild", "move_child 一个不是自己孩子的节点那一形没量过");
  if (to < 0 || to >= parent.__gd_node_children__.length) throw new UnsupportedError("node-move-oob", "move_child 越界那一形没量过");
  parent.__gd_node_children__.splice(at, 1);
  parent.__gd_node_children__.splice(to, 0, child as unknown as object);
}

const QUEUED: NodeRec[] = [];

export function nodeQueueFree(node: NodeRec): void {
  node.__gd_node_queued__ = true;
  QUEUED.push(node);
}

export function nodeDrainQueued(): void {
  while (QUEUED.length > 0) {
    const next = QUEUED.shift() as NodeRec;
    if (next.__gd_freed__) continue;
    nodeFree(next);
  }
}

export function nodeFree(node: NodeRec): void {
  const parent = node.__gd_node_parent__;
  const up = nodeFaceOf(parent);
  if (up !== null) nodeDetach(up, node);
  freeSubtree(node);
}

function freeSubtree(node: NodeRec): void {
  for (const c of node.__gd_node_children__.slice()) {
    const cf = nodeFaceOf(c);
    if (cf !== null) freeSubtree(cf);
  }
  node.__gd_node_children__.length = 0;
  markFreed(node as unknown as object);
}

export function nodeOfVariant(value: Variant): NodeRec | null {
  return nodeFaceOf(value.t === Tag.OBJECT ? value.v : null);
}

export function nodeArgSay(value: Variant, who: string): never {
  throw new UnsupportedError("node-arg-type", `Node.${who}() 的这条只收节点（收到 ${tagName(value.t)}）`);
}

export function nodeAddToGroup(rec: NodeRec, group: string): void {
  if (!rec.__gd_node_groups__.includes(group)) rec.__gd_node_groups__.push(group);
}

export function nodeRemoveFromGroup(rec: NodeRec, group: string): void {
  const at = rec.__gd_node_groups__.indexOf(group);
  if (at >= 0) rec.__gd_node_groups__.splice(at, 1);
}

export function nodeIsInGroup(rec: NodeRec, group: string): boolean {
  return rec.__gd_node_groups__.includes(group);
}

export function nodeGroups(rec: NodeRec): Variant[] {
  return rec.__gd_node_groups__.map((g) => V.stringName(g));
}

export function nodeIsInside(node: object, treeRoot: object): boolean {
  let cur: object | null = node;
  for (;;) {
    if (cur === treeRoot) return true;
    cur = nodeParent(cur);
    if (cur === null) return false;
  }
}

export function nodeHasPath(node: object, treeRoot: object): boolean {
  return nodeIsInside(node, treeRoot);
}

export function nodePathOf(node: object, treeRoot: object): string {
  const names: string[] = [];
  let cur: object | null = node;
  while (cur !== null && cur !== treeRoot) {
    names.unshift(nodeName(cur));
    cur = nodeParent(cur);
  }
  if (cur === null) throw new UnsupportedError("node-path-unbuilt", "不在树里的 get_path() 这一形没建模：引擎发 ERROR 并回空 NodePath");
  return names.length === 0 ? `/${nodeName(treeRoot)}` : `/${nodeName(treeRoot)}/${names.join("/")}`;
}
