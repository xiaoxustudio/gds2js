import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray, GDict } from "../../values";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { attribute, index } from "../../method/access";
import { callCallableBox } from "../../method/callable";
import { globalCallable, GLOBAL_CALLABLE_IMPLEMENTED } from "../../method/globals";
import { ops } from "../../ops";
import { vector2New } from "../vector/vector2";
import { vector3New } from "../vector/vector3";
import { vector2iNew } from "../vector/vector2i";
import { vector3iNew } from "../vector/vector3i";
import { vector4New } from "../vector/vector4";
import { vector4iNew } from "../vector/vector4i";
import { colorNew } from "../color/color";

type TokenKind = "num" | "str" | "ident" | "punct" | "end";

interface Token {
  kind: TokenKind;
  text: string;
  value?: Variant;
  pos: number;
}

const PUNCT = ["**", "==", "!=", "<=", ">=", "&&", "||", "(", ")", "[", "]", "{", "}", ",", ":", "+", "-", "*", "/", "%", "<", ">", "!", "?"];

const CONSTRUCTORS: Readonly<Record<string, (args: Variant[]) => Variant>> = {
  Vector2: vector2New,
  Vector2i: vector2iNew,
  Vector3: vector3New,
  Vector3i: vector3iNew,
  Vector4: vector4New,
  Vector4i: vector4iNew,
  Color: colorNew,
};

class ParseError extends Error {}

function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i] as string;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "#") break;
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(text[i + 1] ?? ""))) {
      let j = i;
      const hex = c === "0" && (text[i + 1] === "x" || text[i + 1] === "X");
      if (hex) j += 2;
      while (j < text.length && (hex ? /[0-9a-fA-F]/.test(text[j] as string) : /[0-9eE+\-.]/.test(text[j] as string))) {
        if (!hex && (text[j] === "+" || text[j] === "-") && !/[eE]/.test(text[j - 1] as string)) break;
        j++;
      }
      const raw = text.slice(i, j);
      const value = hex ? V.int(parseInt(raw.slice(2), 16)) : raw.includes(".") || /[eE]/.test(raw) ? V.float(Number(raw)) : safeInt(raw);
      out.push({ kind: "num", text: raw, value, pos: i });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let s = "";
      while (j < text.length && text[j] !== c) {
        if (text[j] === "\\") {
          j++;
          const e = text[j] as string;
          s += e === "n" ? "\n" : e === "t" ? "\t" : e === "r" ? "\r" : e;
        } else s += text[j];
        j++;
      }
      if (j >= text.length) throw new ParseError("Unterminated string.");
      out.push({ kind: "str", text: text.slice(i, j + 1), value: V.str(s), pos: i });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < text.length && /[A-Za-z0-9_]/.test(text[j] as string)) j++;
      out.push({ kind: "ident", text: text.slice(i, j), pos: i });
      i = j;
      continue;
    }
    const punct = PUNCT.find((p) => text.startsWith(p, i));
    if (punct === undefined) throw new ParseError(`Unexpected character '${c}'.`);
    out.push({ kind: "punct", text: punct, pos: i });
    i += punct.length;
  }
  out.push({ kind: "end", text: "", pos: text.length });
  return out;
}

function safeInt(raw: string): Variant {
  const n = Number(raw);
  if (!Number.isSafeInteger(n)) throw new ParseError("Integer literal out of range.");
  return V.int(n);
}

class Parser {
  private at = 0;
  constructor(
    private readonly tokens: Token[],
    private readonly inputs: ReadonlyMap<string, Variant>,
    private readonly base: Variant,
    private readonly validate = false,
  ) {}

  private peek(): Token {
    return this.tokens[this.at] as Token;
  }

  private next(): Token {
    return this.tokens[this.at++] as Token;
  }

  private is(text: string): boolean {
    const t = this.peek();
    return (t.kind === "punct" || t.kind === "ident") && t.text === text;
  }

  private expect(text: string): void {
    if (!this.is(text)) throw new ParseError(`Expected '${text}'.`);
    this.at++;
  }

  parse(): Variant {
    const value = this.ternary();
    if (this.peek().kind !== "end") throw new ParseError("Expected end of expression.");
    return value;
  }

