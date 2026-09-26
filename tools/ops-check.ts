/**
 * ops / fast 的自校验。期望值全部来自 corpus/cases 的 godot.txt（Godot 4.6.3 实测），
 * 不是我凭印象写的。跑：node_modules/.bin/tsx tools/ops-check.ts
 *
 * 注意：这不是差分测试台的替代 —— 它只校验运行时算子，
 * 真正的端到端对比要等 emitter 落地后由 tools/js-runner.mjs 驱动。
 */
import { GodotRuntimeError, UnsupportedError } from "../src/runtime/errors";
import { lengthOf, range, rangeSeq } from "../src/runtime/builtins";
import { fast } from "../src/runtime/fast";
import { md5Hex } from "../src/runtime/md5";
import { index, method } from "../src/runtime/methods";
import { isLess, ops, strOps } from "../src/runtime/ops";
import { Tag, V, type Variant } from "../src/runtime/tags";
import {
  GArray,
  GDict,
  keyOf,
  show,
  strCase,
  strFloat,
  strFormat,
  stringCtor,
  stringNameCtor,
  stringStatic,
  strVec2,
  truthyOf,
  valueEq,
} from "../src/runtime/values";
import { GVector2, vecCmp, vec2Index, vector2, vector2Const, vector2Method, vector2New } from "../src/runtime/vector2";

let pass = 0;
const fails: string[] = [];

function eq(caseId: string, what: string, actual: unknown, expected: unknown): void {
  if (String(actual) === String(expected)) {
    pass++;
    return;
  }
  fails.push(`${caseId}  ${what}：期望 ${String(expected)}，实得 ${String(actual)}`);
}

function shouldThrow(caseId: string, what: string, fn: () => unknown): void {
  try {
    const r = fn();
    fails.push(`${caseId}  ${what}：期望抛错，实得 ${String(r)}`);
  } catch (e) {
    if (e instanceof UnsupportedError || e instanceof GodotRuntimeError) pass++;
    else fails.push(`${caseId}  ${what}：抛了非预期错误 ${String(e)}`);
  }
}

const I = V.int;
const F = V.float;
const S = V.str;
const showOp = (v: { t: number; v: unknown }) => show(v as never);

// ---- 001 整数除法（向零截断）
eq("001", "5/2", show(ops.div(I(5), I(2))), "2");
eq("001", "-5/2", show(ops.div(I(-5), I(2))), "-2");
eq("001", "5/2.0", show(ops.div(I(5), F(2))), "2.5");
eq("001", "7.0/2", show(ops.div(F(7), I(2))), "3.5");
eq("001", "-7/2", show(ops.div(I(-7), I(2))), "-3");

// ---- 002 int/float 的 str 必须不同（S7）
eq("002", "str(1)", show(I(1)), "1");
eq("002", "str(1.0)", show(F(1)), "1.0");
eq("002", "str(2.5)", show(F(2.5)), "2.5");
eq("002", "float赋给int变量(3.9)", fast.intCast(3.9), 3);
eq("002", "float(7)/2", show(ops.div(F(7), I(2))), "3.5");

// ---- 003 取模符号跟被除数
eq("003", "-7%3", show(ops.mod(I(-7), I(3))), "-1");
eq("003", "7%-3", show(ops.mod(I(7), I(-3))), "1");
eq("003", "7%3", show(ops.mod(I(7), I(3))), "1");
shouldThrow("003", "7.5%3（float 取模，Godot 编译期就拒）", () => ops.mod(F(7.5), I(3)));

// ---- 004 ** 左结合（S4）
eq("004", "2**3**2", show(ops.pow(ops.pow(I(2), I(3)), I(2))), "64");
eq("004", "2**3", show(ops.pow(I(2), I(3))), "8");
eq("004", "2.0**0.5", show(ops.pow(F(2), F(0.5))), "1.4142135623731");

// ---- 005 / 006 / 016 int64：装箱轨走 BigInt，期望值取自这三个 case 的 godot.txt（Godot 实测）
eq("005", "int64max 原样表示", show(I(9223372036854775807n)), "9223372036854775807");
eq("005", "int64min 原样表示", show(I(-9223372036854775808n)), "-9223372036854775808");
eq("005", "int64max-1 加 1", show(ops.add(I(9223372036854775806n), I(1))), "9223372036854775807");
eq("006", "int64max 加 1 回绕成 int64min", show(ops.add(I(9223372036854775807n), I(1))), "-9223372036854775808");
eq(
  "006",
  "int64min 取负仍回绕成 int64min",
  show(ops.neg(ops.sub(ops.neg(I(9223372036854775807n)), I(1)))),
  "-9223372036854775808",
);
eq("016", "1<<62 精确不丢位", show(ops.shl(I(1), I(62))), "4611686018427387904");

// 归一化不变式：能安全用 number 表达的值绝不留 bigint —— 否则 1 与 1n 会裂成两个字典键、=== 也会分裂
eq("005", "2^53 内存 number", typeof I(1).v, "number");
eq("005", "超出才留 bigint", typeof I(9223372036854775807n).v, "bigint");
eq("005", "运算后落回 2^53 内自动降回 number", typeof ops.sub(I(9223372036854775807n), I(9223372036854775806n)).v, "number");

