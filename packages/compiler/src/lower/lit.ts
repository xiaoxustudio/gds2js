import { parseGdDouble } from "@gds2js/runtime/shared/double";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { GLOBAL_CALLABLES } from "@gds2js/runtime/runtime/global-names";
import type { CsNode as SyntaxNode, CsTree as Tree } from "../parse/cst";
import type {
  ClassDecl,
  EnumDecl,
  EnumMember,
  Expr,
  FuncDecl,
  Loc,
  MatchArm,
  Module,
  Param,
  Pattern,
  PropAccessor,
  PropGetter,
  PropSetter,
  SignalDecl,
  Stmt,
  TypeRef,
  VarDecl,
} from "./ir";

/** 整数字面量必须原样保住精度：先 `Number()` 会四舍五入、BigInt 那条路就拿不到正确值，所以 2^53 内用 number、超出用 bigint 字面量。顺带剥掉 GDScript 的 `1_000_000` 下划线。 */
export function lowerIntLit(text: string): number | bigint {
  const t = text.replace(/_/g, "");
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : BigInt(t);
}

/** `&"abc"` 的 CST 文本连前导 `&` 一起给，剥掉后才能和 String 共用同一套转义解码。 */
export function stripAmp(text: string): string {
  return text.startsWith("&") ? text.slice(1) : text;
}

export function stripCaret(text: string): string {
  return text.startsWith("^") ? text.slice(1) : text;
}

export function unquote(raw: string): string {
  if (raw.length < 2 || !(raw.startsWith('"') || raw.startsWith("'"))) return raw;
  const inner = raw.slice(1, -1);
  const parts: Array<string | number> = [];
  const pushLit = (ch: string) => {
    const last = parts[parts.length - 1];
    if (typeof last === "string") parts[parts.length - 1] = last + ch;
    else parts.push(ch);
  };
  const pushEsc = (cp: number) => parts.push(cp);

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]!;
    if (ch !== "\\") {
      const lead = inner.charCodeAt(i);
      if (lead >= 0xd800 && lead <= 0xdbff && i + 1 < inner.length) {
        const trail = inner.charCodeAt(i + 1);
        if (trail >= 0xdc00 && trail <= 0xdfff) {
          pushLit(inner.slice(i, i + 2));
          i++;
          continue;
        }
      }
      pushLit(ch);
      continue;
    }
    const e = inner[++i];
    if (e === undefined) {
      throw new UnsupportedError("string-escape", "字符串以孤立反斜杠结尾");
    }
    switch (e) {
      case "n": pushLit("\n"); break;
      case "t": pushLit("\t"); break;
      case "r": pushLit("\r"); break;
      case "a": pushEsc(0x07); break;
      case "b": pushEsc(0x08); break;
      case "f": pushEsc(0x0c); break;
      case "v": pushEsc(0x0b); break;
      case "\\": pushLit("\\"); break;
      case '"': pushLit('"'); break;
      case "'": pushLit("'"); break;
      case "u":
      case "U": {
        const width = e === "u" ? 4 : 6;
        const hex = inner.slice(i + 1, i + 1 + width);
        if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(hex)) {
          throw new UnsupportedError(
            "string-escape",
            `\\${e} 需要恰好 ${width} 位十六进制，收到 "${hex}"（Godot: Invalid hexadecimal digit in unicode escape sequence）`,
          );
        }
        pushEsc(parseInt(hex, 16));
        i += width;
        break;
      }
      default:
        throw new UnsupportedError(
          "string-escape",
          `不支持的字符串转义 \\${e}（GDScript 无 \\x；实测 Godot 对 \\x41 报 Parse Error: Invalid escape in string）`,
        );
    }
  }

  let out = "";
  for (let k = 0; k < parts.length; k++) {
    const p = parts[k]!;
    if (typeof p === "string") {
      out += p;
      continue;
    }
    const hi = p as number;
    if (hi >= 0xd800 && hi <= 0xdbff) {
      const q = parts[k + 1];
      if (typeof q === "number" && q >= 0xdc00 && q <= 0xdfff) {
        out += String.fromCodePoint(0x10000 + (hi - 0xd800) * 1024 + (q - 0xdc00));
        k++;
        continue;
      }
      throw new UnsupportedError(
        "string-escape",
        `\\u${hi.toString(16)} 是孤立的前置代理（Godot: Invalid UTF-16 sequence in string, unpaired lead surrogate）`,
      );
    }
    if (hi >= 0xdc00 && hi <= 0xdfff) {
      throw new UnsupportedError(
        "string-escape",
        `\\u${hi.toString(16)} 是孤立的后续代理（Godot: Invalid UTF-16 sequence in string, unpaired trail surrogate）`,
      );
    }
    out += hi === 0 || hi > 0x10ffff ? "\uFFFD" : String.fromCodePoint(hi);
  }
  return out;
}
