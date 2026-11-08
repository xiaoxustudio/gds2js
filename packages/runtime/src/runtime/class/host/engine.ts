import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray, GDict } from "../../values";
import { GBytes } from "../bytes/packed";
import { ENGINE_META } from "../../engine-meta";
import { GdEngineInstance } from "../object/node";
import { NULL_OBJECT } from "../identity/null-object";
import { sceneTree } from "../object/scene-tree";
import { nativeClass } from "../identity/native-class";

const STATE = {
  maxFps: 0,
  maxPhysicsSteps: 8,
  jitter: 0.5,
  ticks: 60,
  timeScale: 1.0,
  printErrors: true,
  printStdout: true,
  framesDrawn: 0,
  physicsFrames: 0,
  processFrames: 0,
  fps: 0.0,
  interpolation: 0.0,
  inPhysics: false,
  singletons: new Map<string, Variant>(),
  languages: [] as Variant[],
};

function metaValue(value: unknown): Variant {
  if (value === null) return V.nil();
  if (typeof value === "string") return V.str(value);
  if (typeof value === "boolean") return V.bool(value);
  if (typeof value === "number") return Number.isInteger(value) ? V.int(value) : V.float(value);
  if (Array.isArray(value)) return V.array(GArray.of(value.map(metaValue)));
  const d = new GDict();
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) d.set(V.str(k), metaValue(v));
  return V.dict(d);
}

function numAt(args: Variant[], at: number, who: string): number {
  const v = args[at];
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("engine-arg", `Engine.${who}() 的第 ${String(at + 1)} 参只量过数`);
  return Number(v.v as number | bigint);
}

function intAt(args: Variant[], at: number, who: string): number {
  return Math.trunc(numAt(args, at, who));
}

function boolAt(args: Variant[], at: number, fallback: boolean): boolean {
  const v = args[at];
  return v === undefined ? fallback : v.t === Tag.BOOL ? v.v === true : fallback;
}

function nameAt(args: Variant[], at: number, who: string): string {
  const v = args[at];
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("engine-arg", `Engine.${who}() 的名字只量过字符串`);
  return String(v.v);
}

const BUILTIN_SINGLETONS = new Set<string>(ENGINE_META.singletons as readonly string[]);

