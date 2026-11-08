import { GBytes } from "../bytes/packed";
import { UnsupportedError } from "../../errors";
import { Tag, V, type Variant } from "../../tags";
import { hostProc, procHostMissing, type OsHost } from "../../host-proc";
import { asString } from "../../method/core";
import { GdFile } from "./file-access";
import { GArray, GDict } from "../../values";

export const OS_STATIC_NAMES = new Set([
  "get_cmdline_user_args", "get_environment", "has_environment", "get_name", "set_environment",
  "add_logger", "alert", "close_midi_inputs", "crash", "create_instance", "create_process",
  "delay_msec", "delay_usec", "execute", "execute_with_pipe", "find_keycode_from_string",
  "get_cache_dir", "get_cmdline_args", "get_config_dir", "get_connected_midi_inputs", "get_data_dir",
  "get_distribution_name", "get_entropy", "get_executable_path", "get_granted_permissions",
  "get_keycode_string", "get_locale", "get_locale_language", "get_low_processor_usage_mode_sleep_usec",
  "get_main_thread_id", "get_memory_info", "get_model_name", "get_process_exit_code", "get_process_id",
  "get_processor_count", "get_processor_name", "get_restart_on_exit_arguments", "get_static_memory_peak_usage",
  "get_static_memory_usage", "get_stderr_type", "get_stdin_type", "get_stdout_type", "get_system_ca_certificates",
  "get_system_dir", "get_system_font_path", "get_system_font_path_for_text", "get_system_fonts", "get_temp_dir",
  "get_thread_caller_id", "get_unique_id", "get_user_data_dir", "get_version", "get_version_alias",
  "get_video_adapter_driver_info", "has_feature", "is_debug_build", "is_delta_smoothing_enabled",
  "is_in_low_processor_usage_mode", "is_keycode_unicode", "is_process_running", "is_restart_on_exit_set",
  "is_sandboxed", "is_stdout_verbose", "is_userfs_persistent", "kill", "move_to_trash", "open_midi_inputs",
  "open_with_program", "read_buffer_from_stdin", "read_string_from_stdin", "remove_logger",
  "request_permission", "request_permissions", "revoke_granted_permissions", "set_delta_smoothing",
  "set_low_processor_usage_mode", "set_low_processor_usage_mode_sleep_usec", "set_restart_on_exit",
  "set_thread_name", "set_use_file_access_save_and_swap", "shell_open", "shell_show_in_file_manager",
  "unset_environment",
]);

const STATE = {
  lowProcessor: false,
  lowSleep: 6900,
  deltaSmoothing: true,
  restartOnExit: false,
  restartArgs: [] as string[],
  peak: 0,
};

const KEY_SPECIAL = 4194304;

const KEY_NAMES: Readonly<Record<string, number>> = {
  Escape: 1, Tab: 2, Backtab: 3, Backspace: 4, Enter: 5, "Kp Enter": 6, Insert: 7, Delete: 8,
  Pause: 9, Print: 10, SysReq: 11, Clear: 12, Home: 13, End: 14, Left: 15, Up: 16, Right: 17, Down: 18,
  PageUp: 19, PageDown: 20, Shift: 21, Ctrl: 22, Meta: 23, Alt: 24, CapsLock: 25, NumLock: 26, ScrollLock: 27,
  F1: 28, F2: 29, F3: 30, F4: 31, F5: 32, F6: 33, F7: 34, F8: 35, F9: 36, F10: 37, F11: 38, F12: 39,
  F13: 40, F14: 41, F15: 42, F16: 43, F17: 44, F18: 45, F19: 46, F20: 47, F21: 48, F22: 49, F23: 50, F24: 51,
  Menu: 56, Hyper: 57, Help: 58, Back: 59, Forward: 60, Stop: 61, Refresh: 62, VolumeDown: 63, VolumeMute: 64, VolumeUp: 65,
  "Kp Multiply": 74, "Kp Divide": 75, "Kp Subtract": 76, "Kp Period": 77, "Kp Add": 78,
  "Kp 0": 79, "Kp 1": 80, "Kp 2": 81, "Kp 3": 82, "Kp 4": 83, "Kp 5": 84, "Kp 6": 85, "Kp 7": 86, "Kp 8": 87, "Kp 9": 88,
};

const KEY_BY_CODE: ReadonlyMap<number, string> = new Map(Object.entries(KEY_NAMES).map(([k, v]) => [KEY_SPECIAL + v, k]));

export function userArgsOf(argv: string[]): string[] {
  const at = argv.indexOf("--");
  return at < 0 ? [] : argv.slice(at + 1);
}

