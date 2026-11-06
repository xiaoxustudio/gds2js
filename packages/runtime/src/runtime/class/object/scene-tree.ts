import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray } from "../../values";
import { NULL_OBJECT } from "../identity/null-object";
import { GdScriptObject } from "./script-object";
import { GdTween } from "./tween";
import { Signal } from "../identity/signal";
import { GdNodeObject, nodeAttach, nodeChildren, nodeEmitSignal, nodeFaceOf, nodeInit, nodeIsInGroup, nodeIsInside, nodeParent, nodePathOf, registerTreeSignalHook, type NodeRec } from "./node";

export type SceneSpec = { node: object; name: string; cls: string; children: SceneSpec[] };

export class GdSceneTreeTimer extends GdScriptObject {
  timeLeft: number;
  processAlways: boolean;
  processInPhysics: boolean;
  ignoreTimeScale: boolean;
  stopped = false;
  readonly timeout = V.object(new Signal("timeout"));

  constructor(sec: number, processAlways: boolean, processInPhysics: boolean, ignoreTimeScale: boolean) {
    super();
    this.timeLeft = sec;
    this.processAlways = processAlways;
    this.processInPhysics = processInPhysics;
    this.ignoreTimeScale = ignoreTimeScale;
  }

  override __gdDispatch(name: string, _args: Variant[]): Variant | null {
    if (name === "is_stopped") return V.bool(this.stopped);
    if (name === "get_time_left") return V.float(this.timeLeft);
    if (name === "set_time_left") {
      this.timeLeft = Number((_args[0] as Variant).v);
      return V.nil();
    }
    return null;
  }
}

export class GdSceneTree extends GdNodeObject {
  override __gd_engine_class__ = "SceneTree";
  root: GdScriptObject;
  currentScene: object | null = null;
  frame = 0;
  quitted = false;
  code = 0;
  paused = false;
  processDt = 1 / 60;
  timers: GdSceneTreeTimer[] = [];
  tweens: GdTween[] = [];
  constructor(root: GdScriptObject) {
    super();
    this.root = root;
  }
}

const CURRENT = { tree: null as GdSceneTree | null };

export function sceneTree(): GdSceneTree | null {
  return CURRENT.tree;
}

export function sceneTreeBegin(tree: GdSceneTree): void {
  CURRENT.tree = tree;
}

export function sceneNode(node: Variant | object, name: string, cls: string, children: SceneSpec[] = []): SceneSpec {
  const inner = node instanceof Object && "t" in node ? (node as Variant).v as object : node;
  return { node: inner, name, cls, children };
}

export function scenePreOrder(node: object, at: (n: object) => void): void {
  at(node);
  for (const c of nodeChildren(node)) scenePreOrder(c, at);
}

export function scenePostOrder(node: object, at: (n: object) => void): void {
  for (const c of nodeChildren(node)) scenePostOrder(c, at);
  at(node);
}

export function sceneInit(spec: SceneSpec, parent: object, owner: object | null, scenePath = ""): void {
  nodeInit(spec.node, spec.cls);
  (spec.node as unknown as NodeRec).__gd_node_name__ = spec.name;
  (spec.node as unknown as NodeRec).__gd_node_owner__ = owner;
  (spec.node as unknown as NodeRec).__gd_scene_file_path__ = scenePath;
  nodeAttach(parent as unknown as NodeRec, spec.node as unknown as NodeRec);
  for (const c of spec.children) sceneInit(c, spec.node, owner, scenePath);
}

export function dispatchHook(node: object, hook: string, args: Variant[]): void {
  (node as GdScriptObject).__gdDispatch(hook, args);
}

type TreeCallHook = (node: object, name: string, args: Variant[]) => Variant;
let TREE_CALL: TreeCallHook | null = null;

export function registerTreeCallHook(fn: TreeCallHook): void {
  TREE_CALL = fn;
}

function countNodes(root: object): number {
  let n = 1;
  for (const c of nodeChildren(root)) n += countNodes(c);
  return n;
}

function groupNodes(tree: GdSceneTree, group: string): object[] {
  const out: object[] = [];
  scenePreOrder(tree.root as unknown as object, (n) => {
    const rec = nodeFaceOf(n);
    if (rec !== null && nodeIsInGroup(rec, group)) out.push(n);
  });
  return out;
}

