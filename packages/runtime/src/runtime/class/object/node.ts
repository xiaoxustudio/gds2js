import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GdScriptObject, markFreed } from "./script-object";
import { Signal } from "../identity/signal";

const CONSTRUCTIBLE = new Set(["Node", "Node2D", "Control", "Node3D", "Timer", "RefCounted", "Object"]);
const EXTRA_CTORS = new Map<string, () => object>();

export function registerEngineCtor(name: string, make: () => object): void {
  EXTRA_CTORS.set(name, make);
}

export class GdNodeObject extends GdScriptObject {
  __gd_engine_class__: string = "";
  __gd_freed__: boolean = false;
  __gd_node_queued__: boolean = false;
  __gd_node_t2d__?: unknown;
  __gd_node_t2d_vals__?: unknown;
  __gd_node_visible__?: boolean;
  __gd_node_top_level__?: boolean;
  __gd_node_visibility_parent__?: string;
  __gd_node3d_gizmos__?: unknown[];
  __gd_node3d_rotation_edit_mode__?: number;
  __gd_node3d_rotation_order__?: number;
  __gd_node3d_notify_transform__?: boolean;
  __gd_node3d_notify_local__?: boolean;
  __gd_node3d_ignore_notification__?: boolean;
  __gd_node3d_disable_scale__?: boolean;
  __gd_node3d_world__?: Variant;
  __gd_node_auto_translate_mode__?: number;
  __gd_node_editor_description__?: string;
  __gd_node_unique_in_owner__?: boolean;
  __gd_node_scene_placeholder__?: boolean;
  __gd_node_physics_interp__?: number;
  __gd_node_thread_group__?: number;
  __gd_node_thread_order__?: number;
  __gd_node_thread_messages__?: number;
  __gd_node_process_input__?: boolean;
  __gd_node_process_shortcut__?: boolean;
  __gd_node_process_unhandled__?: boolean;
  __gd_node_process_unhandled_key__?: boolean;
  __gd_node_translation_domain__?: string;
  __gd_node_mp_authority__?: number;
  __gd_node_rpc_config__?: unknown;
  __gd_node_mp_api__?: Variant;
  __gd_obj_script__?: Variant;
  __gd_obj_block_signals__?: boolean;
  __gd_obj_message_translation__?: boolean;
  __gd_refcount__?: number;
  __gd_ctl__?: unknown;
  __gd_node_t3d__?: unknown;
  __gd_node_ctl__?: unknown;
  __gd_node_name__: string = "";
  __gd_scene_file_path__: string = "";
  __gd_node_process_priority__: number = 0;
  __gd_node_physics_priority__: number = 0;
  __gd_node_parent__: object | null = null;
  __gd_node_children__: object[] = [];
  __gd_node_groups__: string[] = [];
  __gd_node_owner__: object | null = null;
  __gd_node_ready__: boolean = false;
  __gd_node_process__?: boolean;
  __gd_node_physics__?: boolean;
  __gd_node_process_mode__: number = 0;
  __gd_node_signals__?: Map<string, Signal>;
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
  if (!CONSTRUCTIBLE.has(cls)) throw new UnsupportedError("engine-class-ctor", `${cls}.new() 这一支没量过（只量过 Node / Node2D / Control / Node3D / Timer / RefCounted / Object）`);
  const extra = EXTRA_CTORS.get(cls);
  return V.object(extra === undefined ? new GdEngineInstance(cls) : extra());
}

export function nodeInit(inst: object, cls: string): void {
  const rec = inst as unknown as NodeRec;
  rec.__gd_engine_class__ = cls;
  rec.__gd_node_queued__ = false;
  rec.__gd_node_name__ = "";
  rec.__gd_scene_file_path__ = "";
  rec.__gd_node_parent__ = null;
  rec.__gd_node_children__ = [];
  rec.__gd_node_groups__ = [];
  rec.__gd_node_owner__ = null;
  rec.__gd_node_ready__ = false;
}