function nameArg(args: Variant[], who: string): string {
  const v = args[0] as Variant | undefined;
  if (v === undefined || v.t !== Tag.STRING) throw new UnsupportedError("os-arg-type", `OS.${who}() 的第 1 参只量过 String（收到的是别的东西）`);
  return asString(v, `OS.${who}() 的第 1 参`);
}

function zeroArgs(args: Variant[], who: string): void {
  if (args.length !== 0) throw new UnsupportedError("os-arity", `OS.${who}() 只量过 0 参（收到 ${String(args.length)} 支）`);
}

function oneArg(args: Variant[], who: string): void {
  if (args.length !== 1) throw new UnsupportedError("os-arity", `OS.${who}() 只量过 1 参（收到 ${String(args.length)} 支）`);
}

function textAt(args: Variant[], at: number, who: string): string {
  const v = args[at];
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) throw new UnsupportedError("os-arg-type", `OS.${who}() 的第 ${String(at + 1)} 参只量过字符串`);
  return String(v.v);
}

function numAt(args: Variant[], at: number, who: string): number {
  const v = args[at];
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("os-arg-type", `OS.${who}() 的第 ${String(at + 1)} 参只量过数`);
  return Math.trunc(Number(v.v as number | bigint));
}

function boolAt(args: Variant[], at: number, fallback: boolean): boolean {
  const v = args[at];
  return v === undefined ? fallback : v.t === Tag.BOOL ? v.v === true : fallback;
}

function stringsAt(args: Variant[], at: number, who: string): string[] {
  const v = args[at];
  if (v !== undefined && v.t === Tag.ARRAY) return (v.v as GArray).raw().map((x) => String(x.v));
  if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) throw new UnsupportedError("os-arg-type", `OS.${who}() 的参数表只量过 PackedStringArray / Array`);
  return (v.v as GBytes).raw().map((x) => String(x));
}

function osHost(): OsHost {
  const table = hostProc();
  if (table === null) procHostMissing();
  if (table.os === undefined) throw new UnsupportedError("os-host-missing", "这一份宿主没有注册 OS 能力表");
  return table.os;
}

function packStrings(items: string[]): Variant {
  return V.object(GBytes.of(items, "string"));
}

function featureSet(): Set<string> {
  const platform = process.platform === "win32" ? "windows" : process.platform === "darwin" ? "macos" : "linux";
  const arch = process.arch === "x64" ? "x86_64" : process.arch === "arm64" ? "arm64" : "x86_32";
  return new Set([platform, arch, "pc", "release", "template", "threads"]);
}

