import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray } from "../../values";
import { GdScriptObject } from "./script-object";
import { GdNodeObject, nodeAttach, nodeChildren, nodeFaceOf, nodeInit, nodeIsInGroup, nodeIsInside, nodePathOf, type NodeRec } from "./node";

export type SceneSpec = { node: object; name: string; cls: string; children: SceneSpec[] };

export class GdSceneTree extends GdNodeObject {
  override __gd_engine_class__ = "SceneTree";
  root: GdScriptObject;
  currentScene: object | null = null;
  frame = 0;
  quitted = false;
  code = 0;
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

export function sceneInit(spec: SceneSpec, parent: object): void {
  nodeInit(spec.node, spec.cls);
  (spec.node as unknown as NodeRec).__gd_node_name__ = spec.name;
  nodeAttach(parent as unknown as NodeRec, spec.node as unknown as NodeRec);
  for (const c of spec.children) sceneInit(c, spec.node);
}

export function dispatchHook(node: object, hook: string, args: Variant[]): void {
  (node as GdScriptObject).__gdDispatch(hook, args);
}

export function treeMethod(tree: GdSceneTree, name: string, args: Variant[]): Variant {
  switch (name) {
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
  return null;
}

export function scenePathOf(node: object): string {
  const tree = CURRENT.tree;
  if (tree === null) throw new UnsupportedError("node-path-unbuilt", "没有场景树时的 get_path() 这一形没建模：引擎发 ERROR 并回空 NodePath");
  if (!nodeIsInside(node, tree.root)) throw new UnsupportedError("node-path-unbuilt", "不在树里的 get_path() 这一形没建模：引擎发 ERROR 并回空 NodePath");
  return nodePathOf(node, tree.root);
}
