import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "./lib.mjs";

const TEST_DIR = join(ROOT, "packages", "compiler", "test");
const FIXTURES = join(TEST_DIR, "fixtures");
const TMP = join(ROOT, "tmp");

const GD_HINT = /\b(extends|func|var|const|signal|enum|class|static|return|pass|break|continue|if|elif|else|for|while|match|when|print|await|lambda)\b/;

const BAD_ELEVEN = [
  "410-stringname-literal-binary",
  "428-pattern-arm-comma",
  "429-pattern-arm-guard",
  "430-pattern-arm-paren",
  "433-pattern-match-no-subject",
  "434-pattern-no-colon",
  "435-pattern-wild-no-colon",
  "436-pattern-second-no-colon",
  "437-pattern-guard-empty",
  "438-pattern-match-subject-no-colon",
  "439-pattern-empty-block",
];

const EDGE = [
  { id: "edge-lambda", src: 'extends SceneTree\nfunc _initialize():\n\tvar f = func(a, b): return a + b\n\tprint(f.call(1, 2))\n\tquit()\n' },
  { id: "edge-multiline-call", src: 'extends SceneTree\nfunc _initialize():\n\tprint(\n\t\t1,\n\t\t2,\n\t)\n\tquit()\n' },
  { id: "edge-not-in", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1 not in [2])\n\tprint(not 1 in [2])\n\tquit()\n' },
  { id: "edge-is-not", src: 'extends SceneTree\nfunc _initialize():\n\tvar v = 1\n\tprint(v is not int)\n\tprint(v is int)\n\tquit()\n' },
  { id: "edge-node-path", src: 'extends SceneTree\nfunc _initialize():\n\tvar p = $"../Node"\n\tvar q = ^"a/b"\n\tprint(p, q)\n\tquit()\n' },
  { id: "edge-string-name", src: 'extends SceneTree\nfunc _initialize():\n\tvar s = &"name"\n\tvar t = &\'other\'\n\tprint(s, t)\n\tquit()\n' },
  { id: "edge-continuation", src: 'extends SceneTree\nfunc _initialize():\n\tvar x = 1 + \\\n\t\t2\n\tprint(x)\n\tquit()\n' },
  { id: "edge-mixed-indent", src: 'extends SceneTree\nfunc _initialize():\n    var x = 1\n    if x:\n        print(x)\n    quit()\n' },
  { id: "edge-tabs", src: 'extends SceneTree\nfunc _initialize():\n\tvar x = 1\n\tif x:\n\t\tprint(x)\n\tquit()\n' },
  { id: "edge-bom", src: '\uFEFFextends SceneTree\nfunc _initialize():\n\tprint(1)\n\tquit()\n' },
  { id: "edge-zero-width", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1)\u200B\n\tquit()\n' },
  { id: "edge-astral-column", src: 'extends SceneTree\nfunc _initialize():\n\tvar s = "\u{1F600}x"\n\tprint(s.length(), s)\n\tquit()\n' },
  { id: "edge-crlf", src: 'extends SceneTree\r\nfunc _initialize():\r\n\tprint(1)\r\n\tquit()\r\n' },
  { id: "edge-blank-lines", src: 'extends SceneTree\n\n\nfunc _initialize():\n\n\tprint(1)\n\n\tquit()\n' },
  { id: "edge-trailing-comment", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1)  # tail\n\tquit()\n# end\n' },
  { id: "edge-region", src: '#region head\nextends SceneTree\nfunc _initialize():\n\tprint(1)\n\tquit()\n#endregion\n' },
  { id: "edge-power", src: 'extends SceneTree\nfunc _initialize():\n\tprint(2 ** 3 ** 2)\n\tprint(-2 ** 2)\n\tprint(2 * -3 ** 2)\n\tprint(2 ** 3 ** 2 * 2)\n\tquit()\n' },
  { id: "edge-ternary", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1 if true else 2)\n\tprint(1 if false else 2 if true else 3)\n\tquit()\n' },
  { id: "edge-attribute-chain", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1 + self.a.b.c)\n\tprint(self.a.b(1).c[2].d)\n\tquit()\n' },
  { id: "edge-dict-array", src: 'extends SceneTree\nfunc _initialize():\n\tvar d = {"a": 1, "b": [1, 2, {"c": 3}]}\n\tvar e = {}\n\tvar f = []\n\tprint(d, e, f)\n\tquit()\n' },
  { id: "edge-match-full", src: 'extends SceneTree\nfunc _initialize():\n\tvar v = [1, 2]\n\tmatch v:\n\t\t[]:\n\t\t\tprint("empty")\n\t\t[1, _]:\n\t\t\tprint("pair")\n\t\t{"k": _} when v.size() > 1:\n\t\t\tprint("dict")\n\t\t1 | 2 | 3:\n\t\t\tprint("alts")\n\t\tvar x:\n\t\t\tprint(x)\n\t\t_:\n\t\t\tprint("wild")\n\tquit()\n' },
  { id: "edge-setget", src: 'extends Node\nvar a: int = 0:\n\tget:\n\t\treturn a\n\tset(v):\n\t\ta = v\nvar b: int = 0:\n\tget = get_b\n\tset = set_b\nfunc get_b() -> int: return b\nfunc set_b(v: int) -> void: b = v\n' },
  { id: "edge-enum", src: 'extends SceneTree\nenum Named { A, B, C }\nenum Anon { X = 1, Y }\nfunc _initialize():\n\tprint(Named.A, Anon.Y)\n\tquit()\n' },
  { id: "edge-inner-class", src: 'extends SceneTree\nclass Thing:\n\tvar v = 1\n\tfunc _init(x):\n\t\tv = x\nclass Outer:\n\tclass Inner:\n\t\tfunc f(): return 1\nfunc _initialize():\n\tprint(Thing.new(2).v)\n\tquit()\n' },
  { id: "edge-typed", src: 'extends SceneTree\nfunc f(a: int, b: String = "x", c := 1, d: Array[int] = []) -> Dictionary:\n\treturn {}\nfunc _initialize():\n\tprint(f(1))\n\tquit()\n' },
  { id: "edge-annotation", src: '@tool\nextends Node\n@warning_ignore("unused")\nvar v = 1\n@export var w: int = 2\n@onready var n = $Node\n' },
  { id: "edge-static", src: 'extends SceneTree\nstatic var sv = 1\nstatic func sf() -> int: return 2\nfunc _initialize():\n\tprint(sv, sf())\n\tquit()\n' },
  { id: "edge-string-forms", src: 'extends SceneTree\nfunc _initialize():\n\tprint("a\\nb")\n\tprint(\'c\\td\')\n\tprint("""multi\nline""")\n\tprint(r"raw\\n")\n\tquit()\n' },
  { id: "edge-escapes", src: 'extends SceneTree\nfunc _initialize():\n\tprint("\\u0041\\x42\\\\\\"\\\'")\n\tquit()\n' },
  { id: "edge-base-call", src: 'extends Node\nfunc _init():\n\tsuper()\n\tsuper._init()\n' },
  { id: "edge-await", src: 'extends SceneTree\nfunc f():\n\tawait create_timer(0.01).timeout\n\treturn 1\nfunc _initialize():\n\tvar r = await f()\n\tprint(r)\n\tquit()\n' },
  { id: "edge-augmented", src: 'extends SceneTree\nfunc _initialize():\n\tvar x = 1\n\tx += 1\n\tx -= 1\n\tx *= 2\n\tx /= 2\n\tx %= 2\n\tx **= 2\n\tx <<= 1\n\tx >>= 1\n\tx &= 1\n\tx |= 1\n\tx ^= 1\n\tprint(x)\n\tquit()\n' },
  { id: "edge-unary", src: 'extends SceneTree\nfunc _initialize():\n\tvar x = 1\n\tprint(-x, +x, ~x, not x, !x)\n\tquit()\n' },
  { id: "edge-precedence", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1 + 2 * 3 ** 2)\n\tprint(1 << 2 ** 2)\n\tprint(100 / 5 % 2 ** 3)\n\tprint(true and false or not true)\n\tprint(1 < 2 == true)\n\tprint(1 if 2 < 3 else 4)\n\tquit()\n' },
  { id: "edge-subscript", src: 'extends SceneTree\nfunc _initialize():\n\tvar a = [[1, 2], [3]]\n\tprint(a[0][1], a[0].size())\n\tvar d = {"k": {"j": 1}}\n\tprint(d["k"]["j"])\n\tquit()\n' },
  { id: "edge-signal", src: 'extends Node\nsignal hit\nsignal typed(a: int, b: String = "x")\nfunc _ready():\n\thit.connect(func(): pass)\n\thit.emit()\n' },
  { id: "edge-class-name", src: 'class_name Thing extends Node2D\nvar v = 1\nfunc f() -> void:\n\tv += 1\n' },
  { id: "edge-nested-subscript-type", src: 'extends SceneTree\nfunc f(a: Array[Dictionary], b: Dictionary) -> Array[int]:\n\treturn []\nfunc _initialize():\n\tprint(f([], {}))\n\tquit()\n' },
  { id: "edge-dollar-node", src: 'extends Node\nfunc _ready():\n\tvar a = $Child\n\tvar b = $Child/Grand\n\tvar c = get_node("Child")\n\tprint(a, b, c)\n' },
  { id: "edge-for-else-shapes", src: 'extends SceneTree\nfunc _initialize():\n\tfor i in range(3):\n\t\tprint(i)\n\tfor c in "ab":\n\t\tprint(c)\n\tvar d = {"k": 1}\n\tfor k in d:\n\t\tprint(k)\n\twhile false:\n\t\tbreak\n\tquit()\n' },
];