// 比较必须走 bigint：收成 number 会把 2^62 与 2^62+1 折成同一个 double（055 差分实测抓到过静默错）
eq("055", "2^62 < 2^62+1 精确成立", show(ops.lt(I(4611686018427387904n), I(4611686018427387905n))), "true");
eq("055", "2^62 与 2^62+1 不相等", show(ops.eq(I(4611686018427387904n), I(4611686018427387905n))), "false");
eq("055", "小 int 与 int64max 比较", show(ops.lt(I(1), I(9223372036854775807n))), "true");

// 解箱快路径的 2^53 边界是**有意保留**的响亮抛错（D1 修订版）：越界必须炸，不能静默回绕
shouldThrow("005", "裸 iAddC 越过 2^53 仍响亮抛错", () => fast.iAddC(9007199254740991, 1));

// ---- 数组下标：Godot 支持**负索引**（从尾部数），读写同规则；越界一律响亮报错、绝不扩数组。
// 期望值全部来自 056/057 的 godot.txt（含 a[-1]=9 → [1,2,9]、a[5]=9 → SCRIPT ERROR 两次探针）。
{
  const g = GArray.of([I(1), I(2), I(3)]);
  eq("056", "装箱 a[-1] 读末格", show(g.get(-1)), "3");
  eq("056", "装箱 a[-3] 读首格", show(g.get(-3)), "1");
  g.set(-1, I(9));
  eq("056", "装箱 a[-1]=9 写末格", show(V.array(g)), "[1, 2, 9]");
  g.set(-2, I(8));
  eq("056", "装箱 a[-2]=8 写倒数第二格", show(V.array(g)), "[1, 8, 9]");
  shouldThrow("056", "装箱读越界抛错", () => g.get(3));
  shouldThrow("056", "装箱负索引超出抛错", () => g.get(-4));
  shouldThrow("056", "装箱写越界抛错", () => g.set(5, I(0)));
  try {
    g.set(5, I(0));
  } catch {
    /* 预期抛错 */
  }
  // JS 原生 items[5]=v 会把数组撑到 6 格（Godot 是 SCRIPT ERROR）—— 这条钉住"没被撑长"。
  eq("056", "写越界被拒后数组长度不变", g.size(), 3);
}
{
  eq("057", "裸 a[-1] 读末格", fast.rawArrGet([1, 2, 3], -1), 3);
  shouldThrow("057", "裸 a[3] 读越界", () => fast.rawArrGet([1, 2, 3], 3));
  const r = [1, 2, 3];
  fast.rawArrSet(r, -1, 9);
  eq("057", "裸 a[-1]=9", JSON.stringify(r), "[1,2,9]");
  const r2 = [1, 2, 3];
  shouldThrow("057", "裸 a[5]=9 写越界", () => fast.rawArrSet(r2, 5, 9));
  eq("057", "裸写越界后没被撑长", r2.length, 3);
  eq("057", "裸 g[-1][-1] 两层负索引", fast.rawArrGet2([[1, 2], [3, 4]], -1, -1), 4);
  const gg: number[][] = [[1, 2], [3, 4]];
  fast.rawArrSet2(gg, -1, 0, 7);
  eq("057", "裸 g[-1][0]=7", JSON.stringify(gg), "[[1,2],[7,4]]");
  shouldThrow("057", "裸网格内层写越界", () => fast.rawArrSet2([[1, 2]], 0, 5, 0));
}

// ---- 061 字符串比较：Godot 按码点（UTF-32），JS 原生按 UTF-16 码元 → 代理对会判反方向。
// 期望值取自 061-string-order 的 godot.txt（String.chr(0x1F600) vs String.chr(0xFFFF) 探针实测）。
{
  const EMO = String.fromCodePoint(0x1f600);
  const S = (s: string) => V.str(s);
  eq("061", "😀 < U+FFFF 为 false", show(ops.lt(S(EMO), S("\uFFFF"))), "false");
  eq("061", "U+FFFF < 😀 为 true", show(ops.lt(S("\uFFFF"), S(EMO))), "true");
  eq("061", "😀 > U+FFFF 为 true", show(ops.gt(S(EMO), S("\uFFFF"))), "true");
  eq("061", "z < 😀 为 true", show(ops.lt(S("z"), S(EMO))), "true");
  // 无代理对的日常文本走原生快路，方向必须照旧
  eq("061", "快路 apple < z", show(ops.lt(S("apple"), S("z"))), "true");
  eq("061", "快路 前缀短者小", show(ops.lt(S("ab"), S("abc"))), "true");
  eq("061", "快路相等", show(ops.eq(S("abc"), S("abc"))), "true");
  const g = GArray.of([S(EMO), S("\uFFFF"), S("z"), S("apple")]);
  g.sort();
  eq(
    "061",
    "含 emoji 的字符串数组按码点排序",
    g.raw().map((v) => show(v)).join("|"),
    "apple|z|\uFFFF|" + EMO,
  );
}