function dynamicCall(node: object, name: string, args: Variant[]): Variant {
  if (TREE_CALL === null) throw new UnsupportedError("tree-call-hook", "SceneTree 的动态调用钩子未注册");
  return TREE_CALL(node, name, args);
}

type TreeWriteHook = (node: Variant, prop: string, value: Variant) => void;
let TREE_WRITE: TreeWriteHook | null = null;

export function registerTreeWriteHook(fn: TreeWriteHook): void {
  TREE_WRITE = fn;
}

export function treeSetCurrentScene(tree: GdSceneTree, node: Variant): void {
  if (node.t === Tag.NIL) {
    tree.currentScene = null;
    return;
  }
  const inner = node.t === Tag.OBJECT ? (node.v as object) : null;
  if (inner === null || nodeParent(inner) !== (tree.root as unknown as object)) {
    throw new UnsupportedError("scene-current-child", "current_scene 只能设成 root 的直接孩子：条件不成立时引擎发 ERROR 并忽略，这一形没建模");
  }
  tree.currentScene = inner;
}

export function treeCreateTween(tree: GdSceneTree): Variant {
  const tween = new GdTween();
  tree.tweens.push(tween);
  return V.object(tween);
}

export function treeTickTweens(tree: GdSceneTree, dt: number): void {
  const keep: GdTween[] = [];
  for (const t of tree.tweens) {
    t.step(dt);
    if (t.__gdDispatch("is_running", [])?.v === true) keep.push(t);
  }
  tree.tweens = keep;
}

export function treeTickTimers(tree: GdSceneTree, dt: number): void {
  const keep: GdSceneTreeTimer[] = [];
  for (const t of tree.timers) {
    if (t.stopped) continue;
    if (!t.processAlways && tree.paused) {
      keep.push(t);
      continue;
    }
    t.timeLeft -= dt;
    if (t.timeLeft <= 0) {
      t.stopped = true;
      (t.timeout.v as Signal).emit();
    } else keep.push(t);
  }
  tree.timers = keep;
}

