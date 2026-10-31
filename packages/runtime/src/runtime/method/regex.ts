import { Tag, V, intToNum, type Variant } from "../tags";
import { UnsupportedError } from "../errors";
import * as rx from "../regex";
import { asString } from "./core";

function textArg(args: Variant[], at: number, who: string): string {
  const v = args[at] as Variant | undefined;
  if (v === undefined) throw new UnsupportedError("rx-arity", `RegEx.${who}() 的第 ${String(at + 1)} 参没给`);
  if (v.t !== Tag.STRING) throw new UnsupportedError("rx-arg-type", `RegEx.${who}() 的第 ${String(at + 1)} 参只量过 String（收到的是别的东西）`);
  return asString(v, `RegEx.${who}() 的第 ${String(at + 1)} 参`);
}

function intArg(args: Variant[], at: number, who: string, dflt: number): number {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  if (v.t !== Tag.INT) throw new UnsupportedError("rx-arg-type", `RegEx.${who}() 的第 ${String(at + 1)} 参只量过 int（收到的是别的东西）`);
  return intToNum(v.v as number | bigint);
}

function tooMany(args: Variant[], max: number, who: string): void {
  if (args.length > max) {
    throw new UnsupportedError("rx-arity", `RegEx.${who}() 只量过前 ${String(max)} 参（收到 ${String(args.length)} 个）`);
  }
}

export function regExMethod(rx0: rx.GdRegEx, name: string, args: Variant[]): Variant {
  switch (name) {
    case "compile": {
      tooMany(args, 1, "compile");
      return V.int(rx.regexCompile(rx0, textArg(args, 0, "compile")));
    }
    case "search": {
      tooMany(args, 2, "search");
      return rx.regexSearch(rx0, textArg(args, 0, "search"), intArg(args, 1, "search", 0));
    }
    case "search_all": {
      tooMany(args, 2, "search_all");
      return rx.regexSearchAll(rx0, textArg(args, 0, "search_all"), intArg(args, 1, "search_all", 0));
    }
    case "sub": {
      tooMany(args, 4, "sub");
      const text = textArg(args, 0, "sub");
      const by = textArg(args, 1, "sub");
      return V.str(rx.regexSub(rx0, text, by, intArg(args, 2, "sub", 0), intArg(args, 3, "sub", 0)));
    }
    case "is_valid":
      tooMany(args, 0, "is_valid");
      return V.bool(rx.regexIsValid(rx0));
    case "get_pattern":
      tooMany(args, 0, "get_pattern");
      return V.str(rx0.pattern);
    case "get_names":
      tooMany(args, 0, "get_names");
      return rx.regexNames(rx0);
    case "get_group_count":
      tooMany(args, 0, "get_group_count");
      return V.int(rx0.groupCount);
    case "clear":
      tooMany(args, 0, "clear");
      rx.regexClear(rx0);
      return V.nil();
    default:
      throw new UnsupportedError("rx-method", `RegEx 实例的 .${name}() 没建模（量过的是 compile / search / search_all / sub / is_valid / get_pattern / get_names / get_group_count / clear；create_from_string 返回新实例，那一支的面没量完）`);
  }
}

export function regExMatchMethod(rd: rx.GdRegExMatch, name: string, args: Variant[]): Variant {
  const who = `RegExMatch.${name}`;
  switch (name) {
    case "get_start":
    case "get_end": {
      tooMany(args, 1, who);
      const group = intArg(args, 0, who, 0);
      const at = name === "get_start" ? rd.starts[group] : rd.ends[group];
      return V.int(at === undefined ? -1 : at);
    }
    case "get_string": {
      tooMany(args, 1, who);
      const group = intArg(args, 0, who, 0);
      return V.str(rd.strings[group] ?? "");
    }
    case "get_strings":
      tooMany(args, 0, who);
      return rx.matchStrings(rd);
    case "get_names":
      tooMany(args, 0, who);
      return rx.matchNames(rd);
    case "get_group_count":
      tooMany(args, 0, who);
      return V.int(rd.strings.length - 1);
    case "get_subject":
      tooMany(args, 0, who);
      return V.str(rd.subject);
    default:
      throw new UnsupportedError("rxm-method", `RegExMatch 的 .${name}() 没建模（量过的是 get_start / get_end / get_string / get_strings / get_names / get_group_count / get_subject；get_named_group 那支引擎里根本不存在）`);
  }
}
