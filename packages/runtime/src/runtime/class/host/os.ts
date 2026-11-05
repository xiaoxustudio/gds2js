import { GBytes } from "../bytes/packed";
import { UnsupportedError } from "../../errors";
import { Tag, V, type Variant } from "../../tags";
import { hostProc, procHostMissing } from "../../host-proc";
import { asString } from "../../method/core";

export const OS_STATIC_NAMES = new Set(["get_cmdline_user_args", "get_environment", "has_environment", "get_name", "set_environment"]);

/**
 * 4.6.3 实测：user args 是第一个 `--` 之后的全部，之后再现的 `--` 原样留在表里
 * （`-- x -- y` → `["x", "--", "y"]`），没有 `--` 时它是空表。
 */
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
  throw new UnsupportedError("os-member", `OS.${name}() 这一支没量过`);
}
