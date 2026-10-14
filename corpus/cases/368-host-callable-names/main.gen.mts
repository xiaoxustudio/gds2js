// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let names = rt.V.array(rt.GArray.of([rt.V.str("call_group"), rt.V.str("call_group_flags"), rt.V.str("change_scene_to_file"), rt.V.str("change_scene_to_node"), rt.V.str("create_tween"), rt.V.str("get_current_scene"), rt.V.str("get_frame"), rt.V.str("get_multiplayer"), rt.V.str("get_nodes_in_group"), rt.V.str("has_group"), rt.V.str("is_paused"), rt.V.str("notify_group"), rt.V.str("reload_current_scene"), rt.V.str("set_pause"), rt.V.str("unload_current_scene"), rt.V.str("get_root"), rt.V.str("get_edited_scene_root"), rt.V.str("callv"), rt.V.str("can_translate_messages"), rt.V.str("cancel_free"), rt.V.str("get_instance_id"), rt.V.str("get_method_list"), rt.V.str("get_property_list"), rt.V.str("get_script"), rt.V.str("has_meta"), rt.V.str("has_signal"), rt.V.str("is_class"), rt.V.str("notify_property_list_changed"), rt.V.str("queue_delete"), rt.V.str("set_block_signals"), rt.V.str("set_deferred"), rt.V.str("set_script"), rt.V.str("to_string"), rt.V.str("tr"), rt.V.str("tr_n")]));
    let fns = rt.V.array(rt.GArray.of([rt.methodCallable(rt.V.object(this), "call_group"), rt.methodCallable(rt.V.object(this), "call_group_flags"), rt.methodCallable(rt.V.object(this), "change_scene_to_file"), rt.methodCallable(rt.V.object(this), "change_scene_to_node"), rt.methodCallable(rt.V.object(this), "create_tween"), rt.methodCallable(rt.V.object(this), "get_current_scene"), rt.methodCallable(rt.V.object(this), "get_frame"), rt.methodCallable(rt.V.object(this), "get_multiplayer"), rt.methodCallable(rt.V.object(this), "get_nodes_in_group"), rt.methodCallable(rt.V.object(this), "has_group"), rt.methodCallable(rt.V.object(this), "is_paused"), rt.methodCallable(rt.V.object(this), "notify_group"), rt.methodCallable(rt.V.object(this), "reload_current_scene"), rt.methodCallable(rt.V.object(this), "set_pause"), rt.methodCallable(rt.V.object(this), "unload_current_scene"), rt.methodCallable(rt.V.object(this), "get_root"), rt.methodCallable(rt.V.object(this), "get_edited_scene_root"), rt.methodCallable(rt.V.object(this), "callv"), rt.methodCallable(rt.V.object(this), "can_translate_messages"), rt.methodCallable(rt.V.object(this), "cancel_free"), rt.methodCallable(rt.V.object(this), "get_instance_id"), rt.methodCallable(rt.V.object(this), "get_method_list"), rt.methodCallable(rt.V.object(this), "get_property_list"), rt.methodCallable(rt.V.object(this), "get_script"), rt.methodCallable(rt.V.object(this), "has_meta"), rt.methodCallable(rt.V.object(this), "has_signal"), rt.methodCallable(rt.V.object(this), "is_class"), rt.methodCallable(rt.V.object(this), "notify_property_list_changed"), rt.methodCallable(rt.V.object(this), "queue_delete"), rt.methodCallable(rt.V.object(this), "set_block_signals"), rt.methodCallable(rt.V.object(this), "set_deferred"), rt.methodCallable(rt.V.object(this), "set_script"), rt.methodCallable(rt.V.object(this), "to_string"), rt.methodCallable(rt.V.object(this), "tr"), rt.methodCallable(rt.V.object(this), "tr_n")]));
    for (let i of rt.iter(rt.method(fns, "size", []))) {
      let f = rt.wrapValue(rt.index(fns, i));
      print(rt.showArgs([rt.wrapValue(rt.index(names, i)), rt.V.str(" → typeof "), rt.typeOf(f), rt.V.str(" | "), rt.method(f, "get_method", []), rt.V.str(" | 有效 "), rt.method(f, "is_valid", []), rt.V.str(" | 空 "), rt.method(f, "is_null", [])]));
    }
    let packed = rt.V.array(rt.GArray.of([rt.methodCallable(rt.V.object(this), "get_frame"), rt.methodCallable(rt.V.object(this), "is_paused"), rt.methodCallable(rt.V.object(this), "tr")]));
    print(rt.showArgs([rt.V.str("装进数组 → "), rt.method(packed, "size", []), rt.V.str(" | "), rt.method(rt.wrapValue(rt.index(packed, rt.V.int(0))), "get_method", []), rt.V.str(" | "), rt.method(rt.wrapValue(rt.index(packed, rt.V.int(2))), "get_method", [])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
