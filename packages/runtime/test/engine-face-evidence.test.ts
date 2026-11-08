import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew, nodeAttach, nodeInit } from "@gds2js/runtime/runtime/class/object/node";
import { GdSceneTree, sceneTreeBegin } from "@gds2js/runtime/runtime/class/object/scene-tree";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";

const GArrayOf = (items: Variant[]) => GArray.of(items);
import { basis } from "@gds2js/runtime/runtime/class/orient/basis";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { transform3d } from "@gds2js/runtime/runtime/class/orient/transform3d";
import { nodePathValue } from "@gds2js/runtime/runtime/class/identity/node-path";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;

function mk(cls: string): any {
  return engineClassNew(cls).v;
}

function withTree(): { tree: GdSceneTree; root: any } {
  const root = mk("Node");
  nodeInit(root, "Node");
  const tree = new GdSceneTree(root);
  sceneTreeBegin(tree);
  return { tree, root };
}

describe("runtime/engine face evidence", () => {
  it("Node virtuals and process face", () => {
    const n = mk("Node");
    expect(method(n, "_enter_tree", []).t).toBe(Tag.NIL);
    expect(method(n, "_exit_tree", []).t).toBe(Tag.NIL);
    expect(method(n, "_ready", []).t).toBe(Tag.NIL);
    expect(method(n, "_process", [V.float(0.1)]).t).toBe(Tag.NIL);
    expect(method(n, "_physics_process", [V.float(0.1)]).t).toBe(Tag.NIL);
    expect(method(n, "can_process", []).t).toBe(Tag.BOOL);
    expect(method(n, "get_process_mode", []).t).toBe(Tag.INT);
    expect(method(n, "get_process_delta_time", []).t).toBe(Tag.FLOAT);
    expect(method(n, "get_physics_process_delta_time", []).t).toBe(Tag.FLOAT);
    expect(method(n, "is_processing", []).t).toBe(Tag.BOOL);
    expect(method(n, "is_physics_processing", []).t).toBe(Tag.BOOL);
    expect(method(n, "get_tree_string", []).t).toBe(Tag.STRING);
    expect(method(n, "get_tree_string_pretty", []).t).toBe(Tag.STRING);
    method(n, "set_process", [V.bool(true)]);
    method(n, "set_physics_process", [V.bool(true)]);
    method(n, "set_process_mode", [V.int(1)]);
    method(n, "set_name", [V.str("probe")]);
    method(n, "set_owner", [V.nil()]);
    expect(attribute(n, "owner").t).toBe(Tag.NIL);
    expect(method(n, "find_children", [V.str("*"), V.str(""), V.bool(true), V.bool(false)]).t).toBe(Tag.ARRAY);
    method(n, "propagate_notification", [V.int(1)]);
    const child = mk("Node");
    nodeInit(child, "Node");
    nodeAttach(n, child);
    method(n, "propagate_call", [V.str("set_meta"), V.array(GArrayOf([V.str("k"), V.int(1)]))]);
    expect(method(child, "get_meta", [V.str("k"), V.nil()]).v).toBe(1);
    const cname = String(method(child, "get_name", []).v);
    expect(method(n, "has_node_and_resource", [V.str(cname)]).v).toBe(true);
    expect(method(n, "get_node_and_resource", [V.str(cname)]).t).toBe(Tag.ARRAY);
    expect(method(n, "get_node_and_resource", [V.str("nope")]).t).toBe(Tag.ARRAY);
    method(n, "request_ready", []);
    const { tree } = withTree();
    method(n, "create_tween", []);
    expect(method(tree, "get_root", []).t).toBe(Tag.OBJECT);
  });

  it("Node2D and Node3D method face", () => {
    const root = mk("Node2D");
    nodeInit(root, "Node2D");
    const tree = new GdSceneTree(root);
    sceneTreeBegin(tree);
    const n2 = mk("Node2D");
    nodeInit(n2, "Node2D");
    nodeAttach(root, n2);
    expect(method(n2, "get_global_rotation", []).t).toBe(Tag.FLOAT);
    expect(method(n2, "get_global_rotation_degrees", []).t).toBe(Tag.FLOAT);
    expect(method(n2, "get_global_scale", []).t).toBe(Tag.OBJECT);
    expect(method(n2, "get_global_skew", []).t).toBe(Tag.FLOAT);
    method(n2, "set_global_skew", [V.float(0.2)]);
    const n3 = mk("Node3D");
    nodeInit(n3, "Node3D");
    nodeAttach(root, n3);
    expect(method(n3, "get_basis", []).t).toBe(Tag.OBJECT);
    expect(method(n3, "get_global_basis", []).t).toBe(Tag.OBJECT);
    expect(method(n3, "get_global_rotation", []).t).toBe(Tag.OBJECT);
    expect(method(n3, "get_global_rotation_degrees", []).t).toBe(Tag.OBJECT);
    expect(method(n3, "get_quaternion", []).t).toBe(Tag.OBJECT);
    expect(method(n3, "get_transform", []).t).toBe(Tag.OBJECT);
    method(n3, "set_basis", [basis(1, 0, 0, 0, 1, 0, 0, 0, 1)]);
    method(n3, "get_visibility_parent", []);
    method(n3, "set_visibility_parent", [nodePathValue("a/b")]);
    method(n3, "global_rotate", [vector3(0, 0, 1), V.float(0.1)]);
    method(n3, "global_scale", [vector3(2, 2, 2)]);
    method(n3, "global_translate", [vector3(1, 2, 3)]);
    method(n3, "rotate_object_local", [vector3(0, 1, 0), V.float(0.1)]);
    method(n3, "scale_object_local", [vector3(1, 1, 1)]);
    method(n3, "translate_object_local", [vector3(0, 0, 1)]);
    method(n3, "look_at_from_position", [vector3(0, 0, 0), vector3(0, 0, 1), vector3(0, 1, 0), V.bool(false)]);
    method(n3, "look_at", [vector3(0, 0, 5), vector3(0, 1, 0), V.bool(false)]);
    method(n3, "set_global_basis", [basis(1, 0, 0, 0, 1, 0, 0, 0, 1)]);
    method(n3, "set_global_rotation", [vector3(0, 0, 0)]);
    method(n3, "set_global_rotation_degrees", [vector3(0, 0, 0)]);
    method(n3, "set_global_transform", [transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0)]);
    expect(attribute(n3, "visibility_parent").t).toBe(Tag.OBJECT);
    method(tree, "queue_delete", [V.object(n3)]);
  });

  it("Control layout method evidence", () => {
    const c = mk("Control");
    expect(method(c, "get_mouse_filter", []).t).toBe(Tag.INT);
    method(c, "set_mouse_filter", [V.int(1)]);
    expect(method(c, "get_mouse_filter", []).v).toBe(1);
  });

  it("SceneTree method, property and signal face", () => {
    const { tree, root } = withTree();
    expect(method(tree, "get_root", []).t).toBe(Tag.OBJECT);
    expect(method(tree, "get_frame", []).t).toBe(Tag.INT);
    expect(method(tree, "get_node_count", []).t).toBe(Tag.INT);
    expect(method(tree, "get_current_scene", []).t).toBe(Tag.OBJECT);
    expect(method(tree, "has_group", [V.str("g")]).t).toBe(Tag.BOOL);
    expect(method(tree, "is_paused", []).t).toBe(Tag.BOOL);
    method(tree, "set_pause", [V.bool(true)]);
    expect(attribute(tree, "paused").t).toBe(Tag.BOOL);
    method(tree, "set_pause", [V.bool(false)]);
    const child = mk("Node");
    nodeInit(child, "Node");
    nodeAttach(root, child);
    method(tree, "set_current_scene", [V.object(child)]);
    expect(method(tree, "get_current_scene", []).t).toBe(Tag.OBJECT);
    expect(attribute(tree, "root").t).toBe(Tag.OBJECT);
    method(tree, "create_tween", []);
    expect(method(tree, "get_processed_tweens", []).t).toBe(Tag.ARRAY);
    method(tree, "notify_group", [V.str("g"), V.int(1)]);
    method(tree, "notify_group_flags", [V.int(0), V.str("g"), V.int(1)]);
    method(tree, "call_group_flags", [V.int(0), V.str("g"), V.str("f")]);
    method(tree, "set_group_flags", [V.int(0), V.str("g"), V.str("p"), V.int(1)]);
    expect(attribute(tree, "node_removed").t).toBe(Tag.OBJECT);
    expect(attribute(tree, "node_renamed").t).toBe(Tag.OBJECT);
    expect(attribute(tree, "physics_frame").t).toBe(Tag.OBJECT);
    expect(attribute(tree, "scene_changed").t).toBe(Tag.OBJECT);
    expect(attribute(tree, "tree_changed").t).toBe(Tag.OBJECT);
    expect(attribute(tree, "tree_process_mode_changed").t).toBe(Tag.OBJECT);
    expect(method(tree, "is_debugging_collisions_hint", []).t).toBe(Tag.BOOL);
    expect(method(tree, "is_debugging_navigation_hint", []).t).toBe(Tag.BOOL);
    expect(method(tree, "is_debugging_paths_hint", []).t).toBe(Tag.BOOL);
  });
});
