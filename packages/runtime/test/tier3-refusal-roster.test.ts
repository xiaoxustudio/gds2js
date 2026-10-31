/** Tier 3 的定形拒绝清单：每一格都是「实测之外，按纪律响亮拒」的那一形；谁把哪一格实现了，就得把那一格从这张表里划走。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError, V, attribute, method, nativeClass, registerHostIo, type HostIo, type Variant } from "@gds2js/runtime";

/** 一张不碰盘面的假表：路径只要不以 gone.txt 收尾就算在，目录只有 work 那一格。 */
const TABLE: HostIo = {
  exists: (p) => !p.endsWith("gone.txt"),
  isDir: (p) => p.endsWith("work"),
  read: () => Uint8Array.of(104, 105),
  write: () => true,
  size: () => 2,
  makeDir: () => 0,
  remove: () => 0,
  rename: () => 0,
  copy: () => 0,
  list: () => ["a.txt"],
};

registerHostIo(TABLE);

const T = (s: string): Variant => V.str(s);
const I = (x: number): Variant => V.int(x);

function say(run: () => unknown): string {
  try {
    run();
    return "没抛";
  } catch (e) {
    return e instanceof UnsupportedError ? e.code : `不是响亮拒：${String(e)}`;
  }
}

const FILE = nativeClass("FileAccess");
const DIR = nativeClass("DirAccess");

function writer(path = "user://probe.txt"): Variant {
  return method(FILE, "open", [T(path), I(2)]);
}

function reader(path = "user://probe.txt"): Variant {
  return method(FILE, "open", [T(path), I(1)]);
}

function dir(): Variant {
  return method(DIR, "open", [T("user://work")]);
}

const RX = nativeClass("RegEx");

function regex(pattern: string): Variant {
  const r = method(RX, "new", []);
  method(r, "compile", [T(pattern)]);
  return r;
}

function matchOf(pattern: string, text: string, from = 0): Variant {
  return method(regex(pattern), "search", [T(text), I(from)]);
}