export const NODE_SIGNALS: ReadonlySet<string> = new Set([
  "ready",
  "renamed",
  "tree_entered",
  "tree_exiting",
  "tree_exited",
  "child_entered_tree",
  "child_exiting_tree",
  "child_order_changed",
  "replacing_by",
  "process_frame",
  "physics_frame",
  "node_added",
  "node_removed",
  "tree_changed",
  "scene_changed",
  "tree_process_mode_changed",
  "node_renamed",
  "visibility_changed",
  "resized",
  "size_flags_changed",
  "minimum_size_changed",
  "focus_entered",
  "focus_exited",
  "gui_input",
  "mouse_entered",
  "mouse_exited",
  "theme_changed",
  "node_configuration_warning_changed",
  "property_list_changed",
  "script_changed",
  "editor_description_changed",
  "editor_state_changed",
]);

const USER_SIGNALS = new WeakMap<object, Set<string>>();

export function nodeAddUserSignal(rec: NodeRec, name: string): void {
  let set = USER_SIGNALS.get(rec as unknown as object);
  if (set === undefined) {
    set = new Set();
    USER_SIGNALS.set(rec as unknown as object, set);
  }
  set.add(name);
}

export function nodeHasUserSignal(rec: NodeRec, name: string): boolean {
  return USER_SIGNALS.get(rec as unknown as object)?.has(name) === true;
}

export function nodeRemoveUserSignal(rec: NodeRec, name: string): void {
  USER_SIGNALS.get(rec as unknown as object)?.delete(name);
}

export function nodeSignalOf(rec: NodeRec, name: string): Signal | null {
  if (!NODE_SIGNALS.has(name) && !nodeHasUserSignal(rec, name)) return null;
  let table = rec.__gd_node_signals__;
  if (table === undefined) {
    table = new Map();
    rec.__gd_node_signals__ = table;
  }
  let sig = table.get(name);
  if (sig === undefined) {
    sig = new Signal(name);
    table.set(name, sig);
  }
  return sig;
}

export function nodeEmitSignal(rec: NodeRec, name: string, args: Variant[]): void {
  nodeSignalOf(rec, name)?.emitList(args);
}

export function nodeProcessMode(rec: NodeRec): number {
  if (rec.__gd_node_process_mode__ !== 0) return rec.__gd_node_process_mode__;
  const parent = nodeFaceOf(rec.__gd_node_parent__);
  return parent === null ? 1 : nodeProcessMode(parent);
}

export function nodeCanProcess(rec: NodeRec, paused: boolean): boolean {
  const mode = nodeProcessMode(rec);
  if (mode === 4) return false;
  if (mode === 3) return true;
  if (mode === 2) return paused;
  if (mode === 1) return !paused;
  return !paused;
}

export function nodeProcessWanted(rec: NodeRec, physics: boolean): boolean {
  const flag = physics ? rec.__gd_node_physics__ : rec.__gd_node_process__;
  return flag !== false;
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

type TreeSignalHook = (node: object, name: string) => void;
let TREE_SIGNAL_HOOK: TreeSignalHook | null = null;

export function registerTreeSignalHook(fn: TreeSignalHook): void {
  TREE_SIGNAL_HOOK = fn;
}

export function nodeAttach(parent: NodeRec, child: NodeRec): void {
  if (child === parent) throw new UnsupportedError("node-add-self", "add_child(self) 那一形没建模：引擎发 ERROR 并什么都不做");
  if (child.__gd_node_parent__ !== null) throw new UnsupportedError("node-already-parented", "把已有父亲的节点再 add_child 那一形没建模：引擎发 ERROR 并什么都不做");
  if (child.__gd_node_name__ === "" || parent.__gd_node_children__.some((c) => nodeName(c) === child.__gd_node_name__)) {
    child.__gd_node_name__ = autoName(child);
  }
  child.__gd_node_parent__ = parent as unknown as object;
  parent.__gd_node_children__.push(child as unknown as object);
  if (TREE_SIGNAL_HOOK !== null) TREE_SIGNAL_HOOK(child as unknown as object, "node_added");
}

export function nodeDetach(parent: NodeRec, child: NodeRec): void {
  const at = parent.__gd_node_children__.indexOf(child as unknown as object);
  if (at < 0) throw new UnsupportedError("node-remove-nonchild", "remove_child 一个不是自己孩子的节点那一形没量过");
  parent.__gd_node_children__.splice(at, 1);
  child.__gd_node_parent__ = null;
  if (TREE_SIGNAL_HOOK !== null) TREE_SIGNAL_HOOK(child as unknown as object, "node_removed");
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