// ---- 063 `%` 格式化：063 语料锁住"能格式化的"，这里锁住"必须响亮拒绝的"
{
  const F = (fmt: string, args: unknown[]) => strFormat(fmt, args as never);
  eq("063", "%f 默认 6 位小数", F("%f", [V.float(3.5)]), "3.500000");
  eq("063", "%d 收 float 向零截断", F("%d", [V.float(-3.7)]), "-3");
  eq("063", "%.0f 四舍五入远离零", F("%.0f", [V.float(2.5)]), "3");
  eq("063", "%% 出字面百分号", F("50%% of %d", [V.int(7)]), "50% of 7");
  eq("063", "%05d 负数符号在前", F("%05d", [V.int(-42)]), "-0042");
  eq("063", "%x 负数给符号加绝对值", F("%x", [V.int(-1)]), "-1");
  // Godot 对这些是 Parse Error: unsupported format character —— 我们运行期响亮抛，绝不原样留在输出里
  shouldThrow("063", "%i 不支持要抛", () => F("%i", [V.int(1)]));
  shouldThrow("063", "%e 不支持要抛", () => F("%e", [V.float(1)]));
  shouldThrow("063", "%g 不支持要抛", () => F("%g", [V.float(1)]));
  shouldThrow("063", "# 标志不支持要抛", () => F("%#x", [V.int(1)]));
  shouldThrow("063", "%d 收字符串要抛", () => F("%d", [V.str("abc")]));
  shouldThrow("063", "%f 收字符串要抛", () => F("%f", [V.str("abc")]));
  shouldThrow("063", "%x 收 float 未实测要抛", () => F("%x", [V.float(3.5)]));
  shouldThrow("063", "参数不足要抛", () => F("%d %d", [V.int(1)]));
  // Godot 的怪规则：实参多于转换符（数组右值）→ 原样返回格式串
  eq("063", "实参多余则原样返回格式串", F("%d", [V.int(1), V.int(2)]), "%d");
}

// ---- 064 浮点渲染的特殊值。inf/-inf/nan 钉在这里而不是语料里：
// 语料曾把 `var z=0.0; print(1.0/z); print(-1.0/z)` 两行跑出**符号互换**的 golden（两次都一致），
// 但同样的两行单独成文件时 Godot 给的是正确的 inf/-inf（我们的产物也逐字节一致），隔离复现不出那个
// 转置 —— 所以不拿它去改运行时，只把渲染本身按实测钉死。
eq("064", "inf 渲染", strFloat(Infinity), "inf");
eq("064", "-inf 渲染", strFloat(-Infinity), "-inf");
eq("064", "nan 渲染", strFloat(NaN), "nan");
eq("064", "溢出成 inf 后照渲染", strFloat(1e308 * 10), "inf");
eq("064", "1e21 精确展开", strFloat(1e21), "1000000000000000000000.0");
eq(
  "064",
  "1e300 按 Godot 取 17 位有效数字再展开（不是 double 的精确值）",
  strFloat(1e300),
  "10000000000000001" + "0".repeat(284) + ".0",
);

// ---- 066 Vector2 是 float32 存储 + 专用的 6 位小数打印（Godot real_t=float，探针实测）
{
  const v = new GVector2(1e15, 0.1);
  eq("066", "构造即落 float32（1e15）", v.x, 999999986991104);
  eq("066", "构造即落 float32（0.1）", v.y, Math.fround(0.1));
  eq("066", "float32 值单独打印走 15 位规则", strFloat(0.10000000149011612), "0.10000000149012");
  eq("066", "Vector2 分量打印是 6 位小数", strVec2(1.2345678806304932), "1.234568");
  eq("066", "1e-8 被 6 位小数吃成 0.0", strVec2(1e-8), "0.0");
  eq("066", "-0.0 打成 0.0", strVec2(-0), "0.0");
  eq("066", "整数分量补一位小数", strVec2(4), "4.0");
  eq("066", "大值不转科学计数法", strVec2(999999986991104), "999999986991104.0");
  eq("066", "Vector2 相等按 float32 分量", show(ops.eq(V.object(v), V.object(new GVector2(1e15, 0.1)))), "true");
}

// ---- 068 Vector2 成员面：每步都舍回 float32（不是"算完再舍"），逐条探针实测
{
  const m = (x: number, y: number) => (name: string, args: Variant[] = []) =>
    show(vector2Method(new GVector2(x, y), name, args));
  const a = m(3, 4);
  eq("068", "angle 是 float32 的 atan2", a("angle"), "0.92729520797729");
  eq("068", "dot 逐步 float32", m(0.1, 0.2)("dot", [vector2(0.1, 0.2)]), "0.05000000447035");
  eq("068", "normalized 零向量不给 nan", m(0, 0)("normalized"), "(0.0, 0.0)");
  eq("068", "normalized 大分量塌成 1.0", m(1e15, 1)("normalized"), "(1.0, 0.0)");
  eq("068", "round 半数远离零", m(2.5, -0.5)("round"), "(3.0, -1.0)");
  eq("068", "snapped = step*floor(v/step+0.5)", m(2.5, -0.5)("snapped", [vector2(1, 1)]), "(3.0, 0.0)");
  eq("068", "snapped 步长为 0 时原样返回", a("snapped", [vector2(0, 1)]), "(3.0, 4.0)");
  eq("068", "limit_length(0) 给零向量", a("limit_length", [F(0)]), "(0.0, 0.0)");
  eq("068", "orthogonal 是 (y, -x)", a("orthogonal"), "(4.0, -3.0)");
  eq("068", "aspect 0/0 是 nan", m(0, 0)("aspect"), "nan");
  eq("068", "逐分量乘", show(ops.mul(vector2(3, 4), vector2(-1, 2))), "(-3.0, 8.0)");
  eq("068", "逐分量除且不拦除零", show(ops.div(vector2(1, 1), vector2(0, 0))), "(inf, inf)");
  eq("068", "比较是字典序不是逐分量", show(ops.gt(vector2(3, 4), vector2(2, 5))), "true");
  eq("068", "下标读分量", show(vec2Index(new GVector2(3, 4), I(1))), "4.0");
  eq("068", "Vector2() 是零向量", show(vector2New([])), "(0.0, 0.0)");
  eq("068", "整数分量打印走 17 位展开", strVec2(Math.fround(1e20)), "100000002004087730000.0");
  eq("068", "舍到 0 的非零值保留负号", strVec2(-4e-7), "-0.0");
  shouldThrow("068", "下标越界", () => vec2Index(new GVector2(3, 4), I(2)));
  shouldThrow("068", "一个参数的 Vector2()", () => vector2New([I(1)]));
  shouldThrow("068", "Vector2.NAN 不存在", () => vector2Const("NAN"));
  shouldThrow("068", "slerp 未实现（语义没测准，宁缺毋猜）", () => a("slerp", [vector2(1, 2), F(0.5)]));
  shouldThrow("068", "is_normalized 未实现（容差没钉死）", () => a("is_normalized"));
}