  private ternary(): Variant {
    const value = this.orExpr();
    if (this.is("if")) {
      this.next();
      const cond = this.orExpr();
      this.expect("else");
      const other = this.ternary();
      return this.validate ? V.nil() : ops.truthy(cond) ? value : other;
    }
    return value;
  }

  private orExpr(): Variant {
    let left = this.andExpr();
    while (this.is("or") || this.is("||")) {
      this.next();
      const right = this.andExpr();
      if (!this.validate) left = V.bool(ops.truthy(left) || ops.truthy(right));
    }
    return left;
  }

  private andExpr(): Variant {
    let left = this.notExpr();
    while (this.is("and") || this.is("&&")) {
      this.next();
      const right = this.notExpr();
      if (!this.validate) left = V.bool(ops.truthy(left) && ops.truthy(right));
    }
    return left;
  }

  private notExpr(): Variant {
    if (this.is("not") || this.is("!")) {
      this.next();
      const inner = this.notExpr();
      return this.validate ? V.nil() : V.bool(!ops.truthy(inner));
    }
    return this.compareExpr();
  }

  private compareExpr(): Variant {
    let left = this.addExpr();
    for (;;) {
      const t = this.peek();
      if (t.kind !== "punct" && t.kind !== "ident") break;
      const op = t.text;
      if (op !== "==" && op !== "!=" && op !== "<" && op !== "<=" && op !== ">" && op !== ">=" && op !== "in") break;
      this.next();
      const right = this.addExpr();
      if (this.validate) {
        left = V.nil();
        continue;
      }
      left =
        op === "==" ? ops.eq(left, right) :
        op === "!=" ? ops.neq(left, right) :
        op === "<" ? ops.lt(left, right) :
        op === "<=" ? ops.lte(left, right) :
        op === ">" ? ops.gt(left, right) :
        op === ">=" ? ops.gte(left, right) :
        ops.inOp(left, right);
    }
    return left;
  }

  private addExpr(): Variant {
    let left = this.mulExpr();
    while (this.is("+") || this.is("-")) {
      const op = this.next().text;
      const right = this.mulExpr();
      if (!this.validate) left = op === "+" ? ops.add(left, right) : ops.sub(left, right);
    }
    return left;
  }

  private mulExpr(): Variant {
    let left = this.unaryExpr();
    while (this.is("*") || this.is("/") || this.is("%")) {
      const op = this.next().text;
      const right = this.unaryExpr();
      if (!this.validate) left = op === "*" ? ops.mul(left, right) : op === "/" ? ops.div(left, right) : ops.mod(left, right, false);
    }
    return left;
  }

  private unaryExpr(): Variant {
    if (this.is("-")) {
      this.next();
      const inner = this.unaryExpr();
      return this.validate ? V.nil() : ops.neg(inner);
    }
    if (this.is("+")) {
      this.next();
      return this.unaryExpr();
    }
    return this.powExpr();
  }

  private powExpr(): Variant {
    const base = this.postfix();
    if (this.is("**")) {
      this.next();
      const exp = this.unaryExpr();
      return this.validate ? V.nil() : ops.pow(base, exp);
    }
    return base;
  }

  private postfix(): Variant {
    let value = this.primary();
    for (;;) {
      if (this.is("(")) {
        this.next();
        const args = this.args(")");
        value = this.call(value, args);
        continue;
      }
      if (this.is("[")) {
        this.next();
        const idx = this.ternary();
        this.expect("]");
        if (!this.validate) value = index(value, idx);
        continue;
      }
      break;
    }
    return value;
  }

  private call(target: Variant, args: Variant[]): Variant {
    if (this.validate) return V.nil();
    const name = (target as unknown as { __exprCall?: string }).__exprCall;
    if (name === undefined) throw new ParseError("Cannot call this expression.");
    if (CONSTRUCTORS[name] !== undefined) return (CONSTRUCTORS[name] as (a: Variant[]) => Variant)(args);
    if (!GLOBAL_CALLABLE_IMPLEMENTED.has(name)) throw new UnsupportedError("expression-call", `Expression 调用的全局函数 ${name}() 没量过`);
    return callCallableBox(globalCallable(name).v as never, args);
  }

