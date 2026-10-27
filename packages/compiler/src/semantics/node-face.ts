/** 脚本类 `extends Node` / `Node2D` 时，类体里那些**裸名** self 调用能落到引擎面的名单。
 *  逐条来自 Godot 4.6.3 的实测读数（corpus/cases/459-node-tree-face 与 460-scene-notifications）；
 *  不在表里的名字照旧发 `call-unknown`。 */
export const NODE_SELF_METHODS = new Set([
  "add_child",
  "free",
  "get_child",
  "get_child_count",
  "get_children",
  "get_class",
  "get_index",
  "get_name",
  "get_node",
  "get_node_or_null",
  "get_parent",
  "get_path",
  "get_tree",
  "has_node",
  "is_inside_tree",
  "is_queued_for_deletion",
  "move_child",
  "queue_free",
  "remove_child",
  "set_name",
]);