// ---- 007 数组是共享引用，duplicate 才拷贝（S9）
{
  const a = GArray.of([I(1), I(2)]);
  const b = a;
  b.append(I(3));
  eq("007", "b.append 后 a 也变", show(V.array(a)), "[1, 2, 3]");
  const c = a.duplicate();
  c.append(I(9));
  eq("007", "duplicate 后 a 不受影响", show(V.array(a)), "[1, 2, 3]");
}

// ---- 009 深度比较（S10 / S11）
eq("009", "[1,2]==[1,2]", show(ops.eq(V.array(GArray.of([I(1), I(2)])), V.array(GArray.of([I(1), I(2)])))), "true");
{
  const d1 = new GDict();
  d1.set(S("a"), V.array(GArray.of([I(1)])));
  const d2 = new GDict();
  d2.set(S("a"), V.array(GArray.of([I(1)])));
  eq("009", "嵌套字典深度比较", show(ops.eq(V.dict(d1), V.dict(d2))), "true");
}
eq("009", "1.0==1", show(ops.eq(F(1), I(1))), "true");
eq("009", "1==1.0", show(ops.eq(I(1), F(1))), "true");

// ---- 010 truthiness：空容器 / 0 / "" 全为 false（S12）
eq("010", "not not []", ops.truthy(V.array(GArray.of([]))), false);
eq("010", "not not {}", ops.truthy(V.dict(new GDict())), false);
eq("010", "not not 0", ops.truthy(I(0)), false);
eq("010", "not not 0.0", ops.truthy(F(0)), false);
eq("010", "not not \"\"", ops.truthy(S("")), false);
eq("010", "not not [0]", ops.truthy(V.array(GArray.of([I(0)]))), true);
eq("010", "not not \"0\"", ops.truthy(S("0")), true);

// ---- 011 + 按类型分派（S13）
eq("011", "[1]+[2]", show(ops.add(V.array(GArray.of([I(1)])), V.array(GArray.of([I(2)])))), "[1, 2]");
eq("011", "\"a\"+\"b\"", show(ops.add(S("a"), S("b"))), "ab");
eq("011", "1+2.5", show(ops.add(I(1), F(2.5))), "3.5");
shouldThrow("011", "Vector2 相加（未实现，Tier 1 不做）", () => ops.add(F(1), S("x")));

// ---- 012 字典键必须区分 int / float / string（S14）
{
  const d = new GDict();
  d.set(I(1), S("int"));
  d.set(F(1), S("float"));
  eq("012", "1 和 1.0 是两个键", d.size(), 2);
  eq("012", "d[1]", show(d.get(I(1))), "int");
  eq("012", "d[1.0]", show(d.get(F(1))), "float");
  d.set(S("1"), S("str"));
  eq("012", "\"1\" 又是第三个键", d.size(), 3);
  eq("012", "字典打印", show(V.dict(d)), '{ 1: "int", 1.0: "float", "1": "str" }');
}

// ---- 016 位运算（int32 范围内）
eq("016", "255&15", show(ops.band(I(255), I(15))), "15");
eq("016", "~5", show(ops.bnot(I(5))), "-6");
eq("016", "8>>1", show(ops.shr(I(8), I(1))), "4");
eq("016", "6|9", show(ops.bor(I(6), I(9))), "15");
eq("016", "6^9", show(ops.bxor(I(6), I(9))), "15");
shouldThrow("016", "负操作数移位（Godot 编译期就拒）", () => ops.shr(I(-1), I(1)));

// ---- 017 浮点特殊值
eq("017", "str(0.0/0.0)", strOps.float(NaN), "nan");
eq("017", "1.0/0.0", strOps.float(Infinity), "inf");
eq("017", "-1.0/0.0", strOps.float(-Infinity), "-inf");
// 旧实现按 **14 位**有效数字，实测 Godot 是 **15 位** —— 下面三条都是先前会静默少一位的（064/探针实测）。
eq("064", "15 位有效数字", strFloat(1.2345678901234567), "1.23456789012346");
eq("064", "12345.678901234567", strFloat(12345.678901234567), "12345.6789012346");
eq("064", "小数位夹到 2 位", strFloat(1234567890123.45), "1234567890123.45");
// 整数值浮点走精确展开（实测 1e13/1e17/1e21/1e30 都是"数字全展开 + .0"）
eq("017", "1e30 整数值精确展开", strFloat(1e30), "1000000000000000000000000000000.0");

