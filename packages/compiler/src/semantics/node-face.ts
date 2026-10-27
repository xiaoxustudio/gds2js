/** 脚本类 `extends Node` / `Node2D` 时，类体里那些**裸名** self 调用能落到引擎面的名单。
 *  逐条来自 Godot 4.6.3 的实测读数（corpus/cases/459-node-tree-face 与 460-scene-notifications）；
 *  不在表里的名字照旧发 `call-unknown`。 */
export const NODE_SELF_METHODS = new Set([
  "add_child",
  "add_to_group",
  "free",
  "get_child",
  "get_child_count",
  "get_children",
  "get_class",
  "get_groups",
  "get_index",
  "get_name",
  "get_node",
  "get_node_or_null",
  "get_parent",
  "get_path",
  "get_tree",
  "has_node",
  "is_inside_tree",
  "is_in_group",
  "is_queued_for_deletion",
  "move_child",
  "queue_free",
  "remove_child",
  "remove_from_group",
  "set_name",
]);

/** 类体里**裸名**读写的引擎成员，按直接基类分档；逐条来自 Godot 4.6.3 的实测读数（corpus/cases/467-*）。 */
export const NODE_SELF_PROPS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["Node", new Set(["name"])],
  [
    "Control",
    new Set([
      "name",
      "position",
      "size",
      "rotation",
      "scale",
      "pivot_offset",
      "global_position",
      "visible",
    ]),
  ],
  ["Node3D", new Set(["name", "position", "rotation", "rotation_degrees", "scale", "basis", "visible"])],
  [
    "Node2D",
    new Set([
      "name",
      "position",
      "rotation",
      "rotation_degrees",
      "scale",
      "transform",
      "global_position",
      "visible",
      "z_index",
      "top_level",
      "y_sort_enabled",
    ]),
  ],
]);

export function nodeSelfProps(base: string | null): ReadonlySet<string> {
  return base === null ? NO_NODE_SELF_PROPS : NODE_SELF_PROPS.get(base) ?? NO_NODE_SELF_PROPS;
}

export const NO_NODE_SELF_PROPS: ReadonlySet<string> = new Set<string>();

export const ENGINE_SELF_BASES: ReadonlySet<string> = new Set(NODE_SELF_PROPS.keys());
