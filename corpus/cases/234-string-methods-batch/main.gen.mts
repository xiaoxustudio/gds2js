// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let s = rt.V.str("hello world");
    print(rt.showArgs([rt.method(s, "begins_with", [rt.V.str("hello")])]));
    print(rt.showArgs([rt.method(s, "begins_with", [rt.V.str("Hello")])]));
    print(rt.showArgs([rt.method(s, "begins_with", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "begins_with", [rt.V.str("abcd")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "begins_with", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str("αβγ"), "begins_with", [rt.V.str("αβ")])]));
    print(rt.showArgs([rt.method(rt.V.str("😀a"), "begins_with", [rt.V.str("😀")])]));
    print(rt.showArgs([rt.method(s, "ends_with", [rt.V.str("world")])]));
    print(rt.showArgs([rt.method(s, "ends_with", [rt.V.str("World")])]));
    print(rt.showArgs([rt.method(s, "ends_with", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "ends_with", [rt.V.str("zabc")])]));
    print(rt.showArgs([rt.method(rt.V.str("a b"), "ends_with", [rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("éé"), "ends_with", [rt.V.str("é")])]));
    print(rt.showArgs([rt.V.str("---get_slice---")]));
    for (let n of rt.iter(rt.V.array(rt.GArray.of([rt.V.int((-3)), rt.V.int((-2)), rt.V.int((-1)), rt.V.int(0), rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])))) {
      print(rt.showArgs([rt.V.str("a/b/c|"), n, rt.V.str("|"), rt.method(rt.V.str("a/b/c"), "get_slice", [rt.V.str("/"), n])]));
    }
    for (let n of rt.iter(rt.V.array(rt.GArray.of([rt.V.int((-1)), rt.V.int(0), rt.V.int(1), rt.V.int(2)])))) {
      print(rt.showArgs([rt.V.str("abc|"), n, rt.V.str("|"), rt.method(rt.V.str("abc"), "get_slice", [rt.V.str("/"), n])]));
      print(rt.showArgs([rt.V.str("|"), n, rt.V.str("|"), rt.method(rt.V.str(""), "get_slice", [rt.V.str("/"), n])]));
      print(rt.showArgs([rt.V.str("a/|"), n, rt.V.str("|"), rt.method(rt.V.str("a/"), "get_slice", [rt.V.str("/"), n])]));
      print(rt.showArgs([rt.V.str("/a|"), n, rt.V.str("|"), rt.method(rt.V.str("/a"), "get_slice", [rt.V.str("/"), n])]));
      print(rt.showArgs([rt.V.str("a,,b|"), n, rt.V.str("|"), rt.method(rt.V.str("a,,b"), "get_slice", [rt.V.str(","), n])]));
      print(rt.showArgs([rt.V.str("aXbXc|"), n, rt.V.str("|"), rt.method(rt.V.str("aXbXc"), "get_slice", [rt.V.str("X"), n])]));
    }
    print(rt.showArgs([rt.V.str("ab-cd-ef|1|"), rt.method(rt.V.str("ab-cd-ef"), "get_slice", [rt.V.str("cd"), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("ab-cd-ef|0|"), rt.method(rt.V.str("ab-cd-ef"), "get_slice", [rt.V.str("cd"), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("ab-cd-ef|2|"), rt.method(rt.V.str("ab-cd-ef"), "get_slice", [rt.V.str("cd"), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("a/b/c|1e|"), rt.method(rt.V.str("a/b/c"), "get_slice", [rt.V.str(""), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("---insert erase repeat---")]));
    print(rt.showArgs([rt.method(rt.V.str("ac"), "insert", [rt.V.int(1), rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("ac"), "insert", [rt.V.int(0), rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("ac"), "insert", [rt.V.int(2), rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("ac"), "insert", [rt.V.int(9), rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("ac"), "insert", [rt.V.int((-1)), rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("ac"), "insert", [rt.V.int(1), rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str("éa"), "insert", [rt.V.int(1), rt.V.str("b")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(1), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(2), rt.V.int(5)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(5), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(1), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(2), rt.V.int(2)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "erase", [rt.V.int(1), rt.V.int(1000000)])]));
    print(rt.showArgs([rt.method(rt.V.str("ab"), "repeat", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.str("ab"), "repeat", [rt.V.int(0)])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "repeat", [rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.str("é"), "repeat", [rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("---strip_edges---")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str("  a b  "), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str("\ta\n"), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str(""), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str("   "), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str("a  b"), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str("\r\na\r\n"), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str(" a "), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("["), rt.method(rt.V.str("\u0001a\u001fa"), "strip_edges", []), rt.V.str("]")]));
    print(rt.showArgs([rt.V.str("---unicode_at count---")]));
    print(rt.showArgs([rt.method(rt.V.str("éa"), "unicode_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.method(rt.V.str("éa"), "unicode_at", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(rt.V.str("😀a"), "unicode_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.method(rt.V.str("😀a"), "unicode_at", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "unicode_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.method(s, "count", [rt.V.str("o")])]));
    print(rt.showArgs([rt.method(s, "count", [rt.V.str("x")])]));
    print(rt.showArgs([rt.method(s, "count", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "count", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "count", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.str("aaa"), "count", [rt.V.str("aa")])]));
    print(rt.showArgs([rt.method(rt.V.str("aaaa"), "count", [rt.V.str("aa")])]));
    print(rt.showArgs([rt.method(rt.V.str("hello"), "count", [rt.V.str("l")])]));
    print(rt.showArgs([rt.method(rt.V.str("hello"), "count", [rt.V.str("ll")])]));
    print(rt.showArgs([rt.method(rt.V.str("a1a"), "count", [rt.V.str("1")])]));
    print(rt.showArgs([rt.method(rt.V.str("AAA"), "count", [rt.V.str("aa")])]));
    print(rt.showArgs([rt.method(rt.V.str("a\na"), "count", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.str("héllo"), "count", [rt.V.str("é")])]));
    print(rt.showArgs([rt.method(rt.V.str("Hello World"), "countn", [rt.V.str("o")])]));
    print(rt.showArgs([rt.method(rt.V.str("HELLO hello"), "countn", [rt.V.str("l")])]));
    print(rt.showArgs([rt.method(rt.V.str("Hello"), "countn", [rt.V.str("h")])]));
    print(rt.showArgs([rt.method(rt.V.str("aAaA"), "countn", [rt.V.str("aa")])]));
    print(rt.showArgs([rt.method(rt.V.str("éÉ"), "countn", [rt.V.str("é")])]));
    print(rt.showArgs([rt.V.str("---casecmp_to---")]));
    print(rt.showArgs([rt.method(rt.V.str("a"), "casecmp_to", [rt.V.str("B")])]));
    print(rt.showArgs([rt.method(rt.V.str("B"), "casecmp_to", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.str("a"), "casecmp_to", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "casecmp_to", [rt.V.str("abd")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "casecmp_to", [rt.V.str("ab")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "casecmp_to", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.str("A"), "casecmp_to", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.str("é"), "casecmp_to", [rt.V.str("E")])]));
    print(rt.showArgs([rt.method(rt.V.str("1"), "casecmp_to", [rt.V.str("10")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "casecmp_to", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str("😀"), "casecmp_to", [rt.V.str("a")])]));
    print(rt.showArgs([rt.V.str("---filename uri escape---")]));
    print(rt.showArgs([rt.method(rt.V.str("a/b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a\\b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a:b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("con"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str(".."), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a?b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a%b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a*b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a<b>c"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a|b"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("é"), "is_valid_filename", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a b&"), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a/b?c=d&e"), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str("é😀"), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a-z0.~_!"), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str("*'"), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str("\t"), "uri_encode", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a\nb\tc"), "c_escape", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a\\b"), "c_escape", [])]));
    print(rt.showArgs([rt.method(rt.V.str("\"q\""), "c_escape", [])]));
    print(rt.showArgs([rt.method(rt.V.str("it's"), "c_escape", [])]));
    print(rt.showArgs([rt.method(rt.V.str("é"), "c_escape", [])]));
    print(rt.showArgs([rt.V.str("---case style---")]));
    print(rt.showArgs([rt.method(rt.V.str("foo_bar-baz"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("FooBar"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("fooBar"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("foo__bar"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("_foo"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("  a  b"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("αβ_γ"), "to_camel_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("fooBar_baz"), "to_kebab_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("FooBar"), "to_kebab_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("foo bar"), "to_kebab_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a.b"), "to_kebab_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("FOO_BAR"), "to_snake_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("fooBarBaz"), "to_snake_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("foo-bar"), "to_snake_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ABCdef"), "to_snake_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a1_b2"), "to_snake_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str("XMLHttpRequest"), "to_snake_case", [])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "to_snake_case", [])]));
    print(rt.showArgs([rt.V.str("---bin_to_int---")]));
    print(rt.showArgs([rt.method(rt.V.str("1010"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("10a0"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str(" 101"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("-101"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("+101"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("0102"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("0b101"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("1_0"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("11111111111111111111111111111111111111111111111111111111111111"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("-0"), "bin_to_int", [])]));
    print(rt.showArgs([rt.method(rt.V.str("aaaa"), "similarity", [rt.V.str("aa")])]));
    print(rt.showArgs([rt.method(rt.V.str("aaaaa"), "similarity", [rt.V.str("aaa")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "similarity", [rt.V.str("axc")])]));
    print(rt.showArgs([rt.method(rt.V.str("hello"), "similarity", [rt.V.str("hallo")])]));
    print(rt.showArgs([rt.method(rt.V.str("Hello"), "similarity", [rt.V.str("hello")])]));
    print(rt.showArgs([rt.method(rt.V.str("kitten"), "similarity", [rt.V.str("sitting")])]));
    print(rt.showArgs([rt.method(rt.V.str("hello"), "similarity", [rt.V.str("hell")])]));
    print(rt.showArgs([rt.method(rt.V.str("abcde"), "similarity", [rt.V.str("abcdefgh")])]));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "similarity", [rt.V.str("abc")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "similarity", [rt.V.str("")])]));
    print(rt.showArgs([rt.method(rt.V.str("a"), "similarity", [rt.V.str("ab")])]));
    print(rt.showArgs([rt.method(rt.V.str(""), "similarity", [rt.V.str("ab")])]));
    print(rt.showArgs([rt.V.str("0.5|"), rt.method(rt.V.str("0.5"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str(".5|"), rt.method(rt.V.str(".5"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("abc|"), rt.method(rt.V.str("abc"), "pad_zeros", [rt.V.int(5)])]));
    print(rt.showArgs([rt.V.str("--5|"), rt.method(rt.V.str("--5"), "pad_zeros", [rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("5|"), rt.method(rt.V.str("5"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("12|"), rt.method(rt.V.str("12"), "pad_zeros", [rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("x|"), rt.method(rt.V.str("x"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("a.b|"), rt.method(rt.V.str("a.b"), "pad_zeros", [rt.V.int(5)])]));
    print(rt.showArgs([rt.V.str("-.5|"), rt.method(rt.V.str("-.5"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("empty|"), rt.method(rt.V.str(""), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("wide|"), rt.method(rt.V.str("12345"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("plus|"), rt.method(rt.V.str("+5"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("space|"), rt.method(rt.V.str(" 5"), "pad_zeros", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("s0|"), rt.method(rt.V.str("a/b/c"), "get_slicec", [rt.V.int(47), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("s1|"), rt.method(rt.V.str("a/b/c"), "get_slicec", [rt.V.int(47), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("s2|"), rt.method(rt.V.str("a/b/c"), "get_slicec", [rt.V.int(47), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("s5|"), rt.method(rt.V.str("a/b/c"), "get_slicec", [rt.V.int(47), rt.V.int(5)])]));
    print(rt.showArgs([rt.V.str("sneg|"), rt.method(rt.V.str("a/b/c"), "get_slicec", [rt.V.int(47), rt.V.int((-1))])]));
    print(rt.showArgs([rt.V.str("sempty|"), rt.method(rt.V.str(""), "get_slicec", [rt.V.int(47), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("sdot|"), rt.method(rt.V.str("a.b"), "get_slicec", [rt.V.int(46), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("sdup|"), rt.method(rt.V.str("a//b"), "get_slicec", [rt.V.int(47), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("snodiv0|"), rt.method(rt.V.str("abc"), "get_slicec", [rt.V.int(1), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("snodiv3|"), rt.method(rt.V.str("abc"), "get_slicec", [rt.V.int(1), rt.V.int(3)])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
