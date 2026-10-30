import { Tag, V, tagName, type Variant } from "../tags";
import { UnsupportedError } from "../errors";
import { GdJson, asJson, jsonParse, jsonStringify } from "../json";
import { asString } from "./core";

function boolArg(args: Variant[], at: number, name: string, dflt: boolean): boolean {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  if (v.t !== Tag.BOOL) throw new UnsupportedError("json-arg-type", `JSON.${name}() 的第 ${String(at + 1)} 参只量过 bool（收到 ${tagName(v.t)}）`);
  return v.v === true;
}

function textArg(args: Variant[], at: number, name: string, dflt: string): string {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  return asString(v, `JSON.${name}() 的第 ${String(at + 1)} 参`);
}

function stringifyArgs(name: string, args: Variant[]): string {
  if (args.length < 1 || args.length > 4) {
    throw new UnsupportedError("json-arity", `JSON.${name}() 只量过 1 到 4 个实参（收到 ${String(args.length)} 个）`);
  }
  const indent = textArg(args, 1, name, "");
  const sort = boolArg(args, 2, name, true);
  const full = boolArg(args, 3, name, false);
  return jsonStringify(args[0] as Variant, indent, sort, full);
}

export const JSON_STATIC_NAMES = new Set(["stringify", "parse_string"]);

export function jsonStatic(name: string, args: Variant[]): Variant {
  if (name === "stringify") return V.str(stringifyArgs(name, args));
  return jsonParseResult(textArg(args, 0, name, ""));
}

/** 解析失败那一形走 json.ts 的响亮拒；这里只负责把成功值与实例状态接起来。 */
function jsonParseResult(text: string): Variant {
  return jsonParse(text);
}

function parseCode(j: GdJson, args: Variant[]): Variant {
  const text = textArg(args, 0, "parse", "");
  if (args.length !== 1) throw new UnsupportedError("json-arity", `JSON.parse() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
  j.__gd_json_data = jsonParseResult(text);
  j.__gd_json_error_line = 0;
  return V.int(0);
}

export function jsonMethod(inner: GdJson, name: string, args: Variant[]): Variant {
  switch (name) {
    case "stringify":
      return V.str(stringifyArgs(name, args));
    case "parse_string": {
      const v = jsonParseResult(textArg(args, 0, name, ""));
      inner.__gd_json_error_line = 0;
      return v;
    }
    case "parse":
      return parseCode(inner, args);
    case "get_data":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_data() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return inner.__gd_json_data;
    case "get_error_message":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_error_message() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return V.str(inner.__gd_json_error_message);
    case "get_error_line":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_error_line() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return V.int(inner.__gd_json_error_line);
    default:
      throw new UnsupportedError(
        "json-method",
        `JSON.${name}() 这一支没量过（get_error_column / get_error_global_column / get_error_token 引擎根本没有，parse 失败那几支的消息集还没实测）`,
      );
  }
}

export { asJson, GdJson };
