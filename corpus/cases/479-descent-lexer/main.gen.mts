// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare TAB_WIDTH: rt.Variant;
  declare PUNCT: rt.Variant;
  declare starts: rt.Variant;
  declare toks: rt.Variant;
  declare issues: rt.Variant;
  declare fresh: rt.Variant;
  declare indent: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      this.TAB_WIDTH = rt.V.nil();
      this.PUNCT = rt.V.nil();
      this.starts = rt.V.nil();
      this.toks = rt.V.nil();
      this.issues = rt.V.nil();
      this.fresh = rt.V.nil();
      this.indent = rt.V.nil();
      rt.frameLine(3);
      this.TAB_WIDTH = rt.V.int(8);
      rt.frameLine(4);
      this.PUNCT = rt.V.array(rt.GArray.of([rt.V.str("**="), rt.V.str("<<="), rt.V.str(">>="), rt.V.str("**"), rt.V.str("<<"), rt.V.str(">>"), rt.V.str(":="), rt.V.str("->"), rt.V.str("+="), rt.V.str("-="), rt.V.str("*="), rt.V.str("/="), rt.V.str("%="), rt.V.str("&="), rt.V.str("|="), rt.V.str("^="), rt.V.str("<="), rt.V.str(">="), rt.V.str("=="), rt.V.str("!="), rt.V.str("&&"), rt.V.str("||"), rt.V.str(".."), rt.V.str("("), rt.V.str(")"), rt.V.str("["), rt.V.str("]"), rt.V.str("{"), rt.V.str("}"), rt.V.str(","), rt.V.str(":"), rt.V.str(";"), rt.V.str("."), rt.V.str("="), rt.V.str("+"), rt.V.str("-"), rt.V.str("*"), rt.V.str("/"), rt.V.str("%"), rt.V.str("&"), rt.V.str("|"), rt.V.str("^"), rt.V.str("~"), rt.V.str("!"), rt.V.str("<"), rt.V.str(">"), rt.V.str("@"), rt.V.str("$")]));
      rt.frameLine(6);
      this.starts = rt.V.array(rt.GArray.of([]));
      rt.frameLine(7);
      this.toks = rt.V.array(rt.GArray.of([]));
      rt.frameLine(8);
      this.issues = rt.V.array(rt.GArray.of([]));
      rt.frameLine(9);
      this.fresh = rt.V.bool(true);
      rt.frameLine(10);
      this.indent = rt.V.int(0);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static TAB_WIDTH = rt.V.int(8);
  static PUNCT = rt.V.array(rt.GArray.of([rt.V.str("**="), rt.V.str("<<="), rt.V.str(">>="), rt.V.str("**"), rt.V.str("<<"), rt.V.str(">>"), rt.V.str(":="), rt.V.str("->"), rt.V.str("+="), rt.V.str("-="), rt.V.str("*="), rt.V.str("/="), rt.V.str("%="), rt.V.str("&="), rt.V.str("|="), rt.V.str("^="), rt.V.str("<="), rt.V.str(">="), rt.V.str("=="), rt.V.str("!="), rt.V.str("&&"), rt.V.str("||"), rt.V.str(".."), rt.V.str("("), rt.V.str(")"), rt.V.str("["), rt.V.str("]"), rt.V.str("{"), rt.V.str("}"), rt.V.str(","), rt.V.str(":"), rt.V.str(";"), rt.V.str("."), rt.V.str("="), rt.V.str("+"), rt.V.str("-"), rt.V.str("*"), rt.V.str("/"), rt.V.str("%"), rt.V.str("&"), rt.V.str("|"), rt.V.str("^"), rt.V.str("~"), rt.V.str("!"), rt.V.str("<"), rt.V.str(">"), rt.V.str("@"), rt.V.str("$")]));

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(14);
      this.show(rt.V.str("s01"), rt.V.str("var x = 42\nfunc f(a):\n\treturn \"hi\"\t# tail\n"));
      rt.frameLine(15);
      this.show(rt.V.str("s02"), rt.V.str("a1 = 3.5\n\tif b>=c:\n\t\tprint(2)\n"));
      rt.frameLine(16);
      this.show(rt.V.str("s03"), rt.V.str("#region 标题\nx = 1\n#endregion\n"));
      rt.frameLine(17);
      this.show(rt.V.str("s04"), rt.V.str("0x1F 0b1010 0o17 1_000 3.5e-3 .5 1. 1..2 2 **= 3 super._init()\n"));
      rt.frameLine(18);
      this.show(rt.V.str("s05"), rt.V.str("r\"C:\\tmp\" &\"NodeName\" ^\"A/B\" @\"C\"\n"));
      rt.frameLine(19);
      this.show(rt.V.str("s06"), rt.V.str("\"a\\u00e9b\" \"c\\U0001F600d\" \"e\\\\f\" \"g\\x41h\" \"i\\o101j\"\n"));
      rt.frameLine(20);
      this.show(rt.V.str("s07"), rt.V.str("\"\"\"triple\nline\"\"\" '''single-triple'''\n"));
      rt.frameLine(21);
      this.show(rt.V.str("s08"), rt.V.str("nope = \"unclosed\n"));
      rt.frameLine(22);
      this.show(rt.V.str("s09"), rt.V.str("bad = \"a\\qb\"\n"));
      rt.frameLine(23);
      this.show(rt.V.str("s10"), rt.V.str("cont = 1 + \\\n\t2\n"));
      rt.frameLine(24);
      this.show(rt.V.str("s11"), rt.V.str("zwm = ﻿1 + ​2\n"));
      rt.frameLine(26);
      this.show(rt.V.str("s12"), rt.V.str("abé = 1\n中文 = 2\n"));
      rt.frameLine(29);
      this.show(rt.V.str("s13"), rt.V.str("Ƕ00 = 1\n"));
      rt.frameLine(30);
      this.show(rt.V.str("s14"), rt.V.str("\t\tx = 1\n        y = 2\n"));
      rt.frameLine(31);
      this.show(rt.V.str("s15"), rt.V.str("&\"\"\"named-triple\"\"\"\n"));
      rt.frameLine(32);
      this.show(rt.V.str("s16"), rt.V.str("a << b >> c <= d >= e != f == g\n"));
      rt.frameLine(33);
      this.show(rt.V.str("s17"), rt.V.str("\\\n\n"));
      rt.frameLine(34);
      this.show(rt.V.str("s18"), rt.V.str("s = \"\n\"\n"));
      rt.frameLine(35);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  show(tag: rt.Variant, src: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "show");
    try {
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("case|"), tag, rt.V.str("|"), rt.method(src, "length", [])]));
      rt.frameLine(40);
      this.lex(src);
      rt.frameLine(41);
      for (let t of rt.iter(this.toks)) {
        rt.frameLine(42);
        print(rt.showArgs([rt.V.str("tk|"), rt.wrapValue(rt.index(t, rt.V.str("kind"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("start"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("end"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("row"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("col"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("lineStart"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("indent"))), rt.V.str("|"), rt.wrapValue(rt.index(t, rt.V.str("text")))]));
      }
      rt.frameLine(43);
      for (let e of rt.iter(this.issues)) {
        rt.frameLine(44);
        print(rt.showArgs([rt.V.str("is|"), rt.wrapValue(rt.index(e, rt.V.str("at"))), rt.V.str("|"), rt.wrapValue(rt.index(e, rt.V.str("row"))), rt.V.str("|"), rt.wrapValue(rt.index(e, rt.V.str("col"))), rt.V.str("|"), rt.wrapValue(rt.index(e, rt.V.str("message")))]));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  is_digit(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_digit");
    try {
      rt.frameLine(48);
      return rt.and(rt.ops.gte(c, rt.V.str("0")), () => rt.ops.lte(c, rt.V.str("9")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_hex(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_hex");
    try {
      rt.frameLine(52);
      return rt.or(rt.or(this.is_digit(c), () => rt.and(rt.ops.gte(c, rt.V.str("a")), () => rt.ops.lte(c, rt.V.str("f")))), () => rt.and(rt.ops.gte(c, rt.V.str("A")), () => rt.ops.lte(c, rt.V.str("F"))));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_oct(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_oct");
    try {
      rt.frameLine(56);
      return rt.and(rt.ops.gte(c, rt.V.str("0")), () => rt.ops.lte(c, rt.V.str("7")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_bin(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_bin");
    try {
      rt.frameLine(60);
      return rt.or(rt.ops.eq(c, rt.V.str("0")), () => rt.ops.eq(c, rt.V.str("1")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_radix(kind: rt.Variant, c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_radix");
    try {
      rt.frameLine(64);
      if (rt.ops.truthy(rt.ops.eq(kind, rt.V.str("hex")))) {
        rt.frameLine(65);
        return this.is_hex(c);
      }
      rt.frameLine(66);
      if (rt.ops.truthy(rt.ops.eq(kind, rt.V.str("oct")))) {
        rt.frameLine(67);
        return this.is_oct(c);
      }
      rt.frameLine(68);
      return this.is_bin(c);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  in_xid(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "in_xid");
    try {
      rt.frameLine(72);
      if (rt.ops.truthy(rt.ops.eq(rt.method(c, "length", []), rt.V.int(0)))) {
        rt.frameLine(73);
        return rt.V.bool(false);
      }
      rt.frameLine(74);
      let u = rt.method(c, "unicode_at", [rt.V.int(0)]);
      rt.frameLine(75);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(192)), () => rt.ops.lte(u, rt.V.int(214))))) {
        rt.frameLine(76);
        return rt.V.bool(true);
      }
      rt.frameLine(77);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(216)), () => rt.ops.lte(u, rt.V.int(246))))) {
        rt.frameLine(78);
        return rt.V.bool(true);
      }
      rt.frameLine(79);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(248)), () => rt.ops.lte(u, rt.V.int(255))))) {
        rt.frameLine(80);
        return rt.V.bool(true);
      }
      rt.frameLine(81);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(880)), () => rt.ops.lte(u, rt.V.int(1023))))) {
        rt.frameLine(82);
        return rt.V.bool(true);
      }
      rt.frameLine(83);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(1024)), () => rt.ops.lte(u, rt.V.int(1279))))) {
        rt.frameLine(84);
        return rt.V.bool(true);
      }
      rt.frameLine(85);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(12352)), () => rt.ops.lte(u, rt.V.int(12543))))) {
        rt.frameLine(86);
        return rt.V.bool(true);
      }
      rt.frameLine(87);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(19968)), () => rt.ops.lte(u, rt.V.int(40959))))) {
        rt.frameLine(88);
        return rt.V.bool(true);
      }
      rt.frameLine(89);
      return rt.V.bool(false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_ident_start(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_ident_start");
    try {
      rt.frameLine(93);
      return rt.or(rt.or(rt.or(rt.ops.eq(c, rt.V.str("_")), () => rt.and(rt.ops.gte(c, rt.V.str("a")), () => rt.ops.lte(c, rt.V.str("z")))), () => rt.and(rt.ops.gte(c, rt.V.str("A")), () => rt.ops.lte(c, rt.V.str("Z")))), () => this.in_xid(c));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_ident_part(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_ident_part");
    try {
      rt.frameLine(97);
      return rt.or(rt.or(rt.or(rt.or(rt.ops.eq(c, rt.V.str("_")), () => this.is_digit(c)), () => rt.and(rt.ops.gte(c, rt.V.str("a")), () => rt.ops.lte(c, rt.V.str("z")))), () => rt.and(rt.ops.gte(c, rt.V.str("A")), () => rt.ops.lte(c, rt.V.str("Z")))), () => this.in_xid(c));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  is_zero_width(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "is_zero_width");
    try {
      rt.frameLine(101);
      return rt.or(rt.or(rt.ops.eq(c, rt.V.str("﻿")), () => rt.ops.eq(c, rt.V.str("⁠"))), () => rt.ops.eq(c, rt.V.str("​")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  ch(src: rt.Variant, i: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "ch");
    try {
      rt.frameLine(105);
      if (rt.ops.truthy(rt.or(rt.ops.lt(i, rt.V.int(0)), () => rt.ops.gte(i, rt.method(src, "length", []))))) {
        rt.frameLine(106);
        return rt.V.str("");
      }
      rt.frameLine(107);
      return rt.wrapValue(rt.index(src, i));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  line_table(src: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "line_table");
    try {
      rt.frameLine(111);
      let out = rt.V.array(rt.GArray.of([rt.V.int(0)]));
      rt.frameLine(112);
      let n = rt.method(src, "length", []);
      rt.frameLine(113);
      for (let i of rt.iter(n)) {
        rt.frameLine(114);
        if (rt.ops.truthy(rt.ops.eq(rt.wrapValue(rt.index(src, i)), rt.V.str("\n")))) {
          rt.frameLine(115);
          rt.method(out, "append", [rt.ops.add(i, rt.V.int(1))]);
        }
      }
      rt.frameLine(116);
      return out;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  row_of(at_starts: rt.Variant, idx: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "row_of");
    try {
      rt.frameLine(120);
      let lo = rt.V.int(0);
      rt.frameLine(121);
      let hi = rt.ops.sub(rt.method(at_starts, "size", []), rt.V.int(1));
      rt.frameLine(122);
      while (rt.ops.truthy(rt.ops.lt(lo, hi))) {
        rt.frameLine(123);
        let mid = rt.ops.shr(rt.ops.add(rt.ops.add(lo, hi), rt.V.int(1)), rt.V.int(1));
        rt.frameLine(124);
        if (rt.ops.truthy(rt.ops.lte(rt.wrapValue(rt.index(at_starts, mid)), idx))) {
          rt.frameLine(125);
          lo = mid;
        } else {
          rt.frameLine(127);
          hi = rt.ops.sub(mid, rt.V.int(1));
        }
      }
      rt.frameLine(128);
      return lo;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  run_of(src: rt.Variant, at: rt.Variant, count: rt.Variant, kind: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "run_of");
    try {
      rt.frameLine(132);
      let i = at;
      rt.frameLine(133);
      let seen = 0;
      rt.frameLine(134);
      let n = rt.method(src, "length", []);
      rt.frameLine(135);
      while (rt.ops.truthy(rt.and(rt.and(rt.ops.lt(rt.V.int(seen), count), () => rt.ops.lt(i, n)), () => this.is_radix(kind, rt.wrapValue(rt.index(src, i)))))) {
        rt.frameLine(136);
        i = rt.ops.add(i, rt.V.int(1));
        rt.frameLine(137);
        seen = rt.fast.iAddC(seen, 1);
      }
      rt.frameLine(138);
      if (rt.ops.truthy(rt.ops.eq(rt.V.int(seen), count))) {
        rt.frameLine(139);
        return i;
      }
      rt.frameLine(140);
      return rt.V.int((-1));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  escape_end(src: rt.Variant, backslash: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "escape_end");
    try {
      rt.frameLine(144);
      if (rt.ops.truthy(rt.ops.gte(rt.ops.add(backslash, rt.V.int(1)), rt.method(src, "length", [])))) {
        rt.frameLine(145);
        return rt.V.int((-1));
      }
      rt.frameLine(146);
      let c = rt.wrapValue(rt.index(src, rt.ops.add(backslash, rt.V.int(1))));
      rt.frameLine(147);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("u")))) {
        rt.frameLine(148);
        return this.run_of(src, rt.ops.add(backslash, rt.V.int(2)), rt.V.int(4), rt.V.str("hex"));
      }
      rt.frameLine(149);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("U")))) {
        rt.frameLine(150);
        return this.run_of(src, rt.ops.add(backslash, rt.V.int(2)), rt.V.int(6), rt.V.str("hex"));
      }
      rt.frameLine(151);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("x")))) {
        rt.frameLine(152);
        return this.run_of(src, rt.ops.add(backslash, rt.V.int(2)), rt.V.int(2), rt.V.str("hex"));
      }
      rt.frameLine(153);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("o")))) {
        rt.frameLine(154);
        return this.run_of(src, rt.ops.add(backslash, rt.V.int(2)), rt.V.int(3), rt.V.str("oct"));
      }
      rt.frameLine(155);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("\r")))) {
        rt.frameLine(156);
        if (rt.ops.truthy(rt.ops.eq(rt.wrapValue(rt.index(src, rt.ops.add(backslash, rt.V.int(2)))), rt.V.str("\n")))) {
          rt.frameLine(157);
          return rt.ops.add(backslash, rt.V.int(3));
        }
        rt.frameLine(158);
        return rt.V.int((-1));
      }
      rt.frameLine(159);
      return rt.ops.add(backslash, rt.V.int(2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  digits(src: rt.Variant, i: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "digits");
    try {
      rt.frameLine(163);
      let n = rt.method(src, "length", []);
      rt.frameLine(164);
      let j = i;
      rt.frameLine(165);
      while (rt.ops.truthy(rt.V.bool(true))) {
        rt.frameLine(166);
        let k = j;
        rt.frameLine(167);
        while (rt.ops.truthy(rt.and(rt.ops.lt(k, n), () => this.is_digit(rt.wrapValue(rt.index(src, k)))))) {
          rt.frameLine(168);
          k = rt.ops.add(k, rt.V.int(1));
        }
        rt.frameLine(169);
        if (rt.ops.truthy(rt.ops.eq(k, j))) {
          rt.frameLine(170);
          return j;
        }
        rt.frameLine(171);
        if (rt.ops.truthy(rt.ops.eq(rt.wrapValue(rt.index(src, k)), rt.V.str("_")))) {
          rt.frameLine(172);
          k = rt.ops.add(k, rt.V.int(1));
        }
        rt.frameLine(173);
        j = k;
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  number_end(src: rt.Variant, at: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "number_end");
    try {
      rt.frameLine(177);
      let n = rt.method(src, "length", []);
      rt.frameLine(178);
      if (rt.ops.truthy(rt.ops.eq(this.ch(src, at), rt.V.str("0")))) {
        rt.frameLine(179);
        let p = this.ch(src, rt.ops.add(at, rt.V.int(1)));
        rt.frameLine(180);
        let radix = "";
        rt.frameLine(181);
        if (rt.ops.truthy(rt.or(rt.ops.eq(p, rt.V.str("x")), () => rt.ops.eq(p, rt.V.str("X"))))) {
          rt.frameLine(182);
          radix = "hex";
        } else if (rt.ops.truthy(rt.or(rt.ops.eq(p, rt.V.str("o")), () => rt.ops.eq(p, rt.V.str("O"))))) {
          rt.frameLine(184);
          radix = "oct";
        } else if (rt.ops.truthy(rt.or(rt.ops.eq(p, rt.V.str("b")), () => rt.ops.eq(p, rt.V.str("B"))))) {
          rt.frameLine(186);
          radix = "bin";
        }
        rt.frameLine(187);
        if (rt.ops.truthy(rt.ops.neq(rt.V.str(radix), rt.V.str("")))) {
          rt.frameLine(188);
          let j = rt.ops.add(at, rt.V.int(2));
          rt.frameLine(189);
          let reps = 0;
          rt.frameLine(190);
          while (rt.ops.truthy(rt.V.bool(true))) {
            rt.frameLine(191);
            let k = j;
            rt.frameLine(192);
            if (rt.ops.truthy(rt.ops.eq(this.ch(src, k), rt.V.str("_")))) {
              rt.frameLine(193);
              k = rt.ops.add(k, rt.V.int(1));
            }
            rt.frameLine(194);
            let d = k;
            rt.frameLine(195);
            while (rt.ops.truthy(rt.and(rt.ops.lt(d, n), () => this.is_radix(rt.V.str(radix), rt.wrapValue(rt.index(src, d)))))) {
              rt.frameLine(196);
              d = rt.ops.add(d, rt.V.int(1));
            }
            rt.frameLine(197);
            if (rt.ops.truthy(rt.ops.eq(d, k))) {
              rt.frameLine(198);
              break;
            }
            rt.frameLine(199);
            j = d;
            rt.frameLine(200);
            reps = rt.fast.iAddC(reps, 1);
          }
          rt.frameLine(201);
          if ((reps > (0 as number))) {
            rt.frameLine(202);
            return rt.dictOf([[rt.V.str("end"), j], [rt.V.str("kind"), rt.V.str("int")]]);
          }
        }
      }
      rt.frameLine(203);
      let i = this.digits(src, at);
      rt.frameLine(204);
      let is_float = rt.V.bool(false);
      rt.frameLine(205);
      if (rt.ops.truthy(rt.and(rt.ops.eq(this.ch(src, i), rt.V.str(".")), () => rt.ops.neq(this.ch(src, rt.ops.add(i, rt.V.int(1))), rt.V.str("."))))) {
        rt.frameLine(206);
        is_float = rt.V.bool(true);
        rt.frameLine(207);
        i = this.digits(src, rt.ops.add(i, rt.V.int(1)));
      }
      rt.frameLine(208);
      let e = this.ch(src, i);
      rt.frameLine(209);
      if (rt.ops.truthy(rt.or(rt.ops.eq(e, rt.V.str("e")), () => rt.ops.eq(e, rt.V.str("E"))))) {
        rt.frameLine(210);
        let j2 = rt.ops.add(i, rt.V.int(1));
        rt.frameLine(211);
        if (rt.ops.truthy(rt.or(rt.ops.eq(this.ch(src, j2), rt.V.str("+")), () => rt.ops.eq(this.ch(src, j2), rt.V.str("-"))))) {
          rt.frameLine(212);
          j2 = rt.ops.add(j2, rt.V.int(1));
        }
        rt.frameLine(213);
        let after = this.digits(src, j2);
        rt.frameLine(214);
        if (rt.ops.truthy(rt.ops.gt(after, j2))) {
          rt.frameLine(215);
          is_float = rt.V.bool(true);
          rt.frameLine(216);
          i = after;
        }
      }
      rt.frameLine(217);
      if (rt.ops.truthy(is_float)) {
        rt.frameLine(218);
        return rt.dictOf([[rt.V.str("end"), i], [rt.V.str("kind"), rt.V.str("float")]]);
      }
      rt.frameLine(219);
      return rt.dictOf([[rt.V.str("end"), i], [rt.V.str("kind"), rt.V.str("int")]]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  dot_number_end(src: rt.Variant, at: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "dot_number_end");
    try {
      rt.frameLine(223);
      let i = this.digits(src, rt.ops.add(at, rt.V.int(1)));
      rt.frameLine(224);
      if (rt.ops.truthy(rt.ops.eq(i, rt.ops.add(at, rt.V.int(1))))) {
        rt.frameLine(225);
        return rt.V.int((-1));
      }
      rt.frameLine(226);
      let e = this.ch(src, i);
      rt.frameLine(227);
      if (rt.ops.truthy(rt.or(rt.ops.eq(e, rt.V.str("e")), () => rt.ops.eq(e, rt.V.str("E"))))) {
        rt.frameLine(228);
        let j = rt.ops.add(i, rt.V.int(1));
        rt.frameLine(229);
        if (rt.ops.truthy(rt.or(rt.ops.eq(this.ch(src, j), rt.V.str("+")), () => rt.ops.eq(this.ch(src, j), rt.V.str("-"))))) {
          rt.frameLine(230);
          j = rt.ops.add(j, rt.V.int(1));
        }
        rt.frameLine(231);
        let after = this.digits(src, j);
        rt.frameLine(232);
        if (rt.ops.truthy(rt.ops.gt(after, j))) {
          rt.frameLine(233);
          i = after;
        }
      }
      rt.frameLine(234);
      return i;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  str_prefix(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "str_prefix");
    try {
      rt.frameLine(238);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("r")))) {
        rt.frameLine(239);
        return rt.V.str("raw");
      }
      rt.frameLine(240);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("&")))) {
        rt.frameLine(241);
        return rt.V.str("name");
      }
      rt.frameLine(242);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("^")))) {
        rt.frameLine(243);
        return rt.V.str("nodePath");
      }
      rt.frameLine(244);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("@")))) {
        rt.frameLine(245);
        return rt.V.str("nodePath");
      }
      rt.frameLine(246);
      return rt.V.str("");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  read_delim(src: rt.Variant, at: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "read_delim");
    try {
      rt.frameLine(250);
      let i = at;
      rt.frameLine(251);
      let flag = this.str_prefix(this.ch(src, i));
      rt.frameLine(252);
      if (rt.ops.truthy(rt.ops.neq(flag, rt.V.str("")))) {
        rt.frameLine(253);
        i = rt.ops.add(i, rt.V.int(1));
      }
      rt.frameLine(254);
      let q = this.ch(src, i);
      rt.frameLine(255);
      if (rt.ops.truthy(rt.and(rt.ops.neq(q, rt.V.str("\"")), () => rt.ops.neq(q, rt.V.str("'"))))) {
        rt.frameLine(256);
        return rt.dictOf([]);
      }
      rt.frameLine(257);
      let triple = rt.and(rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(1))), q), () => rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(2))), q));
      rt.frameLine(258);
      let body = 1;
      rt.frameLine(259);
      if (rt.ops.truthy(triple)) {
        rt.frameLine(260);
        body = 3;
      }
      rt.frameLine(261);
      return rt.dictOf([[rt.V.str("quote"), q], [rt.V.str("triple"), triple], [rt.V.str("raw"), rt.ops.eq(flag, rt.V.str("raw"))], [rt.V.str("head"), i], [rt.V.str("body"), rt.V.int(body)]]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  push_tok(kind: rt.Variant, src: rt.Variant, start: rt.Variant, end: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "push_tok");
    try {
      rt.frameLine(265);
      let r = this.row_of(this.starts, start);
      rt.frameLine(266);
      rt.method(this.toks, "append", [rt.dictOf([[rt.V.str("kind"), kind], [rt.V.str("text"), rt.method(src, "substr", [start, rt.ops.sub(end, start)])], [rt.V.str("start"), start], [rt.V.str("end"), end], [rt.V.str("row"), r], [rt.V.str("col"), rt.ops.sub(start, rt.wrapValue(rt.index(this.starts, r)))], [rt.V.str("lineStart"), this.fresh], [rt.V.str("indent"), this.indent]])]);
      rt.frameLine(276);
      this.fresh = rt.V.bool(false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  push_issue(at: rt.Variant, message: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "push_issue");
    try {
      rt.frameLine(280);
      let r = this.row_of(this.starts, at);
      rt.frameLine(281);
      rt.method(this.issues, "append", [rt.dictOf([[rt.V.str("at"), at], [rt.V.str("row"), r], [rt.V.str("col"), rt.ops.sub(at, rt.wrapValue(rt.index(this.starts, r)))], [rt.V.str("message"), message]])]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  lex(src: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "lex");
    try {
      rt.frameLine(285);
      this.starts = this.line_table(src);
      rt.frameLine(286);
      this.toks = rt.V.array(rt.GArray.of([]));
      rt.frameLine(287);
      this.issues = rt.V.array(rt.GArray.of([]));
      rt.frameLine(288);
      this.fresh = rt.V.bool(true);
      rt.frameLine(289);
      this.indent = rt.V.int(0);
      rt.frameLine(290);
      let n = rt.method(src, "length", []);
      rt.frameLine(291);
      let i = rt.V.int(0);
      rt.frameLine(292);
      while (rt.ops.truthy(rt.ops.lt(i, n))) {
        rt.frameLine(293);
        let c = rt.wrapValue(rt.index(src, i));
        rt.frameLine(294);
        if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("\n")))) {
          rt.frameLine(295);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(296);
          this.fresh = rt.V.bool(true);
          rt.frameLine(297);
          this.indent = rt.V.int(0);
          rt.frameLine(298);
          continue;
        }
        rt.frameLine(299);
        if (rt.ops.truthy(rt.and(rt.ops.eq(c, rt.V.str("\\")), () => rt.or(rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(1))), rt.V.str("\n")), () => rt.and(rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(1))), rt.V.str("\r")), () => rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(2))), rt.V.str("\n"))))))) {
          rt.frameLine(300);
          let fin = rt.ops.add(i, rt.V.int(2));
          rt.frameLine(301);
          if (rt.ops.truthy(rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(1))), rt.V.str("\r")))) {
            rt.frameLine(302);
            fin = rt.ops.add(i, rt.V.int(3));
          }
          rt.frameLine(303);
          this.push_tok(rt.V.str("cont"), src, i, fin);
          rt.frameLine(304);
          i = fin;
          rt.frameLine(305);
          this.indent = rt.V.int(0);
          rt.frameLine(306);
          continue;
        }
        rt.frameLine(307);
        if (rt.ops.truthy(rt.ops.eq(c, rt.V.str(" ")))) {
          rt.frameLine(308);
          if (rt.ops.truthy(this.fresh)) {
            rt.frameLine(309);
            this.indent = rt.ops.add(this.indent, rt.V.int(1));
          }
          rt.frameLine(310);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(311);
          continue;
        }
        rt.frameLine(312);
        if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("\t")))) {
          rt.frameLine(313);
          if (rt.ops.truthy(this.fresh)) {
            rt.frameLine(314);
            this.indent = rt.ops.add(this.indent, Main.TAB_WIDTH);
          }
          rt.frameLine(315);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(316);
          continue;
        }
        rt.frameLine(317);
        if (rt.ops.truthy(rt.or(rt.ops.eq(c, rt.V.str("\r")), () => rt.ops.eq(c, rt.V.str("\f"))))) {
          rt.frameLine(318);
          if (rt.ops.truthy(this.fresh)) {
            rt.frameLine(319);
            this.indent = rt.V.int(0);
          }
          rt.frameLine(320);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(321);
          continue;
        }
        rt.frameLine(322);
        if (rt.ops.truthy(this.is_zero_width(c))) {
          rt.frameLine(323);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(324);
          continue;
        }
        rt.frameLine(325);
        if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("#")))) {
          rt.frameLine(326);
          let j = i;
          rt.frameLine(327);
          while (rt.ops.truthy(rt.and(rt.ops.lt(j, n), () => rt.ops.neq(rt.wrapValue(rt.index(src, j)), rt.V.str("\n"))))) {
            rt.frameLine(328);
            j = rt.ops.add(j, rt.V.int(1));
          }
          rt.frameLine(329);
          let whole = rt.method(src, "substr", [i, rt.ops.sub(j, i)]);
          rt.frameLine(330);
          if (rt.ops.truthy(rt.method(whole, "begins_with", [rt.V.str("#endregion")]))) {
            rt.frameLine(331);
            this.push_tok(rt.V.str("region-end"), src, i, j);
          } else if (rt.ops.truthy(rt.method(whole, "begins_with", [rt.V.str("#region")]))) {
            rt.frameLine(333);
            this.push_tok(rt.V.str("region-start"), src, i, rt.ops.add(i, rt.V.int(7)));
            rt.frameLine(334);
            if (rt.ops.truthy(rt.ops.gt(j, rt.ops.add(i, rt.V.int(7))))) {
              rt.frameLine(335);
              this.push_tok(rt.V.str("region-label"), src, rt.ops.add(i, rt.V.int(7)), j);
            }
          } else {
            rt.frameLine(337);
            this.push_tok(rt.V.str("comment"), src, i, j);
          }
          rt.frameLine(338);
          i = j;
          rt.frameLine(339);
          continue;
        }
        rt.frameLine(340);
        let delim = this.read_delim(src, i);
        rt.frameLine(341);
        if (rt.ops.truthy(rt.ops.neq(delim, rt.dictOf([])))) {
          rt.frameLine(342);
          i = this.lex_string(src, delim, i);
          rt.frameLine(343);
          continue;
        }
        rt.frameLine(344);
        if (rt.ops.truthy(this.is_ident_start(c))) {
          rt.frameLine(345);
          let a = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(346);
          while (rt.ops.truthy(rt.and(rt.ops.lt(a, n), () => this.is_ident_part(rt.wrapValue(rt.index(src, a)))))) {
            rt.frameLine(347);
            a = rt.ops.add(a, rt.V.int(1));
          }
          rt.frameLine(348);
          this.push_tok(rt.V.str("ident"), src, i, a);
          rt.frameLine(349);
          i = a;
          rt.frameLine(350);
          continue;
        }
        rt.frameLine(351);
        if (rt.ops.truthy(this.is_digit(c))) {
          rt.frameLine(352);
          let num = this.number_end(src, i);
          rt.frameLine(353);
          this.push_tok(rt.wrapValue(rt.index(num, rt.V.str("kind"))), src, i, rt.wrapValue(rt.index(num, rt.V.str("end"))));
          rt.frameLine(354);
          i = rt.wrapValue(rt.index(num, rt.V.str("end")));
          rt.frameLine(355);
          continue;
        }
        rt.frameLine(356);
        if (rt.ops.truthy(rt.ops.eq(c, rt.V.str(".")))) {
          rt.frameLine(357);
          let dn = this.dot_number_end(src, i);
          rt.frameLine(358);
          if (rt.ops.truthy(rt.ops.gt(dn, rt.V.int(0)))) {
            rt.frameLine(359);
            this.push_tok(rt.V.str("float"), src, i, dn);
            rt.frameLine(360);
            i = dn;
            rt.frameLine(361);
            continue;
          }
        }
        rt.frameLine(362);
        let hit = rt.V.str("");
        rt.frameLine(363);
        for (let p of rt.iter(Main.PUNCT)) {
          rt.frameLine(364);
          if (rt.ops.truthy(rt.ops.eq(rt.method(src, "substr", [i, rt.method(p, "length", [])]), p))) {
            rt.frameLine(365);
            hit = p;
            rt.frameLine(366);
            break;
          }
        }
        rt.frameLine(367);
        if (rt.ops.truthy(rt.ops.neq(hit, rt.V.str("")))) {
          rt.frameLine(368);
          this.push_tok(rt.V.str("punct"), src, i, rt.ops.add(i, rt.method(hit, "length", [])));
          rt.frameLine(369);
          i = rt.ops.add(i, rt.method(hit, "length", []));
          rt.frameLine(370);
          continue;
        }
        rt.frameLine(371);
        this.push_issue(i, rt.ops.add(rt.ops.add(rt.V.str("无法识别的字符 ["), c), rt.V.str("]")));
        rt.frameLine(372);
        i = rt.ops.add(i, rt.V.int(1));
        rt.frameLine(373);
        this.fresh = rt.V.bool(false);
      }
      rt.frameLine(374);
      let eof_row = this.row_of(this.starts, n);
      rt.frameLine(375);
      this.push_tok(rt.V.str("eof"), src, n, n);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  lex_string(src: rt.Variant, delim: rt.Variant, from: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "lex_string");
    try {
      rt.frameLine(379);
      let quote = rt.wrapValue(rt.index(delim, rt.V.str("quote")));
      rt.frameLine(380);
      let triple = rt.wrapValue(rt.index(delim, rt.V.str("triple")));
      rt.frameLine(381);
      let raw = rt.wrapValue(rt.index(delim, rt.V.str("raw")));
      rt.frameLine(382);
      let head = rt.wrapValue(rt.index(delim, rt.V.str("head")));
      rt.frameLine(383);
      let body = rt.wrapValue(rt.index(delim, rt.V.str("body")));
      rt.frameLine(384);
      this.push_tok(rt.V.str("str-start"), src, from, rt.ops.add(head, body));
      rt.frameLine(385);
      let i = rt.ops.add(head, body);
      rt.frameLine(386);
      let n = rt.method(src, "length", []);
      rt.frameLine(387);
      let closed = rt.V.bool(false);
      rt.frameLine(388);
      while (rt.ops.truthy(rt.ops.lt(i, n))) {
        rt.frameLine(389);
        let c = rt.wrapValue(rt.index(src, i));
        rt.frameLine(390);
        if (rt.ops.truthy(rt.and(rt.ops.eq(c, rt.V.str("\\")), () => rt.V.bool(!rt.ops.truthy(raw))))) {
          rt.frameLine(391);
          let end = this.escape_end(src, i);
          rt.frameLine(392);
          if (rt.ops.truthy(rt.ops.lt(end, rt.V.int(0)))) {
            rt.frameLine(393);
            this.push_issue(i, rt.ops.add(rt.ops.add(rt.V.str("字符串里的转义 \\"), this.ch(src, rt.ops.add(i, rt.V.int(1)))), rt.V.str(" 不合法")));
            rt.frameLine(394);
            i = rt.ops.add(i, rt.V.int(1));
            rt.frameLine(395);
            continue;
          }
          rt.frameLine(396);
          this.push_tok(rt.V.str("escape"), src, i, end);
          rt.frameLine(397);
          i = end;
          rt.frameLine(398);
          continue;
        }
        rt.frameLine(399);
        if (rt.ops.truthy(rt.and(rt.ops.eq(c, rt.V.str("\\")), () => raw))) {
          rt.frameLine(400);
          let nx = this.ch(src, rt.ops.add(i, rt.V.int(1)));
          rt.frameLine(401);
          if (rt.ops.truthy(rt.or(rt.ops.eq(nx, quote), () => rt.ops.eq(nx, rt.V.str("\\"))))) {
            rt.frameLine(402);
            i = rt.ops.add(i, rt.V.int(2));
          } else {
            rt.frameLine(404);
            i = rt.ops.add(i, rt.V.int(1));
          }
          rt.frameLine(405);
          continue;
        }
        rt.frameLine(406);
        if (rt.ops.truthy(rt.ops.eq(c, quote))) {
          rt.frameLine(407);
          if (rt.ops.truthy(rt.V.bool(!rt.ops.truthy(triple)))) {
            rt.frameLine(408);
            this.push_tok(rt.V.str("str-end"), src, i, rt.ops.add(i, rt.V.int(1)));
            rt.frameLine(409);
            i = rt.ops.add(i, rt.V.int(1));
            rt.frameLine(410);
            closed = rt.V.bool(true);
            rt.frameLine(411);
            break;
          }
          rt.frameLine(412);
          if (rt.ops.truthy(rt.and(rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(1))), quote), () => rt.ops.eq(this.ch(src, rt.ops.add(i, rt.V.int(2))), quote)))) {
            rt.frameLine(413);
            this.push_tok(rt.V.str("str-end"), src, i, rt.ops.add(i, rt.V.int(3)));
            rt.frameLine(414);
            i = rt.ops.add(i, rt.V.int(3));
            rt.frameLine(415);
            closed = rt.V.bool(true);
            rt.frameLine(416);
            break;
          }
          rt.frameLine(417);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(418);
          continue;
        }
        rt.frameLine(419);
        i = rt.ops.add(i, rt.V.int(1));
      }
      rt.frameLine(420);
      if (rt.ops.truthy(rt.V.bool(!rt.ops.truthy(closed)))) {
        rt.frameLine(421);
        this.push_issue(from, rt.V.str("字符串没有闭合"));
      }
      rt.frameLine(422);
      return i;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "show": return rt.wrapValue(this.show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "is_digit": return rt.wrapValue(this.is_digit(args[0] as rt.Variant));
      case "is_hex": return rt.wrapValue(this.is_hex(args[0] as rt.Variant));
      case "is_oct": return rt.wrapValue(this.is_oct(args[0] as rt.Variant));
      case "is_bin": return rt.wrapValue(this.is_bin(args[0] as rt.Variant));
      case "is_radix": return rt.wrapValue(this.is_radix(args[0] as rt.Variant, args[1] as rt.Variant));
      case "in_xid": return rt.wrapValue(this.in_xid(args[0] as rt.Variant));
      case "is_ident_start": return rt.wrapValue(this.is_ident_start(args[0] as rt.Variant));
      case "is_ident_part": return rt.wrapValue(this.is_ident_part(args[0] as rt.Variant));
      case "is_zero_width": return rt.wrapValue(this.is_zero_width(args[0] as rt.Variant));
      case "ch": return rt.wrapValue(this.ch(args[0] as rt.Variant, args[1] as rt.Variant));
      case "line_table": return rt.wrapValue(this.line_table(args[0] as rt.Variant));
      case "row_of": return rt.wrapValue(this.row_of(args[0] as rt.Variant, args[1] as rt.Variant));
      case "run_of": return rt.wrapValue(this.run_of(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant, args[3] as rt.Variant));
      case "escape_end": return rt.wrapValue(this.escape_end(args[0] as rt.Variant, args[1] as rt.Variant));
      case "digits": return rt.wrapValue(this.digits(args[0] as rt.Variant, args[1] as rt.Variant));
      case "number_end": return rt.wrapValue(this.number_end(args[0] as rt.Variant, args[1] as rt.Variant));
      case "dot_number_end": return rt.wrapValue(this.dot_number_end(args[0] as rt.Variant, args[1] as rt.Variant));
      case "str_prefix": return rt.wrapValue(this.str_prefix(args[0] as rt.Variant));
      case "read_delim": return rt.wrapValue(this.read_delim(args[0] as rt.Variant, args[1] as rt.Variant));
      case "push_tok": return rt.wrapValue(this.push_tok(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant, args[3] as rt.Variant));
      case "push_issue": return rt.wrapValue(this.push_issue(args[0] as rt.Variant, args[1] as rt.Variant));
      case "lex": return rt.wrapValue(this.lex(args[0] as rt.Variant));
      case "lex_string": return rt.wrapValue(this.lex_string(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["TAB_WIDTH","PUNCT","starts","toks","issues","fresh","indent"], (o) => { const s = o as Main; return [s.TAB_WIDTH, s.PUNCT, s.starts, s.toks, s.issues, s.fresh, s.indent]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["starts","toks","issues","fresh","indent"], {}, (o) => { const s = o as Main; return [s.starts, s.toks, s.issues, s.fresh, s.indent]; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "show": [2, 2], "is_digit": [1, 1], "is_hex": [1, 1], "is_oct": [1, 1], "is_bin": [1, 1], "is_radix": [2, 2], "in_xid": [1, 1], "is_ident_start": [1, 1], "is_ident_part": [1, 1], "is_zero_width": [1, 1], "ch": [2, 2], "line_table": [1, 1], "row_of": [2, 2], "run_of": [4, 4], "escape_end": [2, 2], "digits": [2, 2], "number_end": [2, 2], "dot_number_end": [2, 2], "str_prefix": [1, 1], "read_delim": [2, 2], "push_tok": [4, 4], "push_issue": [2, 2], "lex": [1, 1], "lex_string": [3, 3] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
