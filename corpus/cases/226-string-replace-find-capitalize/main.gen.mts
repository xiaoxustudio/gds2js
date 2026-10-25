// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare HAYS: rt.Variant;
  declare KEYS: rt.Variant;
  declare MODEL_HAYS: rt.Variant;
  declare MODEL_KEYS: rt.Variant;
  declare CAPS: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.HAYS = rt.V.array(rt.GArray.of([rt.V.str("hello"), rt.V.str("Hello World"), rt.V.str("aaa"), rt.V.str("ababab"), rt.V.str("a"), rt.V.str("0123456789"), rt.V.str("xYxyX"), rt.V.str("test_case-1.2"), rt.V.str("i am"), rt.V.str("McDonald")]));
      rt.frameLine(4);
      this.KEYS = rt.V.array(rt.GArray.of([rt.V.str("l"), rt.V.str("L"), rt.V.str("ll"), rt.V.str("lo"), rt.V.str("z"), rt.V.str(" "), rt.V.str("_"), rt.V.str("x"), rt.V.str("X"), rt.V.str("567"), rt.V.str("aa"), rt.V.str("o World"), rt.V.str("I"), rt.V.str("d")]));
      rt.frameLine(5);
      this.MODEL_HAYS = rt.V.array(rt.GArray.of([rt.V.str("0123456789"), rt.V.str("xyxyxy"), rt.V.str("a"), rt.V.str(""), rt.V.str("hello")]));
      rt.frameLine(6);
      this.MODEL_KEYS = rt.V.array(rt.GArray.of([rt.V.str(""), rt.V.str("0"), rt.V.str("5"), rt.V.str("9"), rt.V.str("01"), rt.V.str("45"), rt.V.str("89"), rt.V.str("456"), rt.V.str("789"), rt.V.str("34567"), rt.V.str("0123456789"), rt.V.str("x"), rt.V.str("xy"), rt.V.str("xyx"), rt.V.str("l"), rt.V.str("ll")]));
      rt.frameLine(7);
      this.CAPS = rt.V.array(rt.GArray.of([rt.V.str("hello world"), rt.V.str("HELLO WORLD"), rt.V.str("hELLo wORLd"), rt.V.str("hello"), rt.V.str(""), rt.V.str(" "), rt.V.str("   "), rt.V.str("  hello  world  "), rt.V.str("leading "), rt.V.str(" test_case"), rt.V.str("test_case"), rt.V.str("test-case"), rt.V.str("test.case"), rt.V.str("a b c"), rt.V.str("i am"), rt.V.str("i"), rt.V.str("I"), rt.V.str("i'm"), rt.V.str("don't"), rt.V.str("x i x"), rt.V.str("ix"), rt.V.str("XI"), rt.V.str("xi ii iii iv v vi vii viii ix x"), rt.V.str("XII"), rt.V.str("xx"), rt.V.str("iii"), rt.V.str("iv"), rt.V.str("iiiad"), rt.V.str("xiv"), rt.V.str("six x ix"), rt.V.str("123 abc"), rt.V.str("hello123world"), rt.V.str("été école"), rt.V.str("ß ss"), rt.V.str("a'a"), rt.V.str("i i i"), rt.V.str("it's a test"), rt.V.str("THE III RD"), rt.V.str("  i  "), rt.V.str("iX"), rt.V.str("xi"), rt.V.str("min"), rt.V.str("mix"), rt.V.str("vi"), rt.V.str("vii"), rt.V.str("vil"), rt.V.str("iI"), rt.V.str("xIx"), rt.V.str("ii"), rt.V.str("iiii"), rt.V.str("v"), rt.V.str("vix"), rt.V.str("a i b"), rt.V.str("I23"), rt.V.str("i-"), rt.V.str("-i"), rt.V.str("_i"), rt.V.str("McDonald"), rt.V.str("HELLO, WORLD!"), rt.V.str("a.b"), rt.V.str("AB CD"), rt.V.str("ABC"), rt.V.str("A B"), rt.V.str("AB"), rt.V.str("AbCdEf"), rt.V.str("AAa"), rt.V.str("AAAa"), rt.V.str("aA"), rt.V.str("aAA"), rt.V.str("1a"), rt.V.str("1A"), rt.V.str("a1"), rt.V.str("A1"), rt.V.str("1Aa"), rt.V.str("2aa"), rt.V.str("2aA"), rt.V.str("upperCamelCase"), rt.V.str("lower_snake_case"), rt.V.str("kebab-case-string"), rt.V.str("multiple   spaces\tbetween"), rt.V.str("tab\there"), rt.V.str("a b  c"), rt.V.str("  "), rt.V.str("\t"), rt.V.str("1"), rt.V.str("12 34"), rt.V.str("Ⅻ roman"), rt.V.str("ÄÖÜ äöü"), rt.V.str("Ω pa"), rt.V.str("ﬁ ligature"), rt.V.str("ǅ digraph"), rt.V.str("Ǆ digraph"), rt.V.str("ǆ digraph"), rt.V.str("ΣΣΣ"), rt.V.str("ς end"), rt.V.str("İstanbul"), rt.V.str("ıstanbul"), rt.V.str("Ǳǲǳ"), rt.V.str("ﬅ ligature")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static HAYS = rt.V.array(rt.GArray.of([rt.V.str("hello"), rt.V.str("Hello World"), rt.V.str("aaa"), rt.V.str("ababab"), rt.V.str("a"), rt.V.str("0123456789"), rt.V.str("xYxyX"), rt.V.str("test_case-1.2"), rt.V.str("i am"), rt.V.str("McDonald")]));
  static KEYS = rt.V.array(rt.GArray.of([rt.V.str("l"), rt.V.str("L"), rt.V.str("ll"), rt.V.str("lo"), rt.V.str("z"), rt.V.str(" "), rt.V.str("_"), rt.V.str("x"), rt.V.str("X"), rt.V.str("567"), rt.V.str("aa"), rt.V.str("o World"), rt.V.str("I"), rt.V.str("d")]));
  static MODEL_HAYS = rt.V.array(rt.GArray.of([rt.V.str("0123456789"), rt.V.str("xyxyxy"), rt.V.str("a"), rt.V.str(""), rt.V.str("hello")]));
  static MODEL_KEYS = rt.V.array(rt.GArray.of([rt.V.str(""), rt.V.str("0"), rt.V.str("5"), rt.V.str("9"), rt.V.str("01"), rt.V.str("45"), rt.V.str("89"), rt.V.str("456"), rt.V.str("789"), rt.V.str("34567"), rt.V.str("0123456789"), rt.V.str("x"), rt.V.str("xy"), rt.V.str("xyx"), rt.V.str("l"), rt.V.str("ll")]));
  static CAPS = rt.V.array(rt.GArray.of([rt.V.str("hello world"), rt.V.str("HELLO WORLD"), rt.V.str("hELLo wORLd"), rt.V.str("hello"), rt.V.str(""), rt.V.str(" "), rt.V.str("   "), rt.V.str("  hello  world  "), rt.V.str("leading "), rt.V.str(" test_case"), rt.V.str("test_case"), rt.V.str("test-case"), rt.V.str("test.case"), rt.V.str("a b c"), rt.V.str("i am"), rt.V.str("i"), rt.V.str("I"), rt.V.str("i'm"), rt.V.str("don't"), rt.V.str("x i x"), rt.V.str("ix"), rt.V.str("XI"), rt.V.str("xi ii iii iv v vi vii viii ix x"), rt.V.str("XII"), rt.V.str("xx"), rt.V.str("iii"), rt.V.str("iv"), rt.V.str("iiiad"), rt.V.str("xiv"), rt.V.str("six x ix"), rt.V.str("123 abc"), rt.V.str("hello123world"), rt.V.str("été école"), rt.V.str("ß ss"), rt.V.str("a'a"), rt.V.str("i i i"), rt.V.str("it's a test"), rt.V.str("THE III RD"), rt.V.str("  i  "), rt.V.str("iX"), rt.V.str("xi"), rt.V.str("min"), rt.V.str("mix"), rt.V.str("vi"), rt.V.str("vii"), rt.V.str("vil"), rt.V.str("iI"), rt.V.str("xIx"), rt.V.str("ii"), rt.V.str("iiii"), rt.V.str("v"), rt.V.str("vix"), rt.V.str("a i b"), rt.V.str("I23"), rt.V.str("i-"), rt.V.str("-i"), rt.V.str("_i"), rt.V.str("McDonald"), rt.V.str("HELLO, WORLD!"), rt.V.str("a.b"), rt.V.str("AB CD"), rt.V.str("ABC"), rt.V.str("A B"), rt.V.str("AB"), rt.V.str("AbCdEf"), rt.V.str("AAa"), rt.V.str("AAAa"), rt.V.str("aA"), rt.V.str("aAA"), rt.V.str("1a"), rt.V.str("1A"), rt.V.str("a1"), rt.V.str("A1"), rt.V.str("1Aa"), rt.V.str("2aa"), rt.V.str("2aA"), rt.V.str("upperCamelCase"), rt.V.str("lower_snake_case"), rt.V.str("kebab-case-string"), rt.V.str("multiple   spaces\tbetween"), rt.V.str("tab\there"), rt.V.str("a b  c"), rt.V.str("  "), rt.V.str("\t"), rt.V.str("1"), rt.V.str("12 34"), rt.V.str("Ⅻ roman"), rt.V.str("ÄÖÜ äöü"), rt.V.str("Ω pa"), rt.V.str("ﬁ ligature"), rt.V.str("ǅ digraph"), rt.V.str("Ǆ digraph"), rt.V.str("ǆ digraph"), rt.V.str("ΣΣΣ"), rt.V.str("ς end"), rt.V.str("İstanbul"), rt.V.str("ıstanbul"), rt.V.str("Ǳǲǳ"), rt.V.str("ﬅ ligature")]));

  constructor() {
    super();
    this.__gd_fields__();
  }

  _join(parts: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_join");
    try {
      rt.frameLine(24);
      let out = rt.stampArray(rt.V.array(rt.GArray.of([])), "String", true);
      rt.frameLine(25);
      for (let p of rt.iter(parts)) {
        rt.frameLine(26);
        rt.method(out, "append", [rt.strBuiltin([p])]);
      }
      rt.frameLine(27);
      return rt.method(rt.V.str(";"), "join", [out]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(30);
      for (let h of rt.iter(Main.HAYS)) {
        rt.frameLine(31);
        for (let k of rt.iter(Main.KEYS)) {
          rt.frameLine(32);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("replace\t"), h), rt.V.str("\t")), k), rt.V.str("\t")), rt.method(h, "replace", [k, rt.V.str("|")])), rt.V.str("\t")), rt.method(h, "replacen", [k, rt.V.str("|")])), rt.V.str("\t")), rt.method(h, "replace", [k, rt.V.str("")])), rt.V.str("\t")), rt.method(h, "replacen", [k, rt.V.str("")]))]));
        }
      }
      rt.frameLine(33);
      for (let h of rt.iter(Main.MODEL_HAYS)) {
        rt.frameLine(34);
        for (let k of rt.iter(Main.MODEL_KEYS)) {
          rt.frameLine(35);
          let parts = rt.V.array(rt.GArray.of([]));
          rt.frameLine(36);
          for (let f of rt.rangeSeq([rt.V.int((-12)), rt.V.int(13)])) {
            rt.frameLine(37);
            rt.method(parts, "append", [rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.strBuiltin([rt.V.int(f)]), rt.V.str("=")), rt.strBuiltin([rt.method(h, "find", [k, rt.V.int(f)])])), rt.V.str("/")), rt.strBuiltin([rt.method(h, "findn", [k, rt.V.int(f)])])), rt.V.str("/")), rt.strBuiltin([rt.method(h, "rfind", [k, rt.V.int(f)])])), rt.V.str("/")), rt.strBuiltin([rt.method(h, "rfindn", [k, rt.V.int(f)])]))]);
          }
          rt.frameLine(38);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("find\t"), h), rt.V.str("\t")), k), rt.V.str("\t")), this._join(parts))]));
        }
      }
      rt.frameLine(39);
      for (let h of rt.iter(Main.MODEL_HAYS)) {
        rt.frameLine(40);
        for (let k of rt.iter(Main.MODEL_KEYS)) {
          rt.frameLine(41);
          print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("find0\t"), h), rt.V.str("\t")), k), rt.V.str("\t")), rt.strBuiltin([rt.method(h, "find", [k])])), rt.V.str("\t")), rt.strBuiltin([rt.method(h, "rfind", [k])])), rt.V.str("\t")), rt.strBuiltin([rt.method(h, "findn", [k])])), rt.V.str("\t")), rt.strBuiltin([rt.method(h, "rfindn", [k])]))]));
        }
      }
      rt.frameLine(42);
      for (let c of rt.iter(Main.CAPS)) {
        rt.frameLine(43);
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("cap\t"), c), rt.V.str("\t")), rt.method(c, "capitalize", []))]));
      }
      rt.frameLine(44);
      for (let cp of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(10), rt.V.int(13), rt.V.int(32), rt.V.int(133), rt.V.int(160), rt.V.int(5760), rt.V.int(8192), rt.V.int(8195), rt.V.int(8232), rt.V.int(8233), rt.V.int(8239), rt.V.int(8287), rt.V.int(12288), rt.V.int(65535)])))) {
        rt.frameLine(45);
        let seps = rt.stringStatic("chr", [cp]);
        rt.frameLine(46);
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("capsep\t"), rt.strBuiltin([cp])), rt.V.str("\t")), rt.method(rt.ops.add(rt.ops.add(rt.V.str("a"), seps), rt.V.str("b")), "capitalize", []))]));
      }
      rt.frameLine(47);
      for (let cp of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(45), rt.V.int(173), rt.V.int(1426), rt.V.int(6150), rt.V.int(8208), rt.V.int(8209), rt.V.int(8210), rt.V.int(8211), rt.V.int(8212), rt.V.int(8213), rt.V.int(11799), rt.V.int(11802), rt.V.int(12540), rt.V.int(65048), rt.V.int(65123), rt.V.int(65293), rt.V.int(95), rt.V.int(65510), rt.V.int(43), rt.V.int(46)])))) {
        rt.frameLine(48);
        let seps = rt.stringStatic("chr", [cp]);
        rt.frameLine(49);
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("caphyphen\t"), rt.strBuiltin([cp])), rt.V.str("\t")), rt.method(rt.ops.add(rt.ops.add(rt.V.str("a"), seps), rt.V.str("b")), "capitalize", []))]));
      }
      rt.frameLine(50);
      for (let cp of rt.iter(rt.V.array(rt.GArray.of([rt.V.int(48), rt.V.int(1632), rt.V.int(1984), rt.V.int(660), rt.V.int(661), rt.V.int(2546), rt.V.int(65296)])))) {
        rt.frameLine(51);
        let dgt = rt.stringStatic("chr", [cp]);
        rt.frameLine(52);
        print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("capdigit\t"), rt.strBuiltin([cp])), rt.V.str("\t")), rt.method(rt.ops.add(dgt, rt.V.str("ab")), "capitalize", [])), rt.V.str("\t")), rt.method(rt.ops.add(rt.ops.add(rt.V.str("a"), dgt), rt.V.str("b")), "capitalize", [])), rt.V.str("\t")), rt.method(rt.ops.add(dgt, rt.V.str("AB")), "capitalize", []))]));
      }
      rt.frameLine(53);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("utf\t"), rt.strBuiltin([rt.method(rt.V.str("😀a😀"), "find", [rt.V.str("a")])])), rt.V.str("\t")), rt.strBuiltin([rt.method(rt.V.str("😀a😀"), "length", [])])), rt.V.str("\t")), rt.method(rt.V.str("😀a😀"), "replace", [rt.V.str("a"), rt.V.str("X")])), rt.V.str("\t")), rt.method(rt.V.str("😀A"), "capitalize", []))]));
      rt.frameLine(54);
      print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("utf2\t"), rt.strBuiltin([rt.method(rt.V.str("é́x"), "find", [rt.V.str("x")])])), rt.V.str("\t")), rt.strBuiltin([rt.method(rt.V.str("🦀🦀b"), "rfind", [rt.V.str("b")])])), rt.V.str("\t")), rt.method(rt.V.str("🦀b🦀"), "replace", [rt.V.str("b"), rt.V.str("Z")]))]));
      rt.frameLine(55);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_join": return rt.wrapValue(this._join(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["HAYS","KEYS","MODEL_HAYS","MODEL_KEYS","CAPS"], (o) => { const s = o as Main; return [s.HAYS, s.KEYS, s.MODEL_HAYS, s.MODEL_KEYS, s.CAPS]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_join": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "_join": ["Array"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