// ---- 018 String（UTF-32 语义 S26）
eq("018", "\"hello\"[0]", strOps.at("hello", 0), "h");
eq("018", "length()", strOps.length("hello"), 5);
eq("018", "substr(1,3)", strOps.substr("hello", 1, 3), "ell");
eq("018", "to_upper()", strCase("hello", "upper"), "HELLO");
eq("018", "\"%d/%s\"%[5,\"x\"]", strOps.format("%d/%s", [I(5), S("x")]), "5/x");
eq("018", "UTF-32 length（emoji 算 1 个码点）", strOps.length("a\u{1F600}"), 2);

// ---- 019 in
eq("019", "2 in [1,2]", show(ops.inOp(I(2), V.array(GArray.of([I(1), I(2)])))), "true");
eq("019", "\"e\" in \"hello\"", show(ops.inOp(S("e"), S("hello"))), "true");
eq("019", "9 in [1,2]", show(ops.inOp(I(9), V.array(GArray.of([I(1), I(2)])))), "false");
{
  const d = new GDict();
  d.set(S("k"), I(1));
  eq("019", "\"k\" in {\"k\":1}", show(ops.inOp(S("k"), V.dict(d))), "true");
}

// ---- fast.* 与 ops.* 必须一致（双轨不能分叉）
eq("fast", "iDiv 与 ops.div 一致", fast.iDiv(-7, 2), -3);
eq("fast", "iMod 与 ops.mod 一致", fast.iMod(-7, 3), -1);
eq("fast", "strInt vs strFloat", `${fast.strInt(1)}/${fast.strFloat(1)}`, "1/1.0");
eq("fast", "eqDeep 与 ops.eq 一致", fast.eqDeep(I(1), F(1)), true);
eq("fast", "truthyArr 与 ops.truthy 一致", fast.truthyArr(GArray.of([])), false);
shouldThrow("fast", "iDiv 除零", () => fast.iDiv(1, 0));

// ---- 070 Array 排序 / 检索族（期望值取自 070-array-ordering 的 godot.txt）
{
  const nums = GArray.of([I(3), F(1.5), I(1)]);
  nums.sort();
  eq("070", "int/float 混排按数值、各自保留原类型", show(V.array(nums)), "[1, 1.5, 3]");
  const bools = GArray.of([V.bool(true), V.bool(false), V.bool(true)]);
  bools.sort();
  eq("070", "纯 bool 可排且 false 在前", show(V.array(bools)), "[false, true, true]");
  const vecs = GArray.of([vector2(1, 2), vector2(0, 3)]);
  vecs.sort();
  eq("070", "Vector2 数组按字典序排", show(V.array(vecs)), "[(0.0, 3.0), (1.0, 2.0)]");
  const big = GArray.of([I(9007199254740993n), I(9007199254740992n), I(1)]);
  big.sort();
  eq("070", ">2^53 的 int 排序不被折成同值", show(V.array(big)), "[1, 9007199254740992, 9007199254740993]");
  const pair = (k: number, tag: string) => V.array(GArray.of([I(k), S(tag)]));
  const first = (v: Variant) => ((v.v as GArray).raw()[0] as Variant).v as number;
  const ties = GArray.of([pair(1, "a"), pair(2, "b"), pair(1, "c"), pair(2, "d"), pair(1, "e")]);
  ties.sortCustom((x, y) => first(x) < first(y));
  eq("070", "sort_custom 同键保持插入序", show(V.array(ties)), '[[1, "a"], [1, "c"], [1, "e"], [2, "b"], [2, "d"]]');
  const sorted = GArray.of([I(1), I(3), I(5)]);
  eq("070", "bsearch 命中给下标", sorted.bsearch(I(3), isLess), 1);
  eq("070", "bsearch 未命中给插入位置", sorted.bsearch(I(4), isLess), 2);
  const unsorted = GArray.of([I(3), I(1), I(2)]);
  eq("070", "bsearch 不检查有序、照二分走法给值", unsorted.bsearch(I(2), isLess), 2);
  eq("070", "bsearch 超出上界给 size", unsorted.bsearch(I(99), isLess), 3);
  eq("070", "find 用深度相等", GArray.of([pair(1, "a"), pair(3, "b")]).find(pair(3, "b")), 1);
  eq("070", "find 未命中给 -1", unsorted.find(I(9)), -1);
  eq("070", "count 数深度相等的个数", unsorted.count(I(3)), 1);
  eq("070", "min 走同一个比较口径", show(unsorted.extreme(true, isLess) as Variant), "1");
  eq("070", "空数组 extreme 给 null", GArray.of([]).extreme(true, isLess), null);
  shouldThrow("070", "混合类型排序仍然响亮报缺", () => GArray.of([I(1), S("a")]).sort());
  eq("070", "字典序比较不是逐分量", vecCmp(new GVector2(3, 4), new GVector2(2, 5)), 1);
}

// ---- 071 字典键的类型面（期望值取自 071-dict-key-types 的 godot.txt）
{
  eq("071", "int 1 与 float 1.0 是两个键", keyOf(I(1)) !== keyOf(F(1)), true);
  eq("071", "bool true 又是第三个键", keyOf(V.bool(true)) !== keyOf(I(1)), true);
  eq("071", "Vector2 按键值而非引用", keyOf(vector2(1, 2)) === keyOf(vector2(1.0, 2.0)), true);
  eq("071", "不同 Vector2 是不同键", keyOf(vector2(1, 2)) === keyOf(vector2(2, 1)), false);
  eq("071", "0.0 与 -0.0 是同一个键", keyOf(F(0)) === keyOf(F(-0)), true);
  const d = new GDict();
  d.set(I(1), S("a"));
  d.set(F(1), S("b"));
  eq("071", "1 与 1.0 各自存得住", `${show(d.get(I(1)))}/${show(d.get(F(1)))}/${d.size()}`, "a/b/2");
  shouldThrow("071", "数组不能当键", () => keyOf(V.array(GArray.of([]))));
}

