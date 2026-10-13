/**
 * 宿主裸方法名当值用的**完整名单**（S366）：97 名逐个钉「分析器不报错 + 发射器发出 `rt.methodCallable`」，
 * 另 15 支 `_x` 虚方法引擎是 `Compile Error: Identifier not found: _process`，出货照旧报未声明。
 * 尺 `tmp/probe-argtype/fold45.mts`（`ClassDB.class_get_method_list("SceneTree")` 数出 113 名 → 一格一份脚本 spawn 量裸名当值给什么），
 * 读数 `tmp/hostnames/readings.txt`；`_initialize` 量出来是 Callable 只因探针脚本自己定义了它，不进名单。语料 368 端到端再钉一遍。
 */
import { describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };
const SRC = (name: string): string =>
  "extends SceneTree\n\nfunc _initialize():\n\tvar f = " + name + "\n\tquit()\n";

async function run(name: string): Promise<string> {
  const ir = lower(await parseSource(SRC(name)));
  const diags = analyze(ir);
  if (diags.length > 0) return `diag:${diags[0]!.code}`;
  return emitModule(ir, OPTS);
}

async function diag(name: string): Promise<string> {
  const diags = analyze(lower(await parseSource(SRC(name))));
  return diags.length === 0 ? "无诊断" : diags[0]!.message;
}

const HOST_NAMES = [
  "add_user_signal",
  "call",
  "call_deferred",
  "call_group",
  "call_group_flags",
  "callv",
  "can_translate_messages",
  "cancel_free",
  "change_scene_to_file",
  "change_scene_to_node",
  "change_scene_to_packed",
  "connect",
  "create_timer",
  "create_tween",
  "disconnect",
  "emit_signal",
  "free",
  "get",
  "get_class",
  "get_current_scene",
  "get_edited_scene_root",
  "get_first_node_in_group",
  "get_frame",
  "get_incoming_connections",
  "get_indexed",
  "get_instance_id",
  "get_meta",
  "get_meta_list",
  "get_method_argument_count",
  "get_method_list",
  "get_multiplayer",
  "get_node_count",
  "get_node_count_in_group",
  "get_nodes_in_group",
  "get_processed_tweens",
  "get_property_list",
  "get_root",
  "get_script",
  "get_signal_connection_list",
  "get_signal_list",
  "get_translation_domain",
  "has_connections",
  "has_group",
  "has_meta",
  "has_method",
  "has_signal",
  "has_user_signal",
  "is_accessibility_enabled",
  "is_accessibility_supported",
  "is_auto_accept_quit",
  "is_blocking_signals",
  "is_class",
  "is_connected",
  "is_debugging_collisions_hint",
  "is_debugging_navigation_hint",
  "is_debugging_paths_hint",
  "is_multiplayer_poll_enabled",
  "is_paused",
  "is_physics_interpolation_enabled",
  "is_queued_for_deletion",
  "is_quit_on_go_back",
  "notification",
  "notify_group",
  "notify_group_flags",
  "notify_property_list_changed",
  "property_can_revert",
  "property_get_revert",
  "queue_delete",
  "quit",
  "reload_current_scene",
  "remove_meta",
  "remove_user_signal",
  "set",
  "set_auto_accept_quit",
  "set_block_signals",
  "set_current_scene",
  "set_debug_collisions_hint",
  "set_debug_navigation_hint",
  "set_debug_paths_hint",
  "set_deferred",
  "set_edited_scene_root",
  "set_group",
  "set_group_flags",
  "set_indexed",
  "set_message_translation",
  "set_meta",
  "set_multiplayer",
  "set_multiplayer_poll_enabled",
  "set_pause",
  "set_physics_interpolation_enabled",
  "set_quit_on_go_back",
  "set_script",
  "set_translation_domain",
  "to_string",
  "tr",
  "tr_n",
  "unload_current_scene",
];

const VIRTUAL_REFUSED = [
  "_finalize",
  "_get",
  "_get_property_list",
  "_init",
  "_iter_get",
  "_iter_init",
  "_iter_next",
  "_notification",
  "_physics_process",
  "_process",
  "_property_can_revert",
  "_property_get_revert",
  "_set",
  "_to_string",
  "_validate_property",
];

describe("宿主裸方法名当值用", () => {
  for (const name of HOST_NAMES) {
    it(name, async () => {
      const got = await run(name);
      expect(got.startsWith("diag:"), `${name} 不该报诊断，实得 ${got}`).toBe(false);
      expect(got).toContain(`methodCallable(rt.V.object(this), ${JSON.stringify(name)})`);
    });
  }

  it("15 支 _x 虚方法照旧拦，但句子换成 Identifier not found", async () => {
    for (const name of VIRTUAL_REFUSED) {
      expect(await run(name), `${name} 该照旧拦`).toBe("diag:undeclared-identifier");
      expect(await diag(name), `${name} 的句子`).toBe(`Identifier not found: ${name}`);
    }
  });

  it("一般没声明的名字仍是那一句", async () => {
    expect(await diag("quit_and_ide_debug")).toBe("Identifier \"quit_and_ide_debug\" not declared in the current scope.");
  });
});
