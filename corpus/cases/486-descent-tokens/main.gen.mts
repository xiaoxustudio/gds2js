// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare TAB_WIDTH: rt.Variant;
  declare PUNCT: rt.Variant;
  declare KEYWORDS: rt.Variant;
  declare OPENERS: rt.Variant;
  declare CLOSERS: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      this.TAB_WIDTH = rt.V.nil();
      this.PUNCT = rt.V.nil();
      this.KEYWORDS = rt.V.nil();
      this.OPENERS = rt.V.nil();
      this.CLOSERS = rt.V.nil();
      rt.frameLine(3);
      this.TAB_WIDTH = rt.V.int(8);
      rt.frameLine(4);
      this.PUNCT = rt.V.array(rt.GArray.of([rt.V.str("**="), rt.V.str("<<="), rt.V.str(">>="), rt.V.str("**"), rt.V.str("<<"), rt.V.str(">>"), rt.V.str(":="), rt.V.str("->"), rt.V.str("+="), rt.V.str("-="), rt.V.str("*="), rt.V.str("/="), rt.V.str("%="), rt.V.str("&="), rt.V.str("|="), rt.V.str("^="), rt.V.str("<="), rt.V.str(">="), rt.V.str("=="), rt.V.str("!="), rt.V.str("&&"), rt.V.str("||"), rt.V.str(".."), rt.V.str("("), rt.V.str(")"), rt.V.str("["), rt.V.str("]"), rt.V.str("{"), rt.V.str("}"), rt.V.str(","), rt.V.str(":"), rt.V.str(";"), rt.V.str("."), rt.V.str("="), rt.V.str("+"), rt.V.str("-"), rt.V.str("*"), rt.V.str("/"), rt.V.str("%"), rt.V.str("&"), rt.V.str("|"), rt.V.str("^"), rt.V.str("~"), rt.V.str("!"), rt.V.str("<"), rt.V.str(">"), rt.V.str("@"), rt.V.str("$")]));
      rt.frameLine(5);
      this.KEYWORDS = rt.V.array(rt.GArray.of([rt.V.str("and"), rt.V.str("as"), rt.V.str("await"), rt.V.str("break"), rt.V.str("breakpoint"), rt.V.str("class"), rt.V.str("class_name"), rt.V.str("const"), rt.V.str("continue"), rt.V.str("elif"), rt.V.str("else"), rt.V.str("enum"), rt.V.str("export"), rt.V.str("extends"), rt.V.str("false"), rt.V.str("for"), rt.V.str("func"), rt.V.str("get"), rt.V.str("if"), rt.V.str("in"), rt.V.str("is"), rt.V.str("master"), rt.V.str("mastersync"), rt.V.str("match"), rt.V.str("not"), rt.V.str("null"), rt.V.str("onready"), rt.V.str("or"), rt.V.str("pass"), rt.V.str("puppet"), rt.V.str("puppetsync"), rt.V.str("remote"), rt.V.str("remotesync"), rt.V.str("return"), rt.V.str("set"), rt.V.str("setget"), rt.V.str("signal"), rt.V.str("static"), rt.V.str("true"), rt.V.str("var"), rt.V.str("when"), rt.V.str("while")]));
      rt.frameLine(6);
      this.OPENERS = rt.V.array(rt.GArray.of([rt.V.str("("), rt.V.str("["), rt.V.str("{")]));
      rt.frameLine(7);
      this.CLOSERS = rt.V.array(rt.GArray.of([rt.V.str(")"), rt.V.str("]"), rt.V.str("}")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static TAB_WIDTH = rt.V.int(8);
  static PUNCT = rt.V.array(rt.GArray.of([rt.V.str("**="), rt.V.str("<<="), rt.V.str(">>="), rt.V.str("**"), rt.V.str("<<"), rt.V.str(">>"), rt.V.str(":="), rt.V.str("->"), rt.V.str("+="), rt.V.str("-="), rt.V.str("*="), rt.V.str("/="), rt.V.str("%="), rt.V.str("&="), rt.V.str("|="), rt.V.str("^="), rt.V.str("<="), rt.V.str(">="), rt.V.str("=="), rt.V.str("!="), rt.V.str("&&"), rt.V.str("||"), rt.V.str(".."), rt.V.str("("), rt.V.str(")"), rt.V.str("["), rt.V.str("]"), rt.V.str("{"), rt.V.str("}"), rt.V.str(","), rt.V.str(":"), rt.V.str(";"), rt.V.str("."), rt.V.str("="), rt.V.str("+"), rt.V.str("-"), rt.V.str("*"), rt.V.str("/"), rt.V.str("%"), rt.V.str("&"), rt.V.str("|"), rt.V.str("^"), rt.V.str("~"), rt.V.str("!"), rt.V.str("<"), rt.V.str(">"), rt.V.str("@"), rt.V.str("$")]));
  static KEYWORDS = rt.V.array(rt.GArray.of([rt.V.str("and"), rt.V.str("as"), rt.V.str("await"), rt.V.str("break"), rt.V.str("breakpoint"), rt.V.str("class"), rt.V.str("class_name"), rt.V.str("const"), rt.V.str("continue"), rt.V.str("elif"), rt.V.str("else"), rt.V.str("enum"), rt.V.str("export"), rt.V.str("extends"), rt.V.str("false"), rt.V.str("for"), rt.V.str("func"), rt.V.str("get"), rt.V.str("if"), rt.V.str("in"), rt.V.str("is"), rt.V.str("master"), rt.V.str("mastersync"), rt.V.str("match"), rt.V.str("not"), rt.V.str("null"), rt.V.str("onready"), rt.V.str("or"), rt.V.str("pass"), rt.V.str("puppet"), rt.V.str("puppetsync"), rt.V.str("remote"), rt.V.str("remotesync"), rt.V.str("return"), rt.V.str("set"), rt.V.str("setget"), rt.V.str("signal"), rt.V.str("static"), rt.V.str("true"), rt.V.str("var"), rt.V.str("when"), rt.V.str("while")]));
  static OPENERS = rt.V.array(rt.GArray.of([rt.V.str("("), rt.V.str("["), rt.V.str("{")]));
  static CLOSERS = rt.V.array(rt.GArray.of([rt.V.str(")"), rt.V.str("]"), rt.V.str("}")]));

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(11);
      this.punct_face(rt.V.str("**= 2 ** 3 := -> .. <= >= != == && || += -= *= /= %= &= |= ^= ~ ! < > @ $ ; , : . ( ) [ ] { } + - * / % << >>"));
      rt.frameLine(12);
      this.punct_face(rt.V.str("a:=b->c..d"));
      rt.frameLine(13);
      this.keyword_face(rt.V.array(rt.GArray.of([rt.V.str("var"), rt.V.str("if"), rt.V.str("when"), rt.V.str("await"), rt.V.str("breakpoint"), rt.V.str("namespace"), rt.V.str("void"), rt.V.str("self"), rt.V.str("super"), rt.V.str("trait"), rt.V.str("func"), rt.V.str("true"), rt.V.str("assert"), rt.V.str("preload"), rt.V.str("master"), rt.V.str("sync"), rt.V.str("remote"), rt.V.str("setget")])));
      rt.frameLine(14);
      this.ident_face(rt.V.str(""));
      rt.frameLine(15);
      this.ident_face(rt.V.str("_"));
      rt.frameLine(16);
      this.ident_face(rt.V.str("0"));
      rt.frameLine(17);
      this.ident_face(rt.V.str("z"));
      rt.frameLine(18);
      this.ident_face(rt.V.str("Z"));
      rt.frameLine(19);
      this.ident_face(rt.V.str("é"));
      rt.frameLine(20);
      this.ident_face(rt.V.str("ß"));
      rt.frameLine(21);
      this.ident_face(rt.V.str("γ"));
      rt.frameLine(22);
      this.ident_face(rt.V.str("中"));
      rt.frameLine(23);
      this.ident_face(rt.V.str("、"));
      rt.frameLine(24);
      this.ident_face(rt.V.str("（"));
      rt.frameLine(25);
      this.ident_face(rt.V.str("😀"));
      rt.frameLine(26);
      this.ident_face(rt.V.str("​"));
      rt.frameLine(27);
      this.bracket_face(rt.V.str("()[]{}<>=!+-*/%"));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("w|"), Main.TAB_WIDTH, rt.V.str("|"), rt.method(Main.PUNCT, "size", []), rt.V.str("|"), rt.method(Main.KEYWORDS, "size", []), rt.V.str("|"), rt.method(Main.OPENERS, "size", []), rt.V.str("|"), rt.method(Main.CLOSERS, "size", [])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("x|"), this.punct_at(rt.V.str("2 **= 3"), rt.V.int(2)), rt.V.str("|"), this.punct_at(rt.V.str("2 ** 3"), rt.V.int(2)), rt.V.str("|"), this.punct_at(rt.V.str("a.b"), rt.V.int(1)), rt.V.str("|"), this.punct_at(rt.V.str("a"), rt.V.int(1))]));
      rt.frameLine(30);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  has_name(table: rt.Variant, name: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "has_name");
    try {
      rt.frameLine(34);
      for (let k of rt.iter(table)) {
        rt.frameLine(35);
        if (rt.ops.truthy(rt.ops.eq(k, name))) {
          rt.frameLine(36);
          return rt.V.bool(true);
        }
      }
      rt.frameLine(37);
      return rt.V.bool(false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  punct_face(src: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "punct_face");
    try {
      rt.frameLine(41);
      let i = rt.V.int(0);
      rt.frameLine(42);
      let n = rt.method(src, "length", []);
      rt.frameLine(43);
      while (rt.ops.truthy(rt.ops.lt(i, n))) {
        rt.frameLine(44);
        let hit = this.punct_at(src, i);
        rt.frameLine(45);
        if (rt.ops.truthy(rt.ops.eq(hit, rt.V.str("")))) {
          rt.frameLine(46);
          i = rt.ops.add(i, rt.V.int(1));
          rt.frameLine(47);
          continue;
        }
        rt.frameLine(48);
        print(rt.showArgs([rt.V.str("p|"), i, rt.V.str("|"), hit, rt.V.str("|"), rt.method(hit, "length", [])]));
        rt.frameLine(49);
        i = rt.ops.add(i, rt.method(hit, "length", []));
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  punct_at(src: rt.Variant, at: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "punct_at");
    try {
      rt.frameLine(53);
      for (let p of rt.iter(Main.PUNCT)) {
        rt.frameLine(54);
        if (rt.ops.truthy(rt.ops.eq(rt.method(src, "substr", [at, rt.method(p, "length", [])]), p))) {
          rt.frameLine(55);
          return p;
        }
      }
      rt.frameLine(56);
      return rt.V.str("");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  keyword_face(list: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "keyword_face");
    try {
      rt.frameLine(60);
      for (let w of rt.iter(list)) {
        rt.frameLine(61);
        print(rt.showArgs([rt.V.str("k|"), w, rt.V.str("|"), this.has_name(Main.KEYWORDS, w)]));
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
      rt.frameLine(65);
      return rt.and(rt.ops.gte(c, rt.V.str("0")), () => rt.ops.lte(c, rt.V.str("9")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  in_xid(u: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "in_xid");
    try {
      rt.frameLine(69);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(192)), () => rt.ops.lte(u, rt.V.int(214))))) {
        rt.frameLine(70);
        return rt.V.bool(true);
      }
      rt.frameLine(71);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(216)), () => rt.ops.lte(u, rt.V.int(255))))) {
        rt.frameLine(72);
        return rt.V.bool(true);
      }
      rt.frameLine(73);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(256)), () => rt.ops.lte(u, rt.V.int(767))))) {
        rt.frameLine(74);
        return rt.V.bool(true);
      }
      rt.frameLine(75);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(880)), () => rt.ops.lte(u, rt.V.int(1023))))) {
        rt.frameLine(76);
        return rt.V.bool(true);
      }
      rt.frameLine(77);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(1024)), () => rt.ops.lte(u, rt.V.int(1327))))) {
        rt.frameLine(78);
        return rt.V.bool(true);
      }
      rt.frameLine(79);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(1488)), () => rt.ops.lte(u, rt.V.int(1514))))) {
        rt.frameLine(80);
        return rt.V.bool(true);
      }
      rt.frameLine(81);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(1568)), () => rt.ops.lte(u, rt.V.int(1610))))) {
        rt.frameLine(82);
        return rt.V.bool(true);
      }
      rt.frameLine(83);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(1649)), () => rt.ops.lte(u, rt.V.int(1747))))) {
        rt.frameLine(84);
        return rt.V.bool(true);
      }
      rt.frameLine(85);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(2304)), () => rt.ops.lte(u, rt.V.int(2361))))) {
        rt.frameLine(86);
        return rt.V.bool(true);
      }
      rt.frameLine(87);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(12352)), () => rt.ops.lte(u, rt.V.int(12543))))) {
        rt.frameLine(88);
        return rt.V.bool(true);
      }
      rt.frameLine(89);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(12593)), () => rt.ops.lte(u, rt.V.int(12686))))) {
        rt.frameLine(90);
        return rt.V.bool(true);
      }
      rt.frameLine(91);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(12704)), () => rt.ops.lte(u, rt.V.int(12735))))) {
        rt.frameLine(92);
        return rt.V.bool(true);
      }
      rt.frameLine(93);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(13312)), () => rt.ops.lte(u, rt.V.int(19903))))) {
        rt.frameLine(94);
        return rt.V.bool(true);
      }
      rt.frameLine(95);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(19968)), () => rt.ops.lte(u, rt.V.int(40959))))) {
        rt.frameLine(96);
        return rt.V.bool(true);
      }
      rt.frameLine(97);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(40960)), () => rt.ops.lte(u, rt.V.int(42191))))) {
        rt.frameLine(98);
        return rt.V.bool(true);
      }
      rt.frameLine(99);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(44032)), () => rt.ops.lte(u, rt.V.int(55203))))) {
        rt.frameLine(100);
        return rt.V.bool(true);
      }
      rt.frameLine(101);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(63744)), () => rt.ops.lte(u, rt.V.int(64255))))) {
        rt.frameLine(102);
        return rt.V.bool(true);
      }
      rt.frameLine(103);
      if (rt.ops.truthy(rt.and(rt.ops.gte(u, rt.V.int(119808)), () => rt.ops.lte(u, rt.V.int(120831))))) {
        rt.frameLine(104);
        return rt.V.bool(true);
      }
      rt.frameLine(105);
      return rt.V.bool(false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  head_u(c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "head_u");
    try {
      rt.frameLine(109);
      if (rt.ops.truthy(rt.ops.eq(rt.method(c, "length", []), rt.V.int(0)))) {
        rt.frameLine(110);
        return rt.V.int((-1));
      }
      rt.frameLine(111);
      return rt.method(c, "unicode_at", [rt.V.int(0)]);
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
      rt.frameLine(115);
      if (rt.ops.truthy(rt.ops.eq(rt.method(c, "length", []), rt.V.int(0)))) {
        rt.frameLine(116);
        return rt.V.bool(false);
      }
      rt.frameLine(117);
      if (rt.ops.truthy(rt.ops.eq(c, rt.V.str("_")))) {
        rt.frameLine(118);
        return rt.V.bool(true);
      }
      rt.frameLine(119);
      if (rt.ops.truthy(rt.and(rt.ops.gte(c, rt.V.str("a")), () => rt.ops.lte(c, rt.V.str("z"))))) {
        rt.frameLine(120);
        return rt.V.bool(true);
      }
      rt.frameLine(121);
      if (rt.ops.truthy(rt.and(rt.ops.gte(c, rt.V.str("A")), () => rt.ops.lte(c, rt.V.str("Z"))))) {
        rt.frameLine(122);
        return rt.V.bool(true);
      }
      rt.frameLine(123);
      return this.in_xid(this.head_u(c));
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
      rt.frameLine(127);
      if (rt.ops.truthy(this.is_digit(c))) {
        rt.frameLine(128);
        return rt.V.bool(true);
      }
      rt.frameLine(129);
      return this.is_ident_start(c);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  ident_face(c: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "ident_face");
    try {
      rt.frameLine(133);
      print(rt.showArgs([rt.V.str("i|"), c, rt.V.str("|"), this.is_ident_start(c), rt.V.str("|"), this.is_ident_part(c), rt.V.str("|"), rt.method(c, "length", []), rt.V.str("|"), this.head_u(c)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  bracket_face(src: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "bracket_face");
    try {
      rt.frameLine(137);
      let i = 0;
      rt.frameLine(138);
      while (rt.ops.truthy(rt.ops.lt(rt.V.int(i), rt.method(src, "length", [])))) {
        rt.frameLine(139);
        let c = rt.wrapValue(rt.index(src, rt.V.int(i)));
        rt.frameLine(140);
        print(rt.showArgs([rt.V.str("b|"), c, rt.V.str("|"), this.has_name(Main.OPENERS, c), rt.V.str("|"), this.has_name(Main.CLOSERS, c)]));
        rt.frameLine(141);
        i = rt.fast.iAddC(i, 1);
      }
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "has_name": return rt.wrapValue(this.has_name(args[0] as rt.Variant, args[1] as rt.Variant));
      case "punct_face": return rt.wrapValue(this.punct_face(args[0] as rt.Variant));
      case "punct_at": return rt.wrapValue(this.punct_at(args[0] as rt.Variant, args[1] as rt.Variant));
      case "keyword_face": return rt.wrapValue(this.keyword_face(args[0] as rt.Variant));
      case "is_digit": return rt.wrapValue(this.is_digit(args[0] as rt.Variant));
      case "in_xid": return rt.wrapValue(this.in_xid(args[0] as rt.Variant));
      case "head_u": return rt.wrapValue(this.head_u(args[0] as rt.Variant));
      case "is_ident_start": return rt.wrapValue(this.is_ident_start(args[0] as rt.Variant));
      case "is_ident_part": return rt.wrapValue(this.is_ident_part(args[0] as rt.Variant));
      case "ident_face": return rt.wrapValue(this.ident_face(args[0] as rt.Variant));
      case "bracket_face": return rt.wrapValue(this.bracket_face(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["TAB_WIDTH","PUNCT","KEYWORDS","OPENERS","CLOSERS"], (o) => { const s = o as Main; return [s.TAB_WIDTH, s.PUNCT, s.KEYWORDS, s.OPENERS, s.CLOSERS]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "has_name": [2, 2], "punct_face": [1, 1], "punct_at": [2, 2], "keyword_face": [1, 1], "is_digit": [1, 1], "in_xid": [1, 1], "head_u": [1, 1], "is_ident_start": [1, 1], "is_ident_part": [1, 1], "ident_face": [1, 1], "bracket_face": [1, 1] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