export function engineStatic(name: string, args: Variant[]): Variant {
  switch (name) {
    case "get_version_info":
      return metaValue(ENGINE_META.version);
    case "get_architecture_name":
      return V.str(process.arch === "x64" ? "x86_64" : process.arch === "arm64" ? "arm64" : "x86_32");
    case "get_author_info":
      return metaValue(ENGINE_META.author);
    case "get_donor_info":
      return metaValue(ENGINE_META.donor);
    case "get_license_info":
      return metaValue(ENGINE_META.license);
    case "get_copyright_info":
      return metaValue(ENGINE_META.copyright);
    case "get_license_text":
      return V.str(ENGINE_META.licenseText);
    case "is_editor_hint":
      return V.bool(false);
    case "is_embedded_in_editor":
      return V.bool(false);
    case "get_main_loop": {
      const tree = sceneTree();
      return tree === null ? V.object(NULL_OBJECT) : V.object(tree);
    }
    case "get_max_fps":
      return V.int(STATE.maxFps);
    case "set_max_fps":
      STATE.maxFps = intAt(args, 0, name);
      return V.nil();
    case "get_max_physics_steps_per_frame":
      return V.int(STATE.maxPhysicsSteps);
    case "set_max_physics_steps_per_frame":
      STATE.maxPhysicsSteps = intAt(args, 0, name);
      return V.nil();
    case "get_physics_jitter_fix":
      return V.float(STATE.jitter);
    case "set_physics_jitter_fix":
      STATE.jitter = numAt(args, 0, name);
      return V.nil();
    case "get_physics_ticks_per_second":
      return V.int(STATE.ticks);
    case "set_physics_ticks_per_second":
      STATE.ticks = intAt(args, 0, name);
      return V.nil();
    case "get_time_scale":
      return V.float(STATE.timeScale);
    case "set_time_scale":
      STATE.timeScale = numAt(args, 0, name);
      return V.nil();
    case "get_frames_drawn":
      return V.int(STATE.framesDrawn);
    case "get_frames_per_second":
      return V.float(STATE.fps);
    case "get_physics_frames":
      return V.int(STATE.physicsFrames);
    case "get_process_frames":
      return V.int(STATE.processFrames);
    case "get_physics_interpolation_fraction":
      return V.float(STATE.interpolation);
    case "is_in_physics_frame":
      return V.bool(STATE.inPhysics);
    case "is_printing_error_messages":
      return V.bool(STATE.printErrors);
    case "set_print_error_messages":
      STATE.printErrors = boolAt(args, 0, true);
      return V.nil();
    case "is_printing_to_stdout":
      return V.bool(STATE.printStdout);
    case "set_print_to_stdout":
      STATE.printStdout = boolAt(args, 0, true);
      return V.nil();
    case "get_write_movie_path":
      return V.str("");
    case "get_script_language_count":
      return V.int(1 + STATE.languages.length);
    case "get_script_language": {
      const idx = intAt(args, 0, name);
      if (idx === 0) return V.object(new GdEngineInstance("GDScript"));
      const lang = STATE.languages[idx - 1];
      return lang === undefined ? V.object(NULL_OBJECT) : lang;
    }
    case "register_script_language": {
      const lang = args[0];
      if (lang === undefined || lang.t !== Tag.OBJECT) throw new UnsupportedError("engine-arg", "Engine.register_script_language() 只量过对象");
      STATE.languages.push(lang);
      return V.int(0);
    }
    case "unregister_script_language": {
      const lang = args[0];
      const at = STATE.languages.findIndex((x) => x === lang);
      if (at >= 0) STATE.languages.splice(at, 1);
      return V.int(0);
    }
    case "get_singleton_list": {
      const names = [...BUILTIN_SINGLETONS, ...STATE.singletons.keys()];
      return V.object(GBytes.of(names, "string"));
    }
    case "has_singleton": {
      const n = nameAt(args, 0, name);
      return V.bool(BUILTIN_SINGLETONS.has(n) || STATE.singletons.has(n));
    }
    case "get_singleton": {
      const n = nameAt(args, 0, name);
      const custom = STATE.singletons.get(n);
      if (custom !== undefined) return custom;
      if (!BUILTIN_SINGLETONS.has(n)) return V.object(NULL_OBJECT);
      if (n === "Engine") return nativeClass("Engine");
      return V.object(new GdEngineInstance(n));
    }
    case "register_singleton": {
      const n = nameAt(args, 0, name);
      const obj = args[1];
      if (obj === undefined) throw new UnsupportedError("engine-arg", "Engine.register_singleton() 少了实例");
      STATE.singletons.set(n, obj);
      return V.nil();
    }
    case "unregister_singleton":
      STATE.singletons.delete(nameAt(args, 0, name));
      return V.nil();
    case "capture_script_backtraces":
      return V.array(GArray.of([V.object(new GdEngineInstance("ScriptBacktrace"))]));
    default:
      throw new UnsupportedError("engine-member", `Engine.${name}() 这一支没量过`);
  }
}

export function enginePropRead(name: string): Variant | null {
  if (name === "max_fps") return engineStatic("get_max_fps", []);
  if (name === "max_physics_steps_per_frame") return engineStatic("get_max_physics_steps_per_frame", []);
  if (name === "physics_jitter_fix") return engineStatic("get_physics_jitter_fix", []);
  if (name === "physics_ticks_per_second") return engineStatic("get_physics_ticks_per_second", []);
  if (name === "time_scale") return engineStatic("get_time_scale", []);
  if (name === "print_error_messages") return engineStatic("is_printing_error_messages", []);
  if (name === "print_to_stdout") return engineStatic("is_printing_to_stdout", []);
  return null;
}

export function enginePropWrite(name: string, value: Variant): boolean {
  const setters: Record<string, string> = {
    max_fps: "set_max_fps",
    max_physics_steps_per_frame: "set_max_physics_steps_per_frame",
    physics_jitter_fix: "set_physics_jitter_fix",
    physics_ticks_per_second: "set_physics_ticks_per_second",
    time_scale: "set_time_scale",
    print_error_messages: "set_print_error_messages",
    print_to_stdout: "set_print_to_stdout",
  };
  const setter = setters[name];
  if (setter === undefined) return false;
  engineStatic(setter, [value]);
  return true;
}
