// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("o1|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_version", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_version_alias", []), rt.V.str("")), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "get_distribution_name", [])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("o2|"), rt.ops.gt(rt.method(rt.nativeClass("OS"), "get_processor_count", []), rt.V.int(0)), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_processor_name", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_locale", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_locale_language", []), rt.V.str(""))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("o3|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_temp_dir", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_cache_dir", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_config_dir", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_data_dir", []), rt.V.str("")), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_user_data_dir", []), rt.V.str(""))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("o4|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_system_dir", [rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "SYSTEM_DIR_DESKTOP"))]), rt.V.str("")), rt.V.str("|"), rt.ops.gt(rt.method(rt.method(rt.nativeClass("OS"), "get_system_fonts", []), "size", []), rt.V.int(0)), rt.V.str("|"), rt.ops.neq(rt.method(rt.nativeClass("OS"), "get_system_font_path", [rt.V.str("Arial"), rt.V.int(400), rt.V.int(100), rt.V.bool(false)]), rt.V.str(""))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("o5|"), rt.method(rt.method(rt.nativeClass("OS"), "get_entropy", [rt.V.int(4)]), "size", []), rt.V.str("|"), rt.method(rt.method(rt.nativeClass("OS"), "get_granted_permissions", []), "size", []), rt.V.str("|"), rt.method(rt.method(rt.nativeClass("OS"), "get_connected_midi_inputs", []), "size", []), rt.V.str("|"), rt.method(rt.method(rt.nativeClass("OS"), "get_video_adapter_driver_info", []), "size", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("o6|"), rt.method(rt.nativeClass("OS"), "has_feature", [rt.V.str("pc")]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "has_feature", [rt.V.str("windows")]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "has_feature", [rt.V.str("x86_64")]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "has_feature", [rt.V.str("nope")])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("o7|"), rt.method(rt.nativeClass("OS"), "is_sandboxed", []), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "is_userfs_persistent", []), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "is_stdout_verbose", [])]));
      rt.frameLine(11);
      rt.method(rt.nativeClass("OS"), "set_low_processor_usage_mode", [rt.V.bool(true)]);
      rt.frameLine(12);
      rt.method(rt.nativeClass("OS"), "set_low_processor_usage_mode_sleep_usec", [rt.V.int(123)]);
      rt.frameLine(13);
      rt.method(rt.nativeClass("OS"), "set_delta_smoothing", [rt.V.bool(false)]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("o8|"), rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "low_processor_usage_mode")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "low_processor_usage_mode_sleep_usec")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "delta_smoothing"))]));
      rt.frameLine(15);
      rt.method(rt.nativeClass("OS"), "set_low_processor_usage_mode", [rt.V.bool(false)]);
      rt.frameLine(16);
      rt.method(rt.nativeClass("OS"), "set_delta_smoothing", [rt.V.bool(true)]);
      rt.frameLine(17);
      rt.method(rt.nativeClass("OS"), "set_restart_on_exit", [rt.V.bool(true), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("--x")]))])]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("o9|"), rt.method(rt.nativeClass("OS"), "is_restart_on_exit_set", []), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "get_restart_on_exit_arguments", [])]));
      rt.frameLine(19);
      rt.method(rt.nativeClass("OS"), "set_restart_on_exit", [rt.V.bool(false)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("o10|"), rt.method(rt.nativeClass("OS"), "get_keycode_string", [rt.V.int(65)]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "get_keycode_string", [rt.V.int(4194305)]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "find_keycode_from_string", [rt.V.str("a")]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "find_keycode_from_string", [rt.V.str("Escape")]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "find_keycode_from_string", [rt.V.str("nope")])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("o11|"), rt.method(rt.nativeClass("OS"), "is_keycode_unicode", [rt.V.int(65)]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "is_keycode_unicode", [rt.V.int(4194305)]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "is_keycode_unicode", [rt.V.int(0)])]));
      rt.frameLine(22);
      let out = rt.V.array(rt.GArray.of([]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("o12|"), rt.method(rt.nativeClass("OS"), "execute", [rt.V.str("cmd"), rt.V.array(rt.GArray.of([rt.V.str("/c"), rt.V.str("echo"), rt.V.str("hi")])), out, rt.V.bool(true), rt.V.bool(false)]), rt.V.str("|"), rt.ops.gt(rt.method(out, "size", []), rt.V.int(0))]));
      rt.frameLine(24);
      let pipe = rt.method(rt.nativeClass("OS"), "execute_with_pipe", [rt.V.str("cmd"), rt.V.array(rt.GArray.of([rt.V.str("/c"), rt.V.str("echo"), rt.V.str("hi")])), rt.V.bool(true)]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("o13|"), rt.method(pipe, "has", [rt.V.str("stdio")]), rt.V.str("|"), rt.method(pipe, "has", [rt.V.str("stderr")]), rt.V.str("|"), rt.method(pipe, "has", [rt.V.str("pid")])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("o14|"), rt.method(rt.method(rt.nativeClass("OS"), "get_memory_info", []), "has", [rt.V.str("physical")]), rt.V.str("|"), rt.ops.gt(rt.method(rt.nativeClass("OS"), "get_static_memory_usage", []), rt.V.int(0)), rt.V.str("|"), rt.ops.gt(rt.method(rt.nativeClass("OS"), "get_static_memory_peak_usage", []), rt.V.int(0))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("o15|"), rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "RENDERING_DRIVER_VULKAN")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "STD_HANDLE_PIPE")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("OS"), "SYSTEM_DIR_DOWNLOADS"))]));
      rt.frameLine(28);
      rt.method(rt.nativeClass("OS"), "delay_msec", [rt.V.int(0)]);
      rt.frameLine(29);
      rt.method(rt.nativeClass("OS"), "delay_usec", [rt.V.int(0)]);
      rt.frameLine(30);
      rt.method(rt.nativeClass("OS"), "open_midi_inputs", []);
      rt.frameLine(31);
      rt.method(rt.nativeClass("OS"), "close_midi_inputs", []);
      rt.frameLine(32);
      rt.method(rt.nativeClass("OS"), "set_use_file_access_save_and_swap", [rt.V.bool(true)]);
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("o16|"), rt.method(rt.nativeClass("OS"), "request_permission", [rt.V.str("x")]), rt.V.str("|"), rt.method(rt.nativeClass("OS"), "request_permissions", [])]));
      rt.frameLine(34);
      rt.method(rt.nativeClass("OS"), "set_environment", [rt.V.str("GDS2JS_OS_CORPUS"), rt.V.str("v")]);
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("o17|"), rt.method(rt.nativeClass("OS"), "get_environment", [rt.V.str("GDS2JS_OS_CORPUS")])]));
      rt.frameLine(36);
      rt.method(rt.nativeClass("OS"), "unset_environment", [rt.V.str("GDS2JS_OS_CORPUS")]);
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("o18|"), rt.method(rt.nativeClass("OS"), "has_environment", [rt.V.str("GDS2JS_OS_CORPUS")])]));
      rt.frameLine(38);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