const MUTATE = [
  { id: "mut-match-no-colon", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1\n\t\t1:\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-match-subject-no-colon", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1 2:\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-match-empty-block", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\tquit()\n' },
  { id: "mut-arm-no-colon", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t1\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-arm-second-no-colon", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t1:\n\t\t\tprint("a")\n\t\t2\n\t\t\tprint("b")\n\tquit()\n' },
  { id: "mut-guard-empty", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t1 when:\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-arm-comma", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t1, 2:\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-arm-paren", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t(1:\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-wild-no-colon", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t_\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-get-no-colon", src: 'extends Node\nvar a = 0:\n\tget\n\t\treturn a\n' },
  { id: "mut-get-no-paren", src: 'extends Node\nvar a = 0:\n\tget:\n\t\treturn a\n\tset v:\n\t\ta = v\n' },
  { id: "mut-set-no-paren", src: 'extends Node\nvar a = 0:\n\tset:\n\t\ta = 1\n' },
  { id: "mut-getter-name", src: 'extends Node\nvar a = 0:\n\tget =\n\tset = \n' },
  { id: "mut-literal-call", src: 'extends SceneTree\nfunc _initialize():\n\t&"x".foo()\n\tquit()\n' },
  { id: "mut-continuation-op", src: 'extends SceneTree\nfunc _initialize():\n\tvar x = 1 +\n\t\t2\n\tprint(x)\n\tquit()\n' },
  { id: "mut-continuation-colon", src: 'extends SceneTree\nfunc _initialize()\n\tprint(1)\n\tquit()\n' },
  { id: "mut-empty-pattern", src: 'extends SceneTree\nfunc _initialize():\n\tmatch 1:\n\t\t:\n\t\t\tprint("a")\n\tquit()\n' },
  { id: "mut-property-block", src: 'extends Node\nvar a = 0:\n\tget:\n\t\treturn a\n\tvar b = 1\n' },
  { id: "mut-unclosed-paren", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1\n\tquit()\n' },
  { id: "mut-unclosed-string", src: 'extends SceneTree\nfunc _initialize():\n\tprint("abc\n\tquit()\n' },
  { id: "mut-bad-indent", src: 'extends SceneTree\nfunc _initialize():\n\tprint(1)\n\t\tquit()\n' },
  { id: "mut-dedent-mismatch", src: 'extends SceneTree\nfunc _initialize():\n\tif true:\n\t\tprint(1)\n\t print(2)\n\tquit()\n' },
  { id: "mut-toplevel-expr", src: 'extends SceneTree\nprint(1)\n' },
  { id: "mut-func-no-body", src: 'extends SceneTree\nfunc f():\n' },
  { id: "mut-if-no-block", src: 'extends SceneTree\nfunc _initialize():\n\tif true:\n\tquit()\n' },
];

function unescapeBody(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c !== "\\") {
      out += c;
      continue;
    }
    const n = raw[++i];
    if (n === undefined) break;
    switch (n) {
      case "n": out += "\n"; break;
      case "t": out += "\t"; break;
      case "r": out += "\r"; break;
      case "b": out += "\b"; break;
      case "f": out += "\f"; break;
      case "v": out += "\v"; break;
      case "0": out += "\0"; break;
      case "x": {
        const hex = raw.slice(i + 1, i + 3);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) { out += String.fromCharCode(Number.parseInt(hex, 16)); i += 2; }
        else out += "x";
        break;
      }
      case "u": {
        if (raw[i + 1] === "{") {
          const end = raw.indexOf("}", i + 2);
          const hex = end < 0 ? "" : raw.slice(i + 2, end);
          if (/^[0-9a-fA-F]+$/.test(hex)) { out += String.fromCodePoint(Number.parseInt(hex, 16)); i = end; }
          else out += "u";
        } else {
          const hex = raw.slice(i + 1, i + 5);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) { out += String.fromCharCode(Number.parseInt(hex, 16)); i += 4; }
          else out += "u";
        }
        break;
      }
      default: out += n; break;
    }
  }
  return out;
}

