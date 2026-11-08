import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw, writeProp as writePropRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict } from "@gds2js/runtime/runtime/values";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const writeProp = (recv: any, name: string, value: any): any => writePropRaw(recv, name, value);
const OS = nativeClass("OS");
const strings = (items: string[]): Variant => V.object(GBytes.of(items, "string"));

describe("runtime/os face", () => {
  it("identity, locale, hardware and directories", () => {
    expect(method(OS, "get_version", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_version_alias", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_distribution_name", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_model_name", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_unique_id", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_locale", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_locale_language", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_processor_count", []).v).toBeGreaterThan(0);
    expect(method(OS, "get_processor_name", []).t).toBe(Tag.STRING);
    const mem = method(OS, "get_memory_info", []);
    expect(mem.t).toBe(Tag.DICT);
    expect((mem.v as GDict).get(V.str("physical"))!.t).toBe(Tag.INT);
    expect(method(OS, "get_static_memory_usage", []).v).toBeGreaterThan(0);
    expect(method(OS, "get_static_memory_peak_usage", []).v).toBeGreaterThan(0);
    expect(method(OS, "get_temp_dir", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_cache_dir", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_config_dir", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_data_dir", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_user_data_dir", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_system_dir", [V.int(0), V.bool(false)]).t).toBe(Tag.STRING);
    expect(method(OS, "get_system_fonts", []).t).toBe(Tag.OBJECT);
    expect(method(OS, "get_system_font_path", [V.str("Arial"), V.int(400), V.int(100), V.bool(false)]).t).toBe(Tag.STRING);
    expect(method(OS, "get_system_font_path_for_text", [V.str("Arial"), V.str("hi"), V.str("en"), V.str("Latn"), V.int(400), V.int(100), V.bool(false)]).t).toBe(Tag.OBJECT);
    expect(method(OS, "get_system_ca_certificates", []).t).toBe(Tag.STRING);
    expect(method(OS, "get_video_adapter_driver_info", []).t).toBe(Tag.OBJECT);
    expect(method(OS, "get_cmdline_args", []).t).toBe(Tag.OBJECT);
    expect(method(OS, "get_executable_path", []).t).toBe(Tag.STRING);
  });

  it("process, entropy, delays and features", () => {
    expect((method(OS, "get_entropy", [V.int(4)]).v as GBytes).raw().length).toBe(4);
    expect(method(OS, "delay_msec", [V.int(0)]).t).toBe(Tag.NIL);
    expect(method(OS, "delay_usec", [V.int(0)]).t).toBe(Tag.NIL);
    expect(method(OS, "get_process_id", []).v).toBeGreaterThan(0);
    expect(method(OS, "get_main_thread_id", []).t).toBe(Tag.INT);
    expect(method(OS, "get_thread_caller_id", []).t).toBe(Tag.INT);
    expect(method(OS, "set_thread_name", [V.str("worker")]).v).toBe(0);
    expect(method(OS, "is_debug_build", []).v).toBe(false);
    expect(method(OS, "is_sandboxed", []).v).toBe(false);
    expect(method(OS, "is_userfs_persistent", []).v).toBe(true);
    expect(method(OS, "is_stdout_verbose", []).v).toBe(false);
    expect(method(OS, "has_feature", [V.str("pc")]).v).toBe(true);
    expect(method(OS, "has_feature", [V.str("nope")]).v).toBe(false);
    expect(method(OS, "get_stdin_type", []).t).toBe(Tag.INT);
    expect(method(OS, "get_stdout_type", []).t).toBe(Tag.INT);
    expect(method(OS, "get_stderr_type", []).t).toBe(Tag.INT);
    expect(method(OS, "is_process_running", [V.int(process.pid)]).v).toBe(true);
    expect(method(OS, "get_process_exit_code", [V.int(999999)]).v).toBe(-1);
    if (process.platform === "win32") {
      const out = V.array(GArray.of([]));
      expect(method(OS, "execute", [V.str("cmd"), strings(["/c", "echo", "hi"]), out, V.bool(true), V.bool(false)]).v).toBe(0);
      expect((out.v as GArray).raw().length).toBeGreaterThan(0);
      const pipe = method(OS, "execute_with_pipe", [V.str("cmd"), strings(["/c", "echo", "hi"]), V.bool(true)]);
      expect(pipe.t).toBe(Tag.DICT);
      expect((pipe.v as GDict).get(V.str("stdio"))!.t).toBe(Tag.OBJECT);
    }
  });

  it("flags, permissions, midi and keycodes", () => {
    expect(method(OS, "get_granted_permissions", []).t).toBe(Tag.OBJECT);
    expect(method(OS, "request_permission", [V.str("x")]).v).toBe(true);
    expect(method(OS, "request_permissions", []).v).toBe(true);
    expect(method(OS, "revoke_granted_permissions", []).t).toBe(Tag.NIL);
    expect(method(OS, "open_midi_inputs", []).t).toBe(Tag.NIL);
    expect(method(OS, "close_midi_inputs", []).t).toBe(Tag.NIL);
    expect(method(OS, "get_connected_midi_inputs", []).t).toBe(Tag.OBJECT);
    expect(method(OS, "add_logger", [V.nil()]).t).toBe(Tag.NIL);
    expect(method(OS, "remove_logger", [V.nil()]).t).toBe(Tag.NIL);
    method(OS, "set_low_processor_usage_mode", [V.bool(true)]);
    expect(method(OS, "is_in_low_processor_usage_mode", []).v).toBe(true);
    expect(attribute(OS, "low_processor_usage_mode").v).toBe(true);
    writeProp(OS, "low_processor_usage_mode", V.bool(false));
    expect(attribute(OS, "low_processor_usage_mode").v).toBe(false);
    method(OS, "set_low_processor_usage_mode_sleep_usec", [V.int(123)]);
    expect(method(OS, "get_low_processor_usage_mode_sleep_usec", []).v).toBe(123);
    expect(attribute(OS, "low_processor_usage_mode_sleep_usec").v).toBe(123);
    method(OS, "set_delta_smoothing", [V.bool(false)]);
    expect(method(OS, "is_delta_smoothing_enabled", []).v).toBe(false);
    expect(attribute(OS, "delta_smoothing").v).toBe(false);
    writeProp(OS, "delta_smoothing", V.bool(true));
    method(OS, "set_restart_on_exit", [V.bool(true), strings(["--x"])]);
    expect(method(OS, "is_restart_on_exit_set", []).v).toBe(true);
    expect((method(OS, "get_restart_on_exit_arguments", []).v as GBytes).raw()).toEqual(["--x"]);
    method(OS, "set_restart_on_exit", [V.bool(false)]);
    expect(method(OS, "set_use_file_access_save_and_swap", [V.bool(true)]).t).toBe(Tag.NIL);
    expect(method(OS, "get_keycode_string", [V.int(65)]).v).toBe("A");
    expect(method(OS, "get_keycode_string", [V.int(4194305)]).v).toBe("Escape");
    expect(method(OS, "find_keycode_from_string", [V.str("a")]).v).toBe(65);
    expect(method(OS, "find_keycode_from_string", [V.str("Escape")]).v).toBe(4194305);
    expect(method(OS, "find_keycode_from_string", [V.str("nope")]).v).toBe(0);
    expect(method(OS, "is_keycode_unicode", [V.int(65)]).v).toBe(true);
    expect(method(OS, "is_keycode_unicode", [V.int(4194305)]).v).toBe(false);
    method(OS, "set_environment", [V.str("GDS2JS_OS_TEST"), V.str("v")]);
    expect(method(OS, "get_environment", [V.str("GDS2JS_OS_TEST")]).v).toBe("v");
    method(OS, "unset_environment", [V.str("GDS2JS_OS_TEST")]);
    expect(method(OS, "has_environment", [V.str("GDS2JS_OS_TEST")]).v).toBe(false);
  });

  it("system-effect members reject unmeasured argument shapes", () => {
    expect(() => method(OS, "crash", [V.int(1)])).toThrow();
    expect(() => method(OS, "alert", [V.int(1)])).toThrow();
    expect(() => method(OS, "shell_open", [V.int(1)])).toThrow();
    expect(() => method(OS, "shell_show_in_file_manager", [V.int(1)])).toThrow();
    expect(() => method(OS, "move_to_trash", [V.int(1)])).toThrow();
    expect(() => method(OS, "open_with_program", [V.int(1)])).toThrow();
    expect(() => method(OS, "kill", [V.str("x")])).toThrow();
    expect(() => method(OS, "create_process", [V.int(1)])).toThrow();
    expect(() => method(OS, "create_instance", [V.int(1)])).toThrow();
    expect(() => method(OS, "read_buffer_from_stdin", [V.str("x")])).toThrow();
    expect(() => method(OS, "read_string_from_stdin", [V.str("x")])).toThrow();
  });

  it("enum values", () => {
    expect(attribute(OS, "RENDERING_DRIVER_VULKAN").v).toBe(0);
    expect(attribute(OS, "RENDERING_DRIVER_OPENGL3").v).toBe(1);
    expect(attribute(OS, "RENDERING_DRIVER_D3D12").v).toBe(2);
    expect(attribute(OS, "RENDERING_DRIVER_METAL").v).toBe(3);
    expect(attribute(OS, "STD_HANDLE_INVALID").v).toBe(0);
    expect(attribute(OS, "STD_HANDLE_CONSOLE").v).toBe(1);
    expect(attribute(OS, "STD_HANDLE_FILE").v).toBe(2);
    expect(attribute(OS, "STD_HANDLE_PIPE").v).toBe(3);
    expect(attribute(OS, "STD_HANDLE_UNKNOWN").v).toBe(4);
    expect(attribute(OS, "SYSTEM_DIR_DESKTOP").v).toBe(0);
    expect(attribute(OS, "SYSTEM_DIR_DCIM").v).toBe(1);
    expect(attribute(OS, "SYSTEM_DIR_DOCUMENTS").v).toBe(2);
    expect(attribute(OS, "SYSTEM_DIR_DOWNLOADS").v).toBe(3);
    expect(attribute(OS, "SYSTEM_DIR_MOVIES").v).toBe(4);
    expect(attribute(OS, "SYSTEM_DIR_MUSIC").v).toBe(5);
    expect(attribute(OS, "SYSTEM_DIR_PICTURES").v).toBe(6);
    expect(attribute(OS, "SYSTEM_DIR_RINGTONES").v).toBe(7);
  });
});
