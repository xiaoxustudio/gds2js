// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("s01|"), rt.method(rt.V.str("hello"), "bigrams", [])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("s02|"), rt.method(rt.V.str("a\nb"), "c_unescape", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("s03|"), rt.method(rt.V.str("Hello"), "containsn", [rt.V.str("LL")])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("s04|"), rt.method(rt.V.str("\tfoo\n\tbar"), "dedent", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("s05|"), rt.method(rt.V.str("A"), "filecasecmp_to", [rt.V.str("a")])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("s06|"), rt.method(rt.V.str("A"), "filenocasecmp_to", [rt.V.str("a")])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("s07|"), rt.method(rt.V.str("/a/b.txt"), "get_base_dir", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("s08|"), rt.method(rt.V.str("/a/b.txt"), "get_basename", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("s09|"), rt.method(rt.V.str("/a/b.txt"), "get_extension", [])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("s10|"), rt.method(rt.V.str("/a/b.txt"), "get_file", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("s11|"), rt.method(rt.V.str("4142"), "hex_decode", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("s12|"), rt.method(rt.V.str("a\nb"), "indent", [rt.V.str("> ")])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("s13|"), rt.method(rt.V.str("/a"), "is_absolute_path", [])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("s14|"), rt.method(rt.V.str("a"), "is_relative_path", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("s15|"), rt.method(rt.V.str("abc"), "is_subsequence_of", [rt.V.str("aXbXc")])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("s16|"), rt.method(rt.V.str("abc"), "is_subsequence_ofn", [rt.V.str("AxBxC")])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("s17|"), rt.method(rt.V.str("foo_bar"), "is_valid_identifier", [])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("s18|"), rt.method(rt.V.str("a\"b"), "json_escape", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("s19|"), rt.method(rt.V.str("7"), "lpad", [rt.V.int(3), rt.V.str("0")])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("s20|"), rt.method(rt.V.str("  x"), "lstrip", [rt.V.str(" ")])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("s21|"), rt.method(rt.V.str("Hello"), "matchn", [rt.V.str("*L*")])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("s22|"), rt.method(rt.V.str("abc"), "md5_buffer", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("s23|"), rt.method(rt.V.str("a2"), "naturalcasecmp_to", [rt.V.str("a10")])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("s24|"), rt.method(rt.V.str("a2"), "naturalnocasecmp_to", [rt.V.str("A10")])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("s25|"), rt.method(rt.V.str("Abc"), "nocasecmp_to", [rt.V.str("aBC")])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("s26|"), rt.method(rt.V.str("3.1"), "pad_decimals", [rt.V.int(3)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("s27|"), rt.method(rt.V.str("a"), "path_join", [rt.V.str("b")])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("s28|"), rt.method(rt.V.str("banana"), "remove_char", [rt.V.int(97)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("s29|"), rt.method(rt.V.str("banana"), "remove_chars", [rt.V.str("an")])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("s30|"), rt.method(rt.V.str("banana"), "replace_char", [rt.V.int(97), rt.V.int(111)])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("s31|"), rt.method(rt.V.str("banana"), "replace_chars", [rt.V.str("an"), rt.V.int(111)])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("s32|"), rt.method(rt.V.str("7"), "rpad", [rt.V.int(3), rt.V.str("0")])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("s33|"), rt.method(rt.V.str("a,b,c"), "rsplit", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("s34|"), rt.method(rt.V.str("x  "), "rstrip", [rt.V.str(" ")])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("s35|"), rt.method(rt.V.str("abc"), "sha1_buffer", [])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("s36|"), rt.method(rt.V.str("abc"), "sha1_text", [])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("s37|"), rt.method(rt.V.str("abc"), "sha256_buffer", [])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("s38|"), rt.method(rt.V.str("abc"), "sha256_text", [])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("s39|"), rt.method(rt.V.str("a/./b/../c"), "simplify_path", [])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("s40|"), rt.method(rt.V.str("1.5,2.5"), "split_floats", [rt.V.str(",")])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("s41|"), rt.method(rt.V.str("a\tb"), "strip_escapes", [])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("s42|"), rt.method(rt.V.str("hello_world"), "to_pascal_case", [])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("s43|"), rt.method(rt.V.str("abc"), "to_wchar_buffer", [])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("s44|"), rt.method(rt.V.str("foobar"), "trim_prefix", [rt.V.str("foo")])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("s45|"), rt.method(rt.V.str("foobar"), "trim_suffix", [rt.V.str("bar")])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("s46|"), rt.method(rt.V.str("a/b"), "validate_filename", [])]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("s47|"), rt.method(rt.V.str("a:b"), "validate_node_name", [])]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("s48|"), rt.method(rt.V.str("<a>&"), "xml_escape", [])]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("s49|"), rt.method(rt.V.str("&lt;a&gt;&amp;"), "xml_unescape", [])]));
      rt.frameLine(53);
      let sn = rt.stringNameCtor([rt.V.str("hello world")]);
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("n01|"), rt.method(sn, "bigrams", [])]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("n02|"), rt.method(sn, "containsn", [rt.V.str("WORLD")])]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("n03|"), rt.method(sn, "to_pascal_case", [])]));
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("n04|"), rt.method(sn, "get_basename", [])]));
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("n05|"), rt.method(sn, "is_valid_identifier", [])]));
      rt.frameLine(59);
      let arr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("a01|"), rt.method(arr, "back", []), rt.V.str("|"), rt.method(arr, "front", [])]));
      rt.frameLine(61);
      let bytes = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8)]))]);
      rt.frameLine(62);
      rt.method(bytes, "bswap32", []);
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("b01|"), bytes]));
      rt.frameLine(64);
      rt.method(bytes, "bswap64", []);
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("b02|"), bytes]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("b03|"), rt.method(bytes, "decode_s8", [rt.V.int(0)]), rt.V.str("|"), rt.method(bytes, "decode_s16", [rt.V.int(0)]), rt.V.str("|"), rt.method(bytes, "decode_s32", [rt.V.int(0)]), rt.V.str("|"), rt.method(bytes, "decode_s64", [rt.V.int(0)])]));
      rt.frameLine(67);
      print(rt.showArgs([rt.V.str("b04|"), rt.method(bytes, "decode_u32", [rt.V.int(0)])]));
      rt.frameLine(68);
      let d = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("d01|"), rt.method(d, "get_typed_value_class_name", [])]));
      rt.frameLine(70);
      let q = rt.quaternionNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(0)]);
      rt.frameLine(71);
      print(rt.showArgs([rt.V.str("q01|"), rt.method(q, "spherical_cubic_interpolate_in_time", [rt.quaternionNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.quaternionNew([rt.V.int(0), rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.quaternionNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.V.float(0.5), rt.V.float(1), rt.V.float(1), rt.V.float(1)])]));
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("p01|"), rt.projectionStatic("create_frustum", [rt.V.int((-1)), rt.V.int(1), rt.V.int((-1)), rt.V.int(1), rt.V.float(0.1), rt.V.int(10)])]));
      rt.frameLine(73);
      print(rt.showArgs([rt.V.str("p02|"), rt.projectionStatic("create_frustum_aspect", [rt.V.float(1), rt.V.float(1), rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.V.float(0.1), rt.V.int(10)])]));
      rt.frameLine(74);
      print(rt.showArgs([rt.V.str("p03|"), rt.projectionStatic("create_orthogonal_aspect", [rt.V.float(1), rt.V.float(1), rt.V.float(0.1), rt.V.int(10)])]));
      rt.frameLine(75);
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
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