function harvest(text, quote, skipInterpolated) {
  const out = [];
  const re = new RegExp(`${quote}((?:[^${quote}\\\\]|\\\\.)*)${quote}`, "g");
  for (const m of text.matchAll(re)) {
    const raw = m[1];
    if (raw === undefined) continue;
    if (skipInterpolated && raw.includes("${")) continue;
    const src = unescapeBody(raw);
    if (!src.includes("\n")) continue;
    if (!GD_HINT.test(src)) continue;
    out.push(src);
  }
  return out;
}

const seen = new Map();
for (const name of readdirSync(TEST_DIR).filter((n) => n.endsWith(".test.ts")).sort()) {
  const text = readFileSync(join(TEST_DIR, name), "utf8");
  for (const s of [...harvest(text, '"', false), ...harvest(text, "'", false), ...harvest(text, "`", true)]) {
    const key = s.replace(/\r\n/g, "\n");
    if (!seen.has(key)) seen.set(key, name);
  }
}

const harvested = [...seen.entries()].map(([src, origin], i) => ({ id: `s${String(i).padStart(5, "0")}`, origin, src }));

mkdirSync(FIXTURES, { recursive: true });
mkdirSync(TMP, { recursive: true });

const write = (p, data) => writeFileSync(p, JSON.stringify(data, null, 1) + "\n", "utf8");