export function treeMethod(tree: GdSceneTree, name: string, args: Variant[]): Variant {
  switch (name) {
    case "create_timer": {
      const sec = args[0];
      if (sec === undefined || (sec.t !== Tag.INT && sec.t !== Tag.FLOAT)) throw new UnsupportedError("scene-tree-arg-type", "create_timer() 的秒数只量过数");
      const always = args[1] === undefined ? true : args[1].t === Tag.BOOL && args[1].v === true;
      const physics = args[2] !== undefined && args[2].t === Tag.BOOL && args[2].v === true;
      const ignore = args[3] !== undefined && args[3].t === Tag.BOOL && args[3].v === true;
      const timer = new GdSceneTreeTimer(Number(sec.v), always, physics, ignore);
      tree.timers.push(timer);
      return V.object(timer);
    }
    case "set_current_scene": {
      treeSetCurrentScene(tree, args[0] as Variant);
      return V.nil();
    }
    case "set_group":
    case "set_group_flags": {
      const at = name === "set_group" ? 0 : 1;
      const g = args[at];
      const p = args[at + 1];
      const v = args[at + 2];
      if (g === undefined || p === undefined || v === undefined) throw new UnsupportedError("scene-tree-arity", `${name}() 少了实参`);
      if (TREE_WRITE === null) throw new UnsupportedError("tree-write-hook", "SceneTree.set_group() 的写入钩子未注册");
      for (const n of groupNodes(tree, String(g.v))) TREE_WRITE(V.object(n), String(p.v), v);
      return V.nil();
    }
    case "create_tween":
      return treeCreateTween(tree);
    case "get_processed_tweens":
      return V.array(GArray.of(tree.tweens.map((t) => V.object(t))));
    case "get_node_count":
      return V.int(countNodes(tree.root as unknown as object));
    case "get_first_node_in_group": {
      const g = args[0];
      if (g === undefined || (g.t !== Tag.STRING && g.t !== Tag.STRING_NAME)) throw new UnsupportedError("scene-tree-arg-type", "get_first_node_in_group() 的组名只量过字符串");
      const hit = groupNodes(tree, String(g.v))[0];
      return hit === undefined ? V.object(NULL_OBJECT) : V.object(hit);
    }
    case "get_node_count_in_group": {
      const g = args[0];
      if (g === undefined || (g.t !== Tag.STRING && g.t !== Tag.STRING_NAME)) throw new UnsupportedError("scene-tree-arg-type", "get_node_count_in_group() 的组名只量过字符串");
      return V.int(groupNodes(tree, String(g.v)).length);
    }
    case "has_group": {
      const g = args[0];
      if (g === undefined || (g.t !== Tag.STRING && g.t !== Tag.STRING_NAME)) throw new UnsupportedError("scene-tree-arg-type", "has_group() 的组名只量过字符串");
      return V.bool(groupNodes(tree, String(g.v)).length > 0);
    }
    case "call_group":
    case "call_group_flags": {
      const at = name === "call_group" ? 0 : 1;
      const g = args[at];
      const m = args[at + 1];
      if (g === undefined || (g.t !== Tag.STRING && g.t !== Tag.STRING_NAME)) throw new UnsupportedError("scene-tree-arg-type", "call_group() 的组名只量过字符串");
      if (m === undefined || (m.t !== Tag.STRING && m.t !== Tag.STRING_NAME)) throw new UnsupportedError("scene-tree-arg-type", "call_group() 的方法名只量过字符串");
      for (const n of groupNodes(tree, String(g.v))) dynamicCall(n, String(m.v), args.slice(at + 2));
      return V.nil();
    }
    case "notify_group":
    case "notify_group_flags": {
      const at = name === "notify_group" ? 0 : 1;
      const g = args[at];
      const w = args[at + 1];
      if (g === undefined || (g.t !== Tag.STRING && g.t !== Tag.STRING_NAME)) throw new UnsupportedError("scene-tree-arg-type", "notify_group() 的组名只量过字符串");
      if (w === undefined || (w.t !== Tag.INT && w.t !== Tag.FLOAT)) throw new UnsupportedError("scene-tree-arg-type", "notify_group() 的编号只量过数");
      for (const n of groupNodes(tree, String(g.v))) dynamicCall(n, "notification", [V.int(Number(w.v))]);
      return V.nil();
    }
    case "quit": {
      if (!tree.quitted) {
        tree.quitted = true;
        const c = args[0];
        tree.code = c === undefined || c.t === 0 ? 0 : Number(c.v as number | bigint);
      }
      return V.nil();
    }
    case "get_frame":
      return V.int(tree.frame);
    case "set_pause": {
      const v = args[0];
      if (v === undefined || v.t !== Tag.BOOL) throw new UnsupportedError("scene-tree-arg-type", "set_pause() 只量过 bool");
      tree.paused = v.v === true;
      return V.nil();
    }
    case "is_paused":
      return V.bool(tree.paused);
    case "get_root":
      return V.object(tree.root);
    case "get_nodes_in_group": {
      const a = args[0] as Variant | undefined;
      if (a === undefined) throw new UnsupportedError("node-arity", "get_nodes_in_group() 少了组名实参");
      if (a.t !== Tag.STRING && a.t !== Tag.STRING_NAME) {
        throw new UnsupportedError("node-group-arg-type", `get_nodes_in_group() 的组名只量过字符串（收到 ${tagName(a.t)}）`);
      }
      const group = String(a.v);
      const out: Variant[] = [];
      scenePreOrder(tree.root, (n) => {
        const rec = nodeFaceOf(n);
        if (rec !== null && nodeIsInGroup(rec, group)) out.push(V.object(n));
      });
      return V.array(GArray.of(out));
    }
    default:
      throw new UnsupportedError("scene-tree-method", `SceneTree.${name}() 这一支没量过（call_group / set_group 那几支还没读数）`);
  }
}

export function treeReadProp(tree: GdSceneTree, name: string): Variant | null {
  if (name === "current_scene") return tree.currentScene === null ? V.nil() : V.object(tree.currentScene);
  if (name === "root") return V.object(tree.root);
  if (name === "frame") return V.int(tree.frame);
  if (name === "paused") return V.bool(tree.paused);
  return null;
}

export function scenePathOf(node: object): string {
  const tree = CURRENT.tree;
  if (tree === null) throw new UnsupportedError("node-path-unbuilt", "没有场景树时的 get_path() 这一形没建模：引擎发 ERROR 并回空 NodePath");
  if (!nodeIsInside(node, tree.root)) throw new UnsupportedError("node-path-unbuilt", "不在树里的 get_path() 这一形没建模：引擎发 ERROR 并回空 NodePath");
  return nodePathOf(node, tree.root);
}

registerTreeSignalHook((child, name) => {
  const tree = sceneTree();
  if (tree !== null) nodeEmitSignal(tree as unknown as NodeRec, name, [V.object(child)]);
});