  private args(close: string): Variant[] {
    const out: Variant[] = [];
    if (this.is(close)) {
      this.next();
      return out;
    }
    for (;;) {
      out.push(this.ternary());
      if (this.is(",")) {
        this.next();
        if (this.is(close)) {
          this.next();
          return out;
        }
        continue;
      }
      this.expect(close);
      return out;
    }
  }

  private primary(): Variant {
    const t = this.next();
    if (t.kind === "num" || t.kind === "str") return t.value as Variant;
    if (t.kind === "ident") {
      const name = t.text;
      if (name === "true") return V.bool(true);
      if (name === "false") return V.bool(false);
      if (name === "null") return V.nil();
      if (name === "PI") return V.float(Math.PI);
      if (name === "TAU") return V.float(Math.PI * 2);
      if (name === "INF") return V.float(Infinity);
      if (name === "NAN") return V.float(NaN);
      if (this.inputs.has(name)) return this.inputs.get(name) as Variant;
      const callable = { __exprCall: name } as unknown as Variant;
      if (this.is("(")) return callable;
      if (this.validate) return V.nil();
      if (this.base.t !== Tag.NIL) return attribute(this.base, name) as Variant;
      throw new ParseError("Instance is null (not passed), cannot use self.");
    }
    if (t.text === "(") {
      const value = this.ternary();
      this.expect(")");
      return value;
    }
    if (t.text === "[") {
      return V.array(GArray.of(this.args("]")));
    }
    if (t.text === "{") {
      const d = new GDict();
      if (this.is("}")) {
        this.next();
        return V.dict(d);
      }
      for (;;) {
        const key = this.ternary();
        this.expect(":");
        const value = this.ternary();
        d.set(key, value);
        if (this.is(",")) {
          this.next();
          if (this.is("}")) {
            this.next();
            return V.dict(d);
          }
          continue;
        }
        this.expect("}");
        return V.dict(d);
      }
    }
    throw new ParseError("Expected expression.");
  }
}

export class GdExpression extends GdScriptObject {
  private tokens: Token[] | null = null;
  private names: string[] = [];
  private errorText = "";
  private failed = false;

  private parseText(expression: string, names: string[]): number {
    this.names = names;
    this.failed = false;
    this.errorText = "";
    try {
      this.tokens = tokenize(expression);
      if (this.tokens.length === 1) throw new ParseError("Expected expression.");
      new Parser(this.tokens, new Map(), V.nil(), true).parse();
      return 0;
    } catch (e) {
      this.tokens = null;
      this.errorText = e instanceof Error ? e.message : String(e);
      return 31;
    }
  }

  private run(inputs: Variant[], base: Variant): Variant {
    this.failed = false;
    this.errorText = "";
    const tokens = this.tokens;
    if (tokens === null) return V.nil();
    if (inputs.length < this.names.length) {
      this.failed = true;
      this.errorText = "Expression input is invalid (not passed).";
      return V.nil();
    }
    const map = new Map<string, Variant>();
    this.names.forEach((n, i) => map.set(n, inputs[i] as Variant));
    try {
      const value = new Parser(tokens, map, base).parse();
      return value;
    } catch (e) {
      this.failed = true;
      this.errorText = e instanceof Error ? e.message : String(e);
      return V.nil();
    }
  }

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "parse") {
      const expr = args[0];
      if (expr === undefined || expr.t !== Tag.STRING) throw new UnsupportedError("expression-arg", "Expression.parse() 只量过 String");
      const names: string[] = [];
      const list = args[1];
      if (list !== undefined && list.t === Tag.ARRAY && list.v instanceof GArray) {
        for (const item of list.v.raw()) names.push(String(item.v));
      }
      return V.int(this.parseText(String(expr.v), names));
    }
    if (name === "execute") {
      const inputs: Variant[] = [];
      const arr = args[0];
      if (arr !== undefined && arr.t === Tag.ARRAY && arr.v instanceof GArray) inputs.push(...arr.v.raw());
      const base = args[1] === undefined ? V.nil() : (args[1] as Variant);
      return this.run(inputs, base);
    }
    if (name === "has_execute_failed") return V.bool(this.failed);
    if (name === "get_error_text") return V.str(this.errorText);
    return null;
  }
}

export function expressionMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdExpression).__gdDispatch(name, args);
}

registerEngineCtor("Expression", () => new GdExpression());