const edges = EDGE.map((e) => ({ ...e, origin: "edge" }));
write(join(FIXTURES, "parse-edges.json"), {
  note: "tools/collect-parse-snippets.mjs 生成，别手改：要加形状就改生成器里的 EDGE 段再重跑",
  count: edges.length,
  snippets: edges,
});

const malformed = [
  ...BAD_ELEVEN.map((id) => ({
    id: `bad-${id}`,
    origin: `corpus/cases/${id}/main.gd`,
    src: readFileSync(join(ROOT, "corpus", "cases", id, "main.gd"), "utf8"),
  })),
  ...MUTATE.map((m) => ({ ...m, origin: "mutation" })),
];
write(join(FIXTURES, "malformed-snippets.json"), {
  note: "tools/collect-parse-snippets.mjs 生成，别手改：bad-* 取自语料那 11 个 hasError 用例，mut-* 是手写变异段",
  count: malformed.length,
  snippets: malformed,
});

write(join(TMP, "parse-snippets.json"), {
  note: "现搭现弃：从 packages/compiler/test/*.test.ts 抠出来的内联 GDScript，parse-diff 门检测到它才跑；语料 .gd 由门直接读盘",
  count: harvested.length,
  snippets: harvested,
});

console.log(`edges ${String(edges.length)} + malformed ${String(malformed.length)} -> ${relative(ROOT, FIXTURES)}`);
console.log(`harvested ${String(harvested.length)} -> ${relative(ROOT, join(TMP, "parse-snippets.json"))}`);