// ---- 072 to_upper/to_lower 走简单映射：长度不变，且单码点答案以 Godot 实测表为准
// （表由 tools/case-probe.mjs + tools/golden.mjs 000-probe-cs + tools/case-table.mjs 生成）
{
  eq("072", "\u00DF 上档保持", strCase("\u00DF", "upper"), "\u00DF");
  eq("072", "\u00DF 下档保持", strCase("\u00DF", "lower"), "\u00DF");
  eq("072", "\uFB00 上档保持（旧实现响亮报缺）", strCase("\uFB00", "upper"), "\uFB00");
  eq("072", "\uFB01 上档保持（旧实现响亮报缺）", strCase("\uFB01", "upper"), "\uFB01");
  eq("072", "\uFB13 上档保持（亚美尼亚连字）", strCase("\uFB13", "upper"), "\uFB13");
  eq("072", "\u0130 下档给单个 i", strCase("\u0130", "lower"), "i");
  eq("072", "\u0130 上档保持", strCase("\u0130", "upper"), "\u0130");
  eq("072", "\u0131 上档给 I", strCase("\u0131", "upper"), "I");
  eq("072", "\u01F3 上档给单码点 \u01F1", strCase("\u01F3", "upper"), "\u01F1");
  eq("072", "\u01C5 上档给 \u01C4", strCase("\u01C5", "upper"), "\u01C4");
  eq("072", "\u0149 上档不被拆成 \u02BCN", strCase("\u0149", "upper"), "\u0149");
  eq("072", "\u0390 上档不被拆成 \u0399..", strCase("\u0390", "upper"), "\u0390");
  eq("072", "\u1FBC 下档给 \u1FB3", strCase("\u1FBC", "lower"), "\u1FB3");
  eq("072", "\uA7CE 下档不被 JS 改成 \uA7CF", strCase("\uA7CE", "lower"), "\uA7CE");
  eq("072", "\uA7CF 上档不被 JS 改成 \uA7CE", strCase("\uA7CF", "upper"), "\uA7CF");
  eq("072", "Bassa Vah 下档保持（JS 会互映射）", strCase("\u{16EA0}", "lower"), "\u{16EA0}");
  eq("072", "Bassa Vah 上档保持", strCase("\u{16EBB}", "upper"), "\u{16EBB}");
  eq("072", "Straße 上档只改日常字母", strCase("Stra\u00DFe", "upper"), "STRA\u00DFE");
  eq("072", "日常 ASCII 仍走 JS 单码点结果", strCase("hello", "upper"), "HELLO");
  eq("072", "无映射字符两边都保持", strCase("\u4E2D\u{1F600}", "upper"), "\u4E2D\u{1F600}");
}

// ---- 073/074 range 的参数归一（实测：float 向零截断、bool 当 0/1、截断后步长为 0 是运行错）
{
  const R = (...vs: Variant[]) => show(V.array(range(vs)));
  eq("073", "range(0.5, 2.5) 两端各截断", R(F(0.5), F(2.5)), "[0, 1]");
  eq("073", "range(2.5) 一个参数也截断", R(F(2.5)), "[0, 1]");
  eq("073", "range(0, 3.9) 截断 end", R(I(0), F(3.9)), "[0, 1, 2]");
  eq("073", "range(0, 3, 2.5) 截断 step", R(I(0), I(3), F(2.5)), "[0, 2]");
  eq("073", "range(0, 3, true) 把 bool 当 1", R(I(0), I(3), V.bool(true)), "[0, 1, 2]");
  eq("073", "range(-1.5, 1.5) 向零截断不是向下取整", R(F(-1.5), F(1.5)), "[-1, 0]");
  eq("073", "range(-2) 空数组", R(I(-2)), "[]");
  eq("073", "rangeSeq 与 range 同一条算式", rangeSeq([F(0.9), I(6), F(1.7)]).join(","), "0,1,2,3,4,5");
  shouldThrow("074", "步长截断成 0（0.999）", () => range([I(0), I(3), F(0.999)]));
  shouldThrow("074", "显式零步长", () => range([I(0), I(1), F(0.0)]));
  shouldThrow("074", "String 不能转 int", () => range([I(0), S("3")]));
  shouldThrow("074", "Vector2 不能当步长", () => range([I(0), I(3), vector2(1, 1)]));
}

