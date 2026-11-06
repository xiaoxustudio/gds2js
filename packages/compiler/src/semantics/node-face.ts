/** 脚本类 `extends Node` / `Node2D` 时，类体里那些**裸名** self 调用能落到引擎面的名单。
 *  逐条来自 Godot 4.6.3 的实测读数（corpus/cases/459-node-tree-face 与 460-scene-notifications）；
 *  不在表里的名字照旧发 `call-unknown`。 */
export const NODE_SELF_METHODS = new Set([
  "add_child",
  "add_sibling",
  "add_user_signal",
  "add_to_group",
  "can_process",
  "connect",
  "create_tween",
  "disconnect",
  "duplicate",
  "emit_signal",
  "find_child",
  "find_children",
  "find_parent",
  "free",
  "get_anchor",
  "get_combined_minimum_size",
  "get_meta",
  "get_minimum_size",
  "get_owner",
  "get_relative_transform_to_parent",
  "get_path_to",
  "get_tree_string",
  "get_tree_string_pretty",
  "print_tree",
  "print_tree_pretty",
  "has_meta",
  "has_signal",
  "has_user_signal",
  "is_ancestor_of",
  "is_connected",
  "remove_user_signal",
  "is_greater_than",
  "is_node_ready",
  "notification",
  "propagate_call",
  "propagate_notification",
  "reparent",
  "replace_by",
  "request_ready",
  "apply_scale",
  "get_physics_process_delta_time",
  "get_process_delta_time",
  "get_process_mode",
  "is_physics_processing",
  "is_processing",
  "move_local_x",
  "move_local_y",
  "rotate",
  "rotate_x",
  "rotate_y",
  "rotate_z",
  "set_deferred",
  "set_meta",
  "set_owner",
  "set_physics_process",
  "set_process",
  "set_process_mode",
  "to_global",
  "to_local",
  "translate",
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
const NODE_SIGNAL_PROPS = ["ready", "renamed", "tree_entered", "tree_exiting", "tree_exited", "child_entered_tree", "child_exiting_tree", "child_order_changed", "replacing_by"];

export const NODE_SELF_PROPS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["Node", new Set(["name", "scene_file_path", "process_mode", "custom_minimum_size", "size_flags_horizontal", "size_flags_vertical", "anchor_left", "anchor_top", "anchor_right", "anchor_bottom", "offset_left", "offset_top", "offset_right", "offset_bottom", ...NODE_SIGNAL_PROPS])],
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
  ["Node3D", new Set([
    "name",
    "position",
    "rotation",
    "rotation_degrees",
    "scale",
    "basis",
    "transform",
    "global_position",
    "global_rotation",
    "global_rotation_degrees",
    "global_basis",
    "visible",
  ])],
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
  if (base === null) return NO_NODE_SELF_PROPS;
  const own = NODE_SELF_PROPS.get(base);
  const root = NODE_SELF_PROPS.get("Node");
  if (own === undefined) return NO_NODE_SELF_PROPS;
  if (base === "Node" || root === undefined) return own;
  const merged = new Set<string>(root);
  for (const name of own) merged.add(name);
  return merged;
}

export const NO_NODE_SELF_PROPS: ReadonlySet<string> = new Set<string>();

export const ENGINE_SELF_BASES: ReadonlySet<string> = new Set(NODE_SELF_PROPS.keys());
