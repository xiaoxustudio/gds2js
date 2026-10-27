import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { GdScriptObject, markFreed } from "./object";

const NODE_CLASSES = new Set(["Node", "Node2D"]);
const CONSTRUCTIBLE = new Set(["Node", "Node2D", "RefCounted", "Object"]);

export class GdEngineInstance extends GdScriptObject {
  readonly __gd_engine_class__: string;
  __gd_freed__: boolean = false;
  __gd_node_name__: string = "";
  __gd_node_parent__: GdEngineInstance | null = null;
  __gd_node_children__: GdEngineInstance[] = [];
  constructor(cls: string) {
    super();
    this.__gd_engine_class__ = cls;
  }
}

export function engineInstanceClass(inner: unknown): string | null {
  return inner instanceof GdEngineInstance ? inner.__gd_engine_class__ : null;
}

export function isEngineNode(inner: unknown): boolean {
  return inner instanceof GdEngineInstance && NODE_CLASSES.has(inner.__gd_engine_class__);
}

export function engineClassNewable(cls: string): boolean {
  return CONSTRUCTIBLE.has(cls);
}

export function engineClassNew(cls: string): Variant {
  if (!CONSTRUCTIBLE.has(cls)) throw new UnsupportedError("engine-class-ctor", `${cls}.new() 这一支没量过（只量过 Node / Node2D / RefCounted / Object）`);
  return V.object(new GdEngineInstance(cls));
}

const NAME_BAD = /[:.@/]/g;

export function nodeNameSet(node: GdEngineInstance, raw: string): void {
  if (raw === "") throw new UnsupportedError("node-name-empty", "把 name 写成空串那一形没建模：引擎发 ERROR 且留着原名");
  node.__gd_node_name__ = raw.replace(NAME_BAD, "_");
}

function autoName(node: GdEngineInstance): string {
  return `@${node.__gd_engine_class__}@${String(node.gdObjectId)}`;
}

export function nodeAttach(parent: GdEngineInstance, child: GdEngineInstance): void {
  if (child === parent) throw new UnsupportedError("node-add-self", "add_child(self) 那一形没建模：引擎发 ERROR 并什么都不做");
  if (child.__gd_node_parent__ !== null) throw new UnsupportedError("node-already-parented", "把已有父亲的节点再 add_child 那一形没建模：引擎发 ERROR 并什么都不做");
  if (child.__gd_node_name__ === "" || parent.__gd_node_children__.some((c) => c.__gd_node_name__ === child.__gd_node_name__)) {
    child.__gd_node_name__ = autoName(child);
  }
  child.__gd_node_parent__ = parent;
  parent.__gd_node_children__.push(child);
}

export function nodeDetach(parent: GdEngineInstance, child: GdEngineInstance): void {
  const at = parent.__gd_node_children__.indexOf(child);
  if (at < 0) throw new UnsupportedError("node-remove-nonchild", "remove_child 一个不是自己孩子的节点那一形没量过");
  parent.__gd_node_children__.splice(at, 1);
  child.__gd_node_parent__ = null;
}

export function nodeMoveChild(parent: GdEngineInstance, child: GdEngineInstance, to: number): void {
  const at = parent.__gd_node_children__.indexOf(child);
  if (at < 0) throw new UnsupportedError("node-move-nonchild", "move_child 一个不是自己孩子的节点那一形没量过");
  if (to < 0 || to >= parent.__gd_node_children__.length) throw new UnsupportedError("node-move-oob", "move_child 越界那一形没量过");
  parent.__gd_node_children__.splice(at, 1);
  parent.__gd_node_children__.splice(to, 0, child);
}

export function nodeFree(node: GdEngineInstance): void {
  const parent = node.__gd_node_parent__;
  if (parent !== null) parent.__gd_node_children__.splice(parent.__gd_node_children__.indexOf(node), 1);
  node.__gd_node_parent__ = null;
  freeSubtree(node);
}

function freeSubtree(node: GdEngineInstance): void {
  for (const c of node.__gd_node_children__.slice()) freeSubtree(c);
  node.__gd_node_children__.length = 0;
  markFreed(node);
}

export function nodeOf(value: Variant): GdEngineInstance | null {
  const inner = value.t === Tag.OBJECT ? value.v : null;
  return inner !== null && isEngineNode(inner) ? (inner as GdEngineInstance) : null;
}

export function nodeArgSay(value: Variant, who: string): never {
  throw new UnsupportedError("node-arg-type", `Node.${who}() 的这条只收节点（收到 ${tagName(value.t)}）`);
}