// ---- 076 String 的静态成员（实测：参数向零截断；0/负数/代理区/越界一律换成 U+FFFD）
{
  const S = (v: Variant) => v.v as string;
  const str = (x: string) => V.str(x);
  const FF = String.fromCharCode(0xfffd);
  eq("076", "chr(65) 是 A", S(stringStatic("chr", [I(65)])), "A");
  eq("076", "chr(0x1F600) 是 emoji", S(stringStatic("chr", [I(0x1f600)])), "\u{1F600}");
  eq("076", "chr(0) 被换成 U+FFFD", S(stringStatic("chr", [I(0)])), FF);
  eq("076", "chr(-1) 被换成 U+FFFD", S(stringStatic("chr", [I(-1)])), FF);
  eq("076", "chr(0xD800) 代理区换 U+FFFD", S(stringStatic("chr", [I(0xd800)])), FF);
  eq("076", "chr(0x10FFFF) 还在上界内", S(stringStatic("chr", [I(0x10ffff)])), String.fromCodePoint(0x10ffff));
  eq("076", "chr 的 bigint 载荷越界换 U+FFFD", S(stringStatic("chr", [I(9007199254740993n)])), FF);
  eq("076", "chr(2.7) 向零截断", S(stringStatic("chr", [F(2.7)])), S(stringStatic("chr", [I(2)])));
  eq("076", "chr(true) 当 1", S(stringStatic("chr", [V.bool(true)])), S(stringStatic("chr", [I(1)])));
  eq("076", "num(42) 走浮点格式", S(stringStatic("num", [I(42)])), "42.0");
  eq("076", "num(-0.0) 保住符号（print 不给）", S(stringStatic("num", [F(-0)])), "-0.0");
  eq("076", "num(0.0) 仍是 0.0", S(stringStatic("num", [F(0)])), "0.0");
  eq("076", "num(1e20) 与 str 同路", S(stringStatic("num", [F(1e20)])), strFloat(1e20));
  eq("076", "num_int64 逐位精确", S(stringStatic("num_int64", [I(9007199254740993n)])), "9007199254740993");
  eq("076", "num_int64 也向零截断", S(stringStatic("num_int64", [F(1.7)])), "1");
  eq("076", "String 构造器原样返回", S(stringCtor([str("x")])), "x");
  shouldThrow("076", "chr 不接受 String 参数", () => stringStatic("chr", [str("65")]));
  shouldThrow("076", "num 不接受 String 参数", () => stringStatic("num", [str("1.5")]));
  shouldThrow("076", "没实现的静态成员要响", () => stringStatic("md5_text", [str("abc")]));
  shouldThrow("076", "没有 String(int) 构造器", () => stringCtor([I(1)]));
  shouldThrow("076", "String() 只接受一个参数", () => stringCtor([]));
}

// ---- 077 num_scientific 的临界与两位指数；md5 与 Godot/Node 三方对齐
{
  const SC = (n: number) => ((stringStatic("num_scientific", [F(n)]) as Variant).v as string);
  eq("077", "num_scientific(1e-7) 指数补两位", SC(1e-7), "1e-07");
  eq("077", "num_scientific(1e-5)", SC(1e-5), "1e-05");
  eq("077", "1e-4 还在普通区", SC(1e-4), "0.0001");
  eq("077", "1e14 用普通展开", SC(1e14), "100000000000000");
  eq("077", "1e15 起走科学计数法", SC(1e15), "1e+15");
  eq("077", "1e-20 两位以上指数原样", SC(1e-20), "1e-20");
  eq("077", "尾数是最短可回读", SC(9.9999999e-7), "9.9999999e-07");
  eq("077", "0 不给 .0", SC(0), "0");
  eq("077", "inf / nan 与 str 同名", `${SC(Infinity)}/${SC(NaN)}`, "inf/nan");
  eq("077", "int 实参先收数", (stringStatic("num_scientific", [I(42)]) as Variant).v, "42");
  eq("077", "md5 空串", md5Hex(""), "d41d8cd98f00b204e9800998ecf8427e");
  eq("077", "md5 abc", md5Hex("abc"), "900150983cd24fb0d6963f7d28e17f72");
  eq("077", "md5 走 UTF-8 字节", md5Hex("中文"), "a7bac2239fcdcb3a067903d8077c4a07");
  eq("077", "md5 64 字节分块边界", md5Hex("a".repeat(64)), "014842d480b571495a4a0363793f7367");
}

// ---- 078 humanize_size：档位停在「严格 > 1024」、小数位 2/1/0、按 uint64 解释参数
{
  const HZ = (v: Variant) => ((stringStatic("humanize_size", [v]) as Variant).v as string);
  eq("078", "0 给 0 B", HZ(I(0)), "0 B");
  eq("078", "1024 仍是整数档", HZ(I(1024)), "1024 B");
  eq("078", "1025 进 KiB 且截断", HZ(I(1025)), "1.00 KiB");
  eq("078", "1075 截成 1.04 不是 1.05", HZ(I(1075)), "1.04 KiB");
  eq("078", "102400 只留一位", HZ(I(102400)), "100.0 KiB");
  eq("078", "1048576 停在 KiB 档不留小数", HZ(I(1048576)), "1024 KiB");
  eq("078", "1048577 才升到 MiB", HZ(I(1048577)), "1.00 MiB");
  eq("078", "int64 上界给 8.00 EiB", HZ(I(9223372036854775807n)), "8.00 EiB");
  eq("078", "负数按 uint64 解释", HZ(I(-1024)), "16.00 EiB");
  shouldThrow("078", "humanize_size 缺参数要响", () => stringStatic("humanize_size", []));
}

