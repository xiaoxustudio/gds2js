import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw, writeProp as writePropRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GDict } from "@gds2js/runtime/runtime/values";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const writeProp = (recv: any, name: string, value: any): any => writePropRaw(recv, name, value);
const ENGINE = nativeClass("Engine");

describe("runtime/engine face", () => {
  it("version and metadata", () => {
    const info = method(ENGINE, "get_version_info", []);
    expect(info.t).toBe(Tag.DICT);
    expect((info.v as GDict).get(V.str("major"))!.v).toBe(4);
    expect((info.v as GDict).get(V.str("minor"))!.v).toBe(6);
    expect((info.v as GDict).get(V.str("patch"))!.v).toBe(3);
    expect(method(ENGINE, "get_architecture_name", []).t).toBe(Tag.STRING);
    expect(method(ENGINE, "get_author_info", []).t).toBe(Tag.DICT);
    expect(method(ENGINE, "get_donor_info", []).t).toBe(Tag.DICT);
    expect(method(ENGINE, "get_license_info", []).t).toBe(Tag.DICT);
    expect(method(ENGINE, "get_copyright_info", []).t).toBe(Tag.ARRAY);
    expect(String(method(ENGINE, "get_license_text", []).v).length).toBeGreaterThan(0);
    expect(method(ENGINE, "is_editor_hint", []).v).toBe(false);
    expect(method(ENGINE, "is_embedded_in_editor", []).v).toBe(false);
    expect(method(ENGINE, "get_write_movie_path", []).v).toBe("");
  });

  it("loop counters and settings", () => {
    expect(method(ENGINE, "get_frames_drawn", []).t).toBe(Tag.INT);
    expect(method(ENGINE, "get_frames_per_second", []).t).toBe(Tag.FLOAT);
    expect(method(ENGINE, "get_physics_frames", []).t).toBe(Tag.INT);
    expect(method(ENGINE, "get_process_frames", []).t).toBe(Tag.INT);
    expect(method(ENGINE, "get_physics_interpolation_fraction", []).t).toBe(Tag.FLOAT);
    expect(method(ENGINE, "is_in_physics_frame", []).t).toBe(Tag.BOOL);
    method(ENGINE, "set_max_fps", [V.int(30)]);
    expect(method(ENGINE, "get_max_fps", []).v).toBe(30);
    expect(attribute(ENGINE, "max_fps").v).toBe(30);
    writeProp(ENGINE, "max_fps", V.int(0));
    expect(method(ENGINE, "get_max_physics_steps_per_frame", []).t).toBe(Tag.INT);
    expect(method(ENGINE, "get_physics_jitter_fix", []).t).toBe(Tag.FLOAT);
    expect(method(ENGINE, "get_physics_ticks_per_second", []).t).toBe(Tag.INT);
    expect(method(ENGINE, "get_time_scale", []).t).toBe(Tag.FLOAT);
    expect(method(ENGINE, "is_printing_error_messages", []).t).toBe(Tag.BOOL);
    expect(method(ENGINE, "is_printing_to_stdout", []).t).toBe(Tag.BOOL);
    method(ENGINE, "set_max_physics_steps_per_frame", [V.int(4)]);
    expect(attribute(ENGINE, "max_physics_steps_per_frame").v).toBe(4);
    method(ENGINE, "set_physics_jitter_fix", [V.float(0.1)]);
    expect(attribute(ENGINE, "physics_jitter_fix").v).toBeCloseTo(0.1, 5);
    method(ENGINE, "set_physics_ticks_per_second", [V.int(120)]);
    expect(attribute(ENGINE, "physics_ticks_per_second").v).toBe(120);
    method(ENGINE, "set_time_scale", [V.float(2)]);
    expect(attribute(ENGINE, "time_scale").v).toBe(2);
    method(ENGINE, "set_print_error_messages", [V.bool(false)]);
    expect(attribute(ENGINE, "print_error_messages").v).toBe(false);
    method(ENGINE, "set_print_error_messages", [V.bool(true)]);
    method(ENGINE, "set_print_to_stdout", [V.bool(false)]);
    expect(attribute(ENGINE, "print_to_stdout").v).toBe(false);
    method(ENGINE, "set_print_to_stdout", [V.bool(true)]);
    expect(method(ENGINE, "get_main_loop", []).t).toBe(Tag.OBJECT);
  });

  it("singletons and script languages", () => {
    expect(method(ENGINE, "has_singleton", [V.str("Engine")]).v).toBe(true);
    expect(method(ENGINE, "get_singleton", [V.str("Engine")]).t).toBe(Tag.OBJECT);
    expect((method(ENGINE, "get_singleton_list", []).v as GBytes).raw().length).toBeGreaterThan(0);
    const obj = engineClassNew("Object");
    method(ENGINE, "register_singleton", [V.str("MySingleton"), obj]);
    expect(method(ENGINE, "has_singleton", [V.str("MySingleton")]).v).toBe(true);
    expect(method(ENGINE, "get_singleton", [V.str("MySingleton")]).t).toBe(Tag.OBJECT);
    method(ENGINE, "unregister_singleton", [V.str("MySingleton")]);
    expect(method(ENGINE, "has_singleton", [V.str("MySingleton")]).v).toBe(false);
    expect(method(ENGINE, "get_script_language_count", []).v).toBeGreaterThanOrEqual(1);
    expect(method(ENGINE, "get_script_language", [V.int(0)]).t).toBe(Tag.OBJECT);
    const lang = engineClassNew("Object");
    expect(method(ENGINE, "register_script_language", [lang]).v).toBe(0);
    expect(method(ENGINE, "unregister_script_language", [lang]).v).toBe(0);
    expect(method(ENGINE, "capture_script_backtraces", [V.bool(false)]).t).toBe(Tag.ARRAY);
  });
});