export function osStatic(name: string, args: Variant[]): Variant {
  const table = hostProc();
  if (table === null) procHostMissing();
  if (name === "get_cmdline_user_args") {
    zeroArgs(args, name);
    return V.object(GBytes.of(userArgsOf(table.argv()), "string"));
  }
  if (name === "get_environment") {
    oneArg(args, name);
    return V.str(table.env(nameArg(args, name)) ?? "");
  }
  if (name === "has_environment") {
    oneArg(args, name);
    return V.bool(table.env(nameArg(args, name)) !== null);
  }
  if (name === "get_name") {
    zeroArgs(args, name);
    if (table.osName === undefined) throw new UnsupportedError("os-host-name-missing", "这一份宿主没有注册 OS 名称");
    return V.str(table.osName());
  }
  if (name === "set_environment") {
    if (args.length !== 2) throw new UnsupportedError("os-arity", `OS.set_environment() 只量过 2 参（收到 ${String(args.length)} 支）`);
    const key = nameArg(args, name);
    const value = args[1] as Variant | undefined;
    if (value === undefined || value.t !== Tag.STRING) throw new UnsupportedError("os-arg-type", "OS.set_environment() 的第 2 参只量过 String");
    if (table.setEnv === undefined) throw new UnsupportedError("os-host-setenv-missing", "这一份宿主没有注册 setenv");
    table.setEnv(key, asString(value, "OS.set_environment() 的第 2 参"));
    return V.nil();
  }
  const host = osHost();
  switch (name) {
    case "unset_environment":
      host.unsetEnv(textAt(args, 0, name));
      return V.nil();
    case "get_cmdline_args":
      return packStrings(table.argv());
    case "get_executable_path":
      return V.str(process.execPath);
    case "get_version":
      return V.str(host.version());
    case "get_version_alias":
      return V.str(host.versionAlias());
    case "get_distribution_name":
      return V.str(table.osName === undefined ? "" : table.osName());
    case "get_model_name":
      return V.str(host.modelName());
    case "get_unique_id":
      return V.str(host.uniqueId());
    case "get_locale":
      return V.str(host.locale());
    case "get_locale_language":
      return V.str(host.locale().split("_")[0] ?? "");
    case "get_processor_count":
      return V.int(host.processorCount());
    case "get_processor_name":
      return V.str(host.processorName());
    case "get_memory_info": {
      const m = host.memory();
      const d = new GDict();
      d.set(V.str("physical"), V.int(m.physical));
      d.set(V.str("free"), V.int(m.free));
      d.set(V.str("available"), V.int(m.available));
      d.set(V.str("stack"), V.int(m.stack));
      return V.dict(d);
    }
    case "get_static_memory_usage": {
      const used = process.memoryUsage().heapUsed;
      STATE.peak = Math.max(STATE.peak, used);
      return V.int(used);
    }
    case "get_static_memory_peak_usage":
      return V.int(Math.max(STATE.peak, process.memoryUsage().heapUsed));
    case "get_temp_dir":
      return V.str(host.tempDir());
    case "get_cache_dir":
      return V.str(host.cacheDir());
    case "get_config_dir":
      return V.str(host.configDir());
    case "get_data_dir":
      return V.str(host.dataDir());
    case "get_user_data_dir":
      return V.str(host.userDataDir());
    case "get_system_dir":
      return V.str(host.systemDir(numAt(args, 0, name)));
    case "get_system_fonts":
      return packStrings(host.fonts());
    case "get_system_font_path":
      return V.str(host.fontPath(textAt(args, 0, name), numAt(args, 1, name), numAt(args, 2, name), boolAt(args, 3, false)));
    case "get_system_font_path_for_text": {
      const hit = host.fontPath(textAt(args, 0, name), numAt(args, 4, name), numAt(args, 5, name), boolAt(args, 6, false));
      return packStrings(hit === "" ? [] : [hit]);
    }
    case "get_system_ca_certificates":
      return V.str(host.caCertificates());
    case "get_entropy":
      return V.object(GBytes.of(host.entropy(numAt(args, 0, name)), "byte"));
    case "delay_msec":
      host.delay(numAt(args, 0, name) * 1000);
      return V.nil();
    case "delay_usec":
      host.delay(numAt(args, 0, name));
      return V.nil();
    case "get_process_id":
      return V.int(process.pid);
    case "get_main_thread_id":
    case "get_thread_caller_id":
      return V.int(1);
    case "set_thread_name":
      return V.int(0);
    case "is_debug_build":
      return V.bool(false);
    case "is_sandboxed":
      return V.bool(false);
    case "is_userfs_persistent":
      return V.bool(true);
    case "is_stdout_verbose":
      return V.bool(false);
    case "has_feature":
      return V.bool(featureSet().has(textAt(args, 0, name)));
    case "get_stdin_type":
      return V.int(host.stdinType());
    case "get_stdout_type":
      return V.int(host.stdoutType());
    case "get_stderr_type":
      return V.int(host.stderrType());
    case "read_buffer_from_stdin":
      return V.object(GBytes.of(host.readStdin(numAt(args, 0, name)), "byte"));
    case "read_string_from_stdin":
      return V.str(new TextDecoder().decode(new Uint8Array(host.readStdin(numAt(args, 0, name)))));
    case "get_granted_permissions":
      return packStrings([]);
    case "request_permission":
    case "request_permissions":
      return V.bool(true);
    case "revoke_granted_permissions":
      return V.nil();
    case "open_midi_inputs":
    case "close_midi_inputs":
      return V.nil();
    case "get_connected_midi_inputs":
      return packStrings([]);
    case "get_video_adapter_driver_info":
      return packStrings([]);
    case "add_logger":
    case "remove_logger":
      return V.nil();
    case "is_in_low_processor_usage_mode":
      return V.bool(STATE.lowProcessor);
    case "set_low_processor_usage_mode":
      STATE.lowProcessor = boolAt(args, 0, false);
      return V.nil();
    case "get_low_processor_usage_mode_sleep_usec":
      return V.int(STATE.lowSleep);
    case "set_low_processor_usage_mode_sleep_usec":
      STATE.lowSleep = numAt(args, 0, name);
      return V.nil();
    case "is_delta_smoothing_enabled":
      return V.bool(STATE.deltaSmoothing);
    case "set_delta_smoothing":
      STATE.deltaSmoothing = boolAt(args, 0, false);
      return V.nil();
    case "is_restart_on_exit_set":
      return V.bool(STATE.restartOnExit);
    case "get_restart_on_exit_arguments":
      return packStrings(STATE.restartArgs);
    case "set_restart_on_exit":
      STATE.restartOnExit = boolAt(args, 0, false);
      STATE.restartArgs = args.length > 1 ? stringsAt(args, 1, name) : [];
      return V.nil();
    case "set_use_file_access_save_and_swap":
      return V.nil();
    case "get_keycode_string": {
      const code = numAt(args, 0, name);
      if (code === 32) return V.str("Space");
      if (code >= KEY_SPECIAL) return V.str(KEY_BY_CODE.get(code) ?? "");
      if (code >= 33 && code <= 126) return V.str(String.fromCharCode(code).toUpperCase());
      return V.str("");
    }
    case "find_keycode_from_string": {
      const text = textAt(args, 0, name);
      if (text.length === 1) return V.int(text.toUpperCase().charCodeAt(0));
      if (text === "Space") return V.int(32);
      for (const [key, value] of Object.entries(KEY_NAMES)) {
        if (key.toLowerCase() === text.toLowerCase()) return V.int(KEY_SPECIAL + value);
      }
      return V.int(0);
    }
    case "is_keycode_unicode": {
      const code = numAt(args, 0, name);
      return V.bool(code >= 0 && code < KEY_SPECIAL);
    }
    case "execute": {
      const path = textAt(args, 0, name);
      const argv = stringsAt(args, 1, name);
      const output = args[2];
      const readStderr = boolAt(args, 3, false);
      const openConsole = boolAt(args, 4, false);
      const result = host.execute(path, argv, readStderr, openConsole);
      if (output !== undefined && output.t === Tag.ARRAY) {
        const arr = output.v as GArray;
        for (const line of result.output) arr.append(V.str(line));
      }
      return V.int(result.code);
    }
    case "execute_with_pipe": {
      const path = textAt(args, 0, name);
      const argv = stringsAt(args, 1, name);
      const result = host.execute(path, argv, true, false);
      const stdio = new GdFile();
      stdio.opened = true;
      stdio.bytes = [...new TextEncoder().encode(result.output.join(""))];
      const stderr = new GdFile();
      stderr.opened = true;
      const d = new GDict();
      d.set(V.str("stdio"), V.object(stdio));
      d.set(V.str("stderr"), V.object(stderr));
      d.set(V.str("pid"), V.int(process.pid));
      return V.dict(d);
    }
    case "create_process":
      return V.int(host.createProcess(textAt(args, 0, name), stringsAt(args, 1, name), boolAt(args, 2, false)));
    case "create_instance":
      return V.int(host.createProcess(process.execPath, stringsAt(args, 0, name), false));
    case "kill":
      return V.int(host.kill(numAt(args, 0, name)));
    case "is_process_running":
      return V.bool(host.isProcessRunning(numAt(args, 0, name)));
    case "get_process_exit_code":
      return V.int(host.processExitCode(numAt(args, 0, name)));
    case "shell_open":
      return V.int(host.shellOpen(textAt(args, 0, name)));
    case "shell_show_in_file_manager":
      return V.int(host.shellShow(textAt(args, 0, name), boolAt(args, 1, false)));
    case "move_to_trash":
      return V.int(host.moveToTrash(textAt(args, 0, name)));
    case "open_with_program":
      return V.int(host.openWithProgram(textAt(args, 0, name), stringsAt(args, 1, name)));
    case "alert":
      host.alert(textAt(args, 0, name), textAt(args, 1, name));
      return V.nil();
    case "crash":
      host.crash(textAt(args, 0, name));
      return V.nil();
    default:
      throw new UnsupportedError("os-member", `OS.${name}() 这一支没量过`);
  }
}

export function osPropRead(name: string): Variant | null {
  if (name === "delta_smoothing") return osStatic("is_delta_smoothing_enabled", []);
  if (name === "low_processor_usage_mode") return osStatic("is_in_low_processor_usage_mode", []);
  if (name === "low_processor_usage_mode_sleep_usec") return osStatic("get_low_processor_usage_mode_sleep_usec", []);
  return null;
}

export function osPropWrite(name: string, value: Variant): boolean {
  if (name === "delta_smoothing") {
    osStatic("set_delta_smoothing", [value]);
    return true;
  }
  if (name === "low_processor_usage_mode") {
    osStatic("set_low_processor_usage_mode", [value]);
    return true;
  }
  if (name === "low_processor_usage_mode_sleep_usec") {
    osStatic("set_low_processor_usage_mode_sleep_usec", [value]);
    return true;
  }
  return false;
}