// ---- 079 StringName：同值即同键、print 裸串、容器里带 &"…"，但它不是 String，且排序口径不可复刻
{
  const sn = (x: string) => V.stringName(x);
  eq("079", "print 是裸串", show(sn("abc")), "abc");
  eq("079", "装进数组要带 &\"…\"", show(V.array(GArray.of([sn("abc")]))), '[&"abc"]');
  {
    const d = new GDict();
    d.set(sn("k"), I(1));
    eq("079", "字典里的键带前缀", show(V.dict(d)), '{ &"k": 1 }');
    eq("079", "String 键能查到 StringName 键", show(d.get(S("k"))), "1");
  }
  eq("079", "键与等值 String 合一", keyOf(sn("k")) === keyOf(S("k")), true);
  eq("079", "与等值 String 相等", valueEq(sn("abc"), S("abc")), true);
  eq("079", "相等仍是大小写敏感", valueEq(sn("A"), sn("a")), false);
  eq("079", "空 StringName 为假", truthyOf(sn("")), false);
  eq("079", "len 同 String", show(lengthOf(sn("abc"))), "3");
  eq("079", "方法转发后拿到的是 String 而非 StringName", method(sn("abc"), "to_upper", []).t, Tag.STRING);
  eq("079", "混着加结果是 String", ops.add(sn("a"), S("b")).t, Tag.STRING);
  eq("079", "String(&\"k\") 降成 String", stringCtor([sn("k")]).t, Tag.STRING);
  shouldThrow("079", "StringName 不能下标（Godot: Invalid access to property or key）", () => index(sn("abc"), I(0)));
  shouldThrow("079", "StringName 与 String 混比大小（Godot 当场炸）", () => isLess(sn("a"), S("b")));
  shouldThrow("079", "两个 StringName 比大小也无口径（Godot 按内部指针序：&\"zzz\" < &\"abc\" 为真）", () =>
    isLess(sn("zzz"), sn("abc")),
  );
  shouldThrow("079", "StringName(42) 没有这个构造器", () => stringNameCtor([I(1)]));
}

// ---- 079 顺带钉住的 String 方法面：left/right/contains/is_empty/split/substr 的边界，期望值全取自 079 的 godot.txt
{
  const EMO = String.fromCodePoint(0x1f45d); // 💝 = String.chr(128157)
  const sm = (base: string, name: string, args: Variant[]) => method(S(base), name, args);
  const L = (n: number, base = "abc") => show(sm(base, "left", [I(n)]));
  const R = (n: number, base = "abc") => show(sm(base, "right", [I(n)]));
  const SP = (base: string, delim: string, allow?: Variant) =>
    show(sm(base, "split", allow === undefined ? [S(delim)] : [S(delim), allow]));
  eq("079", "left(2)", L(2), "ab");
  eq("079", "left(0) 空串", L(0), "");
  eq("079", "left 超界给整串", L(5), "abc");
  eq("079", "left(-1) 是各丢一个而非从尾部数", L(-1), "ab");
  eq("079", "left(-5) 夹成空", L(-5), "");
  eq("079", "right(2)", R(2), "bc");
  eq("079", "right(-1)", R(-1), "bc");
  eq("079", "right(-2)", R(-2), "c");
  eq("079", "left 按码点：emoji 不拦腰", L(1, `${EMO}xy`), EMO);
  eq("079", "contains 空针不算命中（JS 的 includes 会给 true）", show(sm("abc", "contains", [S("")])), "false");
  eq("079", "contains 命中", show(sm("abc", "contains", [S("bc")])), "true");
  eq("079", "contains 大小写敏感", show(sm("abc", "contains", [S("A")])), "false");
  eq("079", "is_empty 只对空串", `${show(sm("", "is_empty", []))}/${show(sm("a", "is_empty", []))}`, "true/false");
  eq("079", "substr 缺长度截到串尾", show(sm("abc", "substr", [I(2)])), "c");
  eq("079", "substr 负起点给空串（JS slice 会从尾部数）", show(sm("abc", "substr", [I(-2)])), "");
  eq("079", "substr 负长度截到串尾", show(sm("abc", "substr", [I(0), I(-1)])), "abc");
  eq("079", "substr 越界给空串", show(sm("abc", "substr", [I(5)])), "");
  eq("079", "split 保留空片段", SP("a,b,c", ","), '["a", "b", "c"]');
  eq("079", "split 中间的空串留着", SP("a,,b", ","), '["a", "", "b"]');
  eq("079", "split 末尾的空串也留着", SP("a,b,", ","), '["a", "b", ""]');
  eq("079", "split allow_empty=false 丢掉全部空片段", SP("a,,b", ",", V.bool(false)), '["a", "b"]');
  eq("079", "空串 split 出一个空片段", SP("", ","), '[""]');
  eq("079", "空串 split 空分隔符也是空片段", SP("", ""), '[""]');
  eq("079", "空分隔符逐码点切", SP("abc", ""), '["a", "b", "c"]');
  eq("079", "分隔符不命中给整串", SP("abc", "x"), '["abc"]');
  eq("079", "含 emoji 的串按码点切", SP(`${EMO}x${EMO}`, "x"), `["${EMO}", "${EMO}"]`);
  // 半个代理对当分隔符：Godot 的 UTF-32 里没有这个码点，整串原样返回；JS 原生 split 会把 emoji 截断
  eq("079", "孤立代理元分隔符不截断 emoji", SP(`${EMO}ab`, String.fromCharCode(0xd83d)), `["${EMO}ab"]`);
  shouldThrow("079", "split 的第 3 个参数 max_splits 口径没测清，报缺", () =>
    sm("a-b-c", "split", [S("-"), V.bool(false), I(2)]),
  );
}

console.log(`ops 自校验：通过 ${pass}，失败 ${fails.length}`);
if (fails.length > 0) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