describe("tier3 · 定形拒绝清单", () => {
  it("FileAccess 的成员面：没量过的那一族照旧响亮拒", () => {
    eq("t3", "get_pascal_string", say(() => method(writer(), "get_pascal_string", [])), "fa-method");
    eq("t3", "get_bool 引擎根本没有", say(() => method(reader(), "get_bool", [])), "fa-method");
    eq("t3", "seek_end", say(() => method(reader(), "seek_end", [I(-2)])), "fa-method");
    eq("t3", "open_compressed", say(() => method(writer(), "open_compressed", [])), "fa-method");
    eq("t3", "get_md5", say(() => method(reader(), "get_md5", [T("user://probe.txt")])), "fa-method");
    eq("t3", "store_var 之外的端序开关", say(() => method(writer(), "set_big_endian", [V.bool(true)])), "fa-method");
  });

  it("FileAccess 关闭之后：引擎打的是 drivers/windows 的 ERROR 块，值也没法复现", () => {
    const f = writer();
    method(f, "close", []);
    eq("t3", "get_position", say(() => method(f, "get_position", [])), "fa-closed");
    eq("t3", "get_length", say(() => method(f, "get_length", [])), "fa-closed");
    eq("t3", "store_string", say(() => method(f, "store_string", [T("x")])), "fa-closed");
    eq("t3", "is_open 反倒是量过的那格", `${String(method(f, "is_open", []).v)}`, "false");
    eq("t3", "close 可以重放", say(() => method(f, "close", [])), "没抛");
  });

  it("FileAccess 的打开面：模式与路径两维都只放行实测那几形", () => {
    eq("t3", "READ_WRITE 模式", say(() => method(FILE, "open", [T("user://a.txt"), I(3)])), "fa-mode");
    eq("t3", "WRITE_READ 模式", say(() => method(FILE, "open", [T("user://a.txt"), I(7)])), "fa-mode");
    eq("t3", "res:// 路径", say(() => method(FILE, "open", [T("res://a.txt"), I(2)])), "io-res-path");
    eq("t3", "裸相对路径", say(() => method(FILE, "open", [T("a.txt"), I(2)])), "io-path-shape");
    eq("t3", "READ 句柄上写", say(() => method(reader(), "store_string", [T("x")])), "fa-readonly");
    eq("t3", "open 的第三个实参（allow_user_substitution）", say(() => method(FILE, "open", [T("user://a.txt"), I(2), V.bool(true)])), "io-arity");
  });

  it("DirAccess 的成员面：绝对化的实参与没量过的那一族", () => {
    eq("t3", "get_size 引擎根本没有", say(() => method(dir(), "get_size", [T("a.txt")])), "da-method");
    eq("t3", "is_read_only 引擎根本没有", say(() => method(dir(), "is_read_only", [])), "da-method");
    eq("t3", "get_relative_path 引擎根本没有", say(() => method(dir(), "get_relative_path", [T("a"), T("b")])), "da-method");
    eq("t3", "实例方法带 res://", say(() => method(dir(), "file_exists", [T("res://a")])), "da-rel-path");
    eq("t3", "copy 的相对实参", say(() => method(dir(), "copy", [T("a.txt"), T("b.txt")])), "da-abs-arg");
    eq("t3", "remove 的相对实参", say(() => method(dir(), "remove", [T("a.txt")])), "da-abs-arg");
    eq("t3", "copy 的源不存在（引擎带 core/io 的 ERROR 块）", say(() => method(dir(), "copy", [T("user://gone.txt"), T("user://work")])), "da-copy-missing");
    eq("t3", "静态面的 get_files_at_absolute", say(() => method(DIR, "get_files_at_absolute", [T("user://work")])), "native-class-member");
  });

  it("没建模的宿主 API 与引擎单例都在名单外", () => {
    eq("t3", "OS 的静态调用", say(() => method(nativeClass("OS"), "get_name", [])), "native-class-member");
    eq("t3", "Engine 的静态调用", say(() => method(nativeClass("Engine"), "get_main_loop", [])), "native-class-member");
    eq("t3", "Marshalls 在 GDScript 里本就解析期拒", say(() => method(nativeClass("Marshalls"), "bool_to_bit", [V.bool(true)])), "native-class-member");
    eq("t3", "FileAccess 常量面只量过四格", say(() => attribute(FILE, "READ_WRITE_FLUSH")), "native-class-member");
  });

  it("FileAccess 常量面：实测那四格原样给出", () => {
    const row = (n: string): string => String((attribute(FILE, n) as Variant).v);
    eq("t3", "READ/WRITE/READ_WRITE/WRITE_READ", `${row("READ")}|${row("WRITE")}|${row("READ_WRITE")}|${row("WRITE_READ")}`, "1|2|3|7");
  });

  it("RegEx 的 pattern 白名单：名单外一律响亮拒，不走引擎的报错路", () => {
    eq("t3", "名单外的字面量", say(() => method(regex("a"), "search", [T("a")])), "rx-pattern");
    eq("t3", "数字后向引用", say(() => regex("a\\1")), "rx-pattern");
    eq("t3", "Python 式命名组", say(() => regex("(?P<n>a)")), "rx-pattern");
    eq("t3", "POSIX 别支", say(() => regex("[[:digit:]]+")), "rx-pattern");
    eq("t3", "第二个 (?i)", say(() => regex("(?i)a(?i)b")), "rx-pattern");
    eq("t3", "负向预查", say(() => regex("a(?!b)")), "rx-pattern");
    eq("t3", "可变长度后顾", say(() => regex("(?<=a)b")), "rx-pattern");
  });

  it("RegEx 的文本实参：偏移与字符类语义只量过 ASCII 那一层", () => {
    eq("t3", "需配对码位", say(() => method(regex("\\w+"), "search", [T("a\uD800\uDCC0b")])), "rx-subject-encoding");
    eq("t3", "\\w 遇上非 ASCII", say(() => method(regex("\\w+"), "search", [T("héllo")])), "rx-unicode-subject");
    eq("t3", "$ 遇上换行", say(() => method(regex("^\\d+$"), "search", [T("12\n")])), "rx-dollar-newline");
    eq("t3", "字面量 pattern 的 Unicode 面", say(() => method(regex("é"), "search", [T("xéy")])), "rx-pattern");
  });

  it("RegEx.sub 的替换串：只收 $0..$9、${名}、$$ 与字面文本", () => {
    const r = regex("(\\w+)@(\\w+)");
    eq("t3", "$&", say(() => method(r, "sub", [T("a@b"), T("$&"), I(1)])), "rx-replacement");
    eq("t3", "${0}", say(() => method(r, "sub", [T("a@b"), T("${0}"), I(1)])), "rx-replacement");
    eq("t3", "${没这个名字}", say(() => method(r, "sub", [T("a@b"), T("${nope}"), I(1)])), "rx-replacement");
    eq("t3", "$11 两位数", say(() => method(r, "sub", [T("a@b"), T("$11"), I(1)])), "rx-replacement");
    eq("t3", "$3 越过组数", say(() => method(r, "sub", [T("a@b"), T("$3"), I(1)])), "rx-replacement");
    eq("t3", "$$ 收尾", say(() => method(r, "sub", [T("a@b"), T("x$"), I(1)])), "rx-replacement");
    eq("t3", "\\1", say(() => method(r, "sub", [T("a@b"), T("\\1"), I(1)])), "rx-replacement");
    eq("t3", "实测的计数语义", `${String(method(regex("[^,]+"), "sub", [T("a,bb,c"), T("#")]).v)}|${String(method(regex("[^,]+"), "sub", [T("a,bb,c"), T("#"), I(1)]).v)}`, "#,bb,c|#,#,#");
  });

  it("RegEx 与 RegExMatch 的成员面和元数", () => {
    eq("t3", "create_from_string 返回新实例，面没量完", say(() => method(regex("a*"), "create_from_string", [T("\\w+"), V.bool(true)])), "rx-method");
    eq("t3", "match 引擎根本没有", say(() => method(regex("a*"), "match", [T("a")])), "rx-method");
    eq("t3", "split 引擎根本没有", say(() => method(regex("a*"), "split", [T("a")])), "rx-method");
    eq("t3", "get_flags 引擎根本没有", say(() => method(regex("a*"), "get_flags", [])), "rx-method");
    eq("t3", "compile 带第二个实参", say(() => method(regex("a*"), "compile", [T("a*"), I(1)])), "rx-arity");
    eq("t3", "search 带第三个实参", say(() => method(regex("a*"), "search", [T("a"), I(0), I(1)])), "rx-arity");
    eq("t3", "sub 带第五个实参（subskip）", say(() => method(regex("a*"), "sub", [T("a"), T("#"), I(1), I(0), I(1)])), "rx-arity");
    eq("t3", "compile 的实参不是 String", say(() => method(regex("a*"), "compile", [I(3)])), "rx-arg-type");
    eq("t3", "RegExMatch.get_named_group 引擎根本没有", say(() => method(matchOf("\\w+", "ab"), "get_named_group", [T("n")])), "rxm-method");
    eq("t3", "RegExMatch.get_named_strings 引擎根本没有", say(() => method(matchOf("\\w+", "ab"), "get_named_strings", [])), "rxm-method");
    eq("t3", "RegExMatch.pos_to_utf8_offset 引擎根本没有", say(() => method(matchOf("\\w+", "ab"), "pos_to_utf8_offset", [I(0)])), "rxm-method");
  });

  it("RegEx 实测面：新实例、名单序与越界组号那三格原样给出", () => {
    const fresh = method(RX, "new", []);
    eq("t3", "新实例的 validity 与 pattern", `${String(method(fresh, "is_valid", []).v)}|${String(method(fresh, "get_pattern", []).v)}`, "false|");
    const named = regex("(?<user>\\w+)@(?<host>\\w+)");
    eq("t3", "get_names 按名字排序", JSON.stringify((method(named, "get_names", []).v as { raw(): Variant[] }).raw().map((e) => String(e.v))), '["host","user"]');
    const m = matchOf("(?<user>\\w+)@(?<host>\\w+)", "mail bob@site x");
    eq("t3", "越界组号的三格", `${String(method(m, "get_string", [I(9)]).v)}|${String(method(m, "get_start", [I(9)]).v)}|${String(method(m, "get_end", [I(9)]).v)}`, "|-1|-1");
    eq("t3", "未参与的组给空与 -1", `${String(method(matchOf("(a)?b", "b"), "get_string", [I(1)]).v)}|${String(method(matchOf("(a)?b", "b"), "get_start", [I(1)]).v)}`, "|-1");
  });
});
