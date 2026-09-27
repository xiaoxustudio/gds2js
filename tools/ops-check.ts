/**
 * ops / fast 的自校验。期望值全部来自 corpus/cases 的 godot.txt（Godot 4.6.3 实测），
 * 不是我凭印象写的。跑：node_modules/.bin/tsx tools/ops-check.ts
 *
 * 注意：这不是差分测试台的替代 —— 它只校验运行时算子，
 * 真正的端到端对比要等 emitter 落地后由 tools/js-runner.mjs 驱动。
 */
import { GodotRuntimeError, UnsupportedError } from "../src/runtime/errors";
import { hashDjb2, lengthOf, range, rangeSeq, variantHash } from "../src/runtime/builtins";
import { fast } from "../src/runtime/fast";
import { parseGdDouble } from "../src/lower/double";
import { md5Hex } from "../src/runtime/md5";
import { callable } from "../src/runtime/object";
import { index, method, writeIdx, writeProp } from "../src/runtime/methods";
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
  strColor,
  strVec2,
  elemConvert,
  elemDefault,
  stampArray,
  stampDict,
  truthyOf,
  valueEq,
  valueSame,
} from "../src/runtime/values";
import {
  asColor,
  color,
  colorMethod,
  colorNew,
  colorRead,
  colorStatic,
  colorWrite,
  GColor,
} from "../src/runtime/color";
import { GVector2, vecCmp, vecReadIndex, vecWrite, vector2, vector2Const, vector2Method, vector2New } from "../src/runtime/vector2";
import {
  GVector3,
  asVec3,
  vec3Cmp,
  vec3ReadIndex,
  vec3Write,
  vector3,
  vector3Const,
  vector3Method,
  vector3New,
} from "../src/runtime/vector3";
import { isType, typeOf } from "../src/runtime/patterns";
import {
  GVector2i,
  asVec2i,
  vec2iReadIndex,
  vec2iWrite,
  vector2i,
  vector2iConst,
  vector2iMethod,
  vector2iNew,
} from "../src/runtime/vector2i";

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
  eq("068", "下标读分量", show(vecReadIndex(new GVector2(3, 4), I(1))), "4.0");
  eq("068", "Vector2() 是零向量", show(vector2New([])), "(0.0, 0.0)");
  eq("068", "整数分量打印走 17 位展开", strVec2(Math.fround(1e20)), "100000002004087730000.0");
  eq("068", "舍到 0 的非零值保留负号", strVec2(-4e-7), "-0.0");
  shouldThrow("068", "下标越界", () => vecReadIndex(new GVector2(3, 4), I(2)));
  shouldThrow("068", "一个参数的 Vector2()", () => vector2New([I(1)]));
  shouldThrow("068", "Vector2.NAN 不存在", () => vector2Const("NAN"));
  // step 41 把这三条从「报缺」变成了实测值（期望全部取自 093 的 golden）
  eq("093", "slerp 是极坐标插值", a("slerp", [vector2(1, 2), F(0.5)]), "(1.902113, 3.077683)");
  eq("093", "slerp 端点是零向量走 lerp", m(0, 0)("slerp", [vector2(1, 0), F(0.5)]), "(0.5, 0.0)");
  eq("093", "slerp 直角给对称结果", m(1, 0)("slerp", [vector2(0, 1), F(0.5)]), "(0.707107, 0.707107)");
  eq("093", "slerp 半圈绕 +90°（负号来自 fround(π/2)）", m(1, 0)("slerp", [vector2(-1, 0), F(0.5)]), "(-0.0, 1.0)");
  eq("093", "slerp 反向的 wrap 必须在 double 里做", m(1, 2)("slerp", [vector2(-1, -2), F(0.5)]), "(-2.0, 1.0)");
  eq("093", "slerp 长度也线性插值", m(2, 0)("slerp", [vector2(0, 3), F(0.25)]), "(2.078729, 0.861038)");
  eq(
    "093",
    "is_normalized 的阈值是 length_squared 上的 1e-3",
    `${m(0.9995, 0)("is_normalized")} ${m(0.9992, 0)("is_normalized")} ${m(0.7071, 0.7071)("is_normalized")} ${m(0, 0)("is_normalized")} ${a("is_normalized")}`,
    "true false true false false",
  );
  eq("093", "is_zero_approx 是逐分量 |v| < 1e-5", `${m(0, 0)("is_zero_approx")} ${m(0.000009, 0)("is_zero_approx")} ${m(0.00001, 0)("is_zero_approx")} ${m(0, -0.000009)("is_zero_approx")}`, "true true false true");
  eq(
    "093",
    "is_equal_approx 是 max(1e-5, 1e-5*|a|)",
    `${m(1, 2)("is_equal_approx", [vector2(1.0000095, 2)])} ${m(1, 2)("is_equal_approx", [vector2(1.00001, 2)])} ${m(3, 4)("is_equal_approx", [vector2(3.000029, 4)])} ${m(3, 4)("is_equal_approx", [vector2(3.000031, 4)])} ${m(0.001, 0)("is_equal_approx", [vector2(0.0010002, 0)])}`,
    "true false true false true",
  );
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
  eq("070", "find 用深度相等", GArray.of([pair(1, "a"), pair(3, "b")]).findSame(pair(3, "b")), 1);
  eq("070", "find 未命中给 -1", unsorted.findSame(I(9)), -1);
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
  // step 39 推翻了这条旧断言：容器实测**能**当键（090 实测），桶就是内容的结构编码
  eq("090", "数组键走 c: 内容桶", keyOf(V.array(GArray.of([I(1)]))), "c:[i:1]");
  eq("090", "空数组与空字典不是同一个桶", keyOf(V.array(GArray.of([]))) === keyOf(V.dict(new GDict())), false);
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
  // 第 3 参在 step 45 按 46 个实测点亮起来（口径见 099 那块），旧断言跟着换成值断言
  eq("079", "max_splits 现在给值、不再报缺", show(method(V.str("a,b,c"), "split", [V.str(","), V.bool(true), V.int(1)])), "[\"a\", \"b,c\"]");
}

// ---- 080/081 容器结构方法与「身份 vs ==」两套口径（期望值取自 080/081 的 godot.txt）
{
  const arrOf = (xs: Variant[]) => V.array(GArray.of(xs));
  const call = (v: Variant, name: string, args: Variant[] = []) => method(v, name, args);
  const N = V.nil();
  const B = (b: boolean) => V.bool(b);
  const vec = (x: number, y: number) => vector2(x, y);
  const dict = (pairs: [Variant, Variant][]) => {
    const g = new GDict();
    for (const [k, v] of pairs) g.set(k, v);
    return V.dict(g);
  };

  // insert：越界是静默不插入，但 at == size 恰好尾接；负数从尾部折算
  const ins = arrOf([I(1), I(2), I(3)]);
  call(ins, "insert", [I(0), I(9)]);
  eq("080", "insert(0) 插到最前", show(ins), "[9, 1, 2, 3]");
  call(ins, "insert", [I(2), I(8)]);
  eq("080", "insert(2) 插到中间", show(ins), "[9, 1, 8, 2, 3]");
  call(ins, "insert", [I(10), I(7)]);
  eq("080", "insert 越界静默不插入", show(ins), "[9, 1, 8, 2, 3]");
  call(ins, "insert", [I(6), I(7)]);
  eq("080", "insert 的 at 越过尾也不插入", show(ins), "[9, 1, 8, 2, 3]");
  call(ins, "insert", [I(5), I(7)]);
  eq("080", "insert(at == size) 尾接", show(ins), "[9, 1, 8, 2, 3, 7]");
  const neg = arrOf([I(1), I(2), I(3)]);
  call(neg, "insert", [I(-1), I(5)]);
  eq("080", "insert(-1) 从尾部折算", show(neg), "[1, 2, 5, 3]");
  call(neg, "insert", [I(-9), I(4)]);
  eq("080", "insert 负向越界也不插入", show(neg), "[1, 2, 5, 3]");
  const fresh = arrOf([]);
  call(fresh, "insert", [I(0), I(1)]);
  eq("080", "空数组 insert(0) 给一格", show(fresh), "[1]");

  // pop 族：越界给 null 而且不改数组
  const pp = arrOf([I(1), I(2), I(3)]);
  eq("080", "pop_front 给值并移除", show(call(pp, "pop_front")), "1");
  eq("080", "pop_back 给值并移除", show(call(pp, "pop_back")), "3");
  eq("080", "pop 之后剩中间那格", show(pp), "[2]");
  eq("080", "pop_at(5) 越界给 null", show(call(pp, "pop_at", [I(5)])), "<null>");
  eq("080", "pop_at 越界不改数组", show(pp), "[2]");
  eq("080", "pop_at(-9) 折算后仍越界给 null", show(call(pp, "pop_at", [I(-9)])), "<null>");
  const last = arrOf([I(1), I(2), I(3)]);
  eq("080", "pop_at(-1) 是最后一格", show(call(last, "pop_at", [I(-1)])), "3");
  eq("080", "pop_at(-1) 之后数组缩短", show(last), "[1, 2]");
  const empt = arrOf([]);
  eq("080", "空数组 pop_front 给 null", show(call(empt, "pop_front")), "<null>");
  eq("080", "空数组 pop_back 给 null", show(call(empt, "pop_back")), "<null>");
  eq("080", "空数组 pop_at 给 null", show(call(empt, "pop_at", [I(0)])), "<null>");

  // remove_at / erase / clear / reverse
  const rm = arrOf([I(1), I(2), I(3)]);
  call(rm, "remove_at", [I(0)]);
  eq("080", "remove_at(0)", show(rm), "[2, 3]");
  call(rm, "remove_at", [I(5)]);
  eq("080", "remove_at 越界静默无操作", show(rm), "[2, 3]");
  call(rm, "remove_at", [I(-1)]);
  eq("080", "remove_at(-1) 删最后一格", show(rm), "[2]");
  const er = arrOf([I(1), I(2), I(3), I(1)]);
  call(er, "erase", [I(2)]);
  eq("080", "erase 删掉第一个匹配", show(er), "[1, 3, 1]");
  call(er, "erase", [I(9)]);
  eq("080", "erase 没匹配就什么都不做", show(er), "[1, 3, 1]");
  call(er, "erase", [I(1)]);
  eq("080", "erase 只删第一个、不删全部", show(er), "[3, 1]");
  const erNest = arrOf([V.array(GArray.of([I(1), I(2)])), I(3)]);
  call(erNest, "erase", [V.array(GArray.of([I(1), I(2)]))]);
  eq("080", "erase 嵌套数组按值匹配", show(erNest), "[3]");
  const erMix = arrOf([F(1), I(1)]);
  call(erMix, "erase", [I(1)]);
  eq("080", "erase 用身份口径：1 不碰 1.0", show(erMix), "[1.0]");
  const rv = arrOf([I(1), I(2), I(3)]);
  call(rv, "reverse");
  eq("080", "reverse 原地反转", show(rv), "[3, 2, 1]");
  call(rv, "clear");
  eq("080", "clear 清空", `${show(rv)}/${show(call(rv, "is_empty"))}`, "[]/true");
  eq("080", "is_empty 对非空是 false", show(call(arrOf([I(1)]), "is_empty")), "false");

  // fill：所有格是同一个引用（实测改 src 会串进每一格）
  const fl = arrOf([I(1), I(2)]);
  const srcArr = arrOf([I(9)]);
  call(fl, "fill", [srcArr]);
  eq("080", "fill 填进去的是引用", show(fl), "[[9], [9]]");
  call(srcArr, "assign", [arrOf([I(5)])]);
  eq("080", "改源数组会串进每一格", show(fl), "[[5], [5]]");

  // slice：17 条实测边界
  const SL = (begin: number, end?: number, step?: number, deep?: boolean) =>
    show(
      call(
        arrOf([I(1), I(2), I(3), I(4), I(5)]),
        "slice",
        [
          I(begin),
          ...(end === undefined ? [] : [I(end)]),
          ...(step === undefined ? [] : [I(step)]),
          ...(deep === undefined ? [] : [B(deep)]),
        ],
      ),
    );
  eq("080", "slice(1,3)", SL(1, 3), "[2, 3]");
  eq("080", "slice(-2) 从尾部", SL(-2), "[4, 5]");
  eq("080", "slice(1) 缺 end 截到尾", SL(1), "[2, 3, 4, 5]");
  eq("080", "slice(0,10) 越界夹紧", SL(0, 10), "[1, 2, 3, 4, 5]");
  eq("080", "slice(3,1) 反向不给倒序", SL(3, 1), "[]");
  eq("080", "slice(0,0) 空", SL(0, 0), "[]");
  eq("080", "slice(-9) 起点夹到 0", SL(-9), "[1, 2, 3, 4, 5]");
  eq("080", "slice(-9,-6) 两头都夹", SL(-9, -6), "[]");
  eq("080", "显式 slice(2,-1) 是「末位前一格」为终点", SL(2, -1), "[3, 4]");
  eq("080", "slice(0,5,2) 步长", SL(0, 5, 2), "[1, 3, 5]");
  eq("080", "slice(1,4,3)", SL(1, 4, 3), "[2]");
  eq("080", "负步长方向不对给空", SL(0, 5, -1), "[]");
  eq("080", "slice(4,1,-1) 往回走", SL(4, 1, -1), "[5, 4, 3]");
  eq("080", "slice(-1,-6,-1) 走到下标 0 为止", SL(-1, -6, -1), "[5, 4, 3, 2, 1]");
  eq("080", "起点越界从末位开始", SL(9, 1, -1), "[5, 4, 3]");
  eq("080", "步长 0 实测给空数组", SL(0, 5, 0), "[]");
  const sh2 = arrOf([V.array(GArray.of([I(1)])), V.array(GArray.of([I(2)]))]);
  const cut = call(sh2, "slice", [I(0), I(2)]) as Variant;
  call(call(cut, "pop_front") as Variant, "erase", [I(1)]);
  eq("080", "slice 默认浅切：内层共享", show(sh2), "[[], [2]]");
  const sh3 = arrOf([V.array(GArray.of([I(1)])), V.array(GArray.of([I(2)]))]);
  const deepCut = call(sh3, "slice", [I(0), I(2), I(1), B(true)]) as Variant;
  call(deepCut, "assign", [arrOf([V.array(GArray.of([I(9)]))])]);
  eq("080", "slice(..., true) 深切：改不到原表", show(sh3), "[[1], [2]]");

  // duplicate / append_array / assign 的引用口径
  const dupSrc = arrOf([arrOf([I(1)])]);
  const shallowInner = call(call(dupSrc, "duplicate"), "pop_front") as Variant;
  call(shallowInner, "erase", [I(1)]);
  eq("080", "duplicate() 是浅拷贝：改副本的内层会串回原表", show(dupSrc), "[[]]");
  const dupSrc2 = arrOf([arrOf([I(1)])]);
  const deepInner = call(call(dupSrc2, "duplicate", [B(true)]), "pop_front") as Variant;
  call(deepInner, "erase", [I(1)]);
  eq("080", "duplicate(true) 断开内层", show(dupSrc2), "[[1]]");
  const ap = arrOf([I(1)]);
  const asrc = arrOf([arrOf([I(9)])]);
  call(ap, "append_array", [asrc]);
  call(asrc, "pop_back");
  eq("080", "append_array 之后动源数组的外层不影响 ap", show(ap), "[1, [9]]");
  const ap2 = arrOf([]);
  const asrc2 = arrOf([arrOf([I(9)])]);
  call(ap2, "append_array", [asrc2]);
  call(call(asrc2, "pop_back"), "erase", [I(9)]);
  eq("080", "append_array 接的是同一个内层引用", show(ap2), "[[]]");
  const asg = arrOf([I(1), I(2)]);
  const bsrc = arrOf([I(3)]);
  call(asg, "assign", [bsrc]);
  call(bsrc, "push_back", [I(9)]);
  eq("080", "assign 换整层但不共享外层结构", show(asg), "[3]");
  const asg2 = arrOf([]);
  const nsrc = arrOf([V.array(GArray.of([I(1)]))]);
  call(asg2, "assign", [nsrc]);
  call(call(nsrc, "pop_front"), "erase", [I(1)]);
  eq("080", "assign 的元素仍共享", show(asg2), "[[]]");

  // 身份 vs ==：has / find / rfind / count 用身份，运算符 == 用 valueEq
  const idn = arrOf([I(1), F(1), B(true), N, V.stringName("a")]);
  eq("080", "has 命中 int 1", show(call(idn, "has", [I(1)])), "true");
  eq("080", "has 命中 float 1.0", show(call(idn, "has", [F(1)])), "true");
  eq("080", "has 命中 true", show(call(idn, "has", [B(true)])), "true");
  eq("080", "has 命中 null", show(call(idn, "has", [N])), "true");
  eq("080", "StringName 与 String 身份合一", show(call(idn, "has", [S("a")])), "true");
  eq("080", "[1] 里没有 1.0（has 不看 ==）", show(call(arrOf([I(1)]), "has", [F(1)])), "false");
  eq("080", "[1] 里 find(1.0) 给 -1", show(call(arrOf([I(1)]), "find", [F(1)])), "-1");
  eq("080", "[1] 里 count(1.0) 给 0", show(call(arrOf([I(1)]), "count", [F(1)])), "0");
  eq("080", "[0] 里没有 false", show(call(arrOf([I(0)]), "has", [B(false)])), "false");
  eq("080", "[null] 里没有 0", show(call(arrOf([N]), "has", [I(0)])), "false");
  eq("080", "嵌套容器也按身份递归", show(call(arrOf([V.array(GArray.of([I(1)]))]), "has", [V.array(GArray.of([F(1)]))])), "false");
  eq("080", "字典身份不看键序", show(call(arrOf([dict([[S("x"), I(1)], [S("y"), I(2)]])]), "count", [dict([[S("y"), I(2)], [S("x"), I(1)]])])), "1");
  eq("080", "Vector2 按分量身份", show(call(arrOf([vec(1, 2)]), "count", [vec(1.0, 2.0)])), "1");
  eq("080", "1 == 1.0 运算符仍是真（口径不同）", show(ops.eq(I(1), F(1))), "true");

  // find 的 from 不折负数；rfind 先折算、折完仍越界才退回整段
  const fr = arrOf([I(1), I(2), I(1), I(2)]);
  eq("080", "find 默认从头", show(call(fr, "find", [I(1)])), "0");
  eq("080", "find(1,1) 从下标 1 往后", show(call(fr, "find", [I(1), I(1)])), "2");
  eq("080", "find 起点越过尾给 -1", show(call(fr, "find", [I(1), I(9)])), "-1");
  eq("080", "find 的负 from 不做尾部折算", show(call(fr, "find", [I(1), I(-1)])), "-1");
  eq("080", "rfind 默认从尾往回", show(call(fr, "rfind", [I(1)])), "2");
  eq("080", "rfind(1,0) 只看下标 0", show(call(fr, "rfind", [I(1), I(0)])), "0");
  eq("080", "rfind(1,1) 回看 1、0", show(call(fr, "rfind", [I(1), I(1)])), "0");
  eq("080", "rfind(1,-2) 折算到下标 2", show(call(fr, "rfind", [I(1), I(-2)])), "2");
  eq("080", "rfind(1,-4) 折算到 0", show(call(fr, "rfind", [I(1), I(-4)])), "0");
  eq("080", "rfind(1,-9) 折算仍越界 → 退回整段", show(call(fr, "rfind", [I(1), I(-9)])), "2");
  eq("080", "rfind 未命中给 -1", show(call(fr, "rfind", [I(9)])), "-1");
  const ru = arrOf([I(1)]);
  call(ru, "resize", [I(3)]);
  eq("080", "未定型数组 resize 填 null", show(ru), "[1, <null>, <null>]");

  // Dictionary：erase 返回 bool、merge 默认不覆盖、has_all/find_key/get 缺省
  const dm = new GDict();
  dm.set(S("a"), I(1));
  dm.set(S("b"), I(2));
  const dmv = V.dict(dm);
  eq("081", "erase 命中给 true", show(call(dmv, "erase", [S("a")])), "true");
  eq("081", "erase 之后只剩 b", show(dmv), '{ "b": 2 }');
  eq("081", "erase 没命中给 false", show(call(dmv, "erase", [S("zz")])), "false");
  eq("081", "erase 没命中不改内容", show(dmv), '{ "b": 2 }');
  const dc = dict([[I(1), I(2)]]);
  call(dc, "clear");
  eq("081", "clear 之后是空表", `${show(dc)}/${show(call(dc, "is_empty"))}/${show(call(dc, "size"))}`, "{  }/true/0");
  const mg = new GDict();
  mg.set(S("a"), I(1));
  const mgv = V.dict(mg);
  call(mgv, "merge", [dict([[S("a"), I(9)], [S("b"), I(2)]])]);
  eq("081", "merge 默认不覆盖已有键", show(mgv), '{ "a": 1, "b": 2 }');
  call(mgv, "merge", [dict([[S("a"), I(9)]]), B(true)]);
  eq("081", "merge(..., true) 才顶掉", show(mgv), '{ "a": 9, "b": 2 }');
  call(mgv, "merge", [V.dict(new GDict())]);
  eq("081", "merge 空表什么都不改", show(mgv), '{ "a": 9, "b": 2 }');
  const ha = dict([[S("a"), I(1)], [S("b"), I(2)]]);
  eq("081", "has_all 全中", show(call(ha, "has_all", [arrOf([S("a"), S("b")])])), "true");
  eq("081", "has_all 缺一个就 false", show(call(ha, "has_all", [arrOf([S("a"), S("z")])])), "false");
  eq("081", "has_all 空数组为真", show(call(ha, "has_all", [arrOf([])])), "true");
  const fk = dict([[S("a"), I(1)], [S("b"), I(2)]]);
  eq("081", "find_key 给键", show(call(fk, "find_key", [I(2)])), "b");
  eq("081", "find_key 未命中给 null", show(call(fk, "find_key", [I(99)])), "<null>");
  eq("081", "get 缺键给 null", show(call(fk, "get", [S("zz")])), "<null>");
  eq("081", "get 缺键带默认值给默认", show(call(fk, "get", [S("zz"), I(7)])), "7");
  eq("081", "get 命中给值", show(call(fk, "get", [S("a")])), "1");
  const dsrc = dict([[S("k"), arrOf([I(1)])]]);
  const dsh = call(dsrc, "duplicate") as Variant;
  call(dsh, "set", [S("k"), arrOf([I(9)])]);
  eq("081", "字典 duplicate() 浅：换整格不影响原表", show(dsrc), '{ "k": [1] }');
  const dsrc2 = dict([[S("k"), arrOf([I(1)])]]);
  const ddp = call(dsrc2, "duplicate", [B(true)]) as Variant;
  call(call(ddp, "get", [S("k")]), "push_back", [I(9)]);
  eq("081", "字典 duplicate(true) 深：内层断开", show(dsrc2), '{ "k": [1] }');
  const dasg = dict([[S("x"), I(1)]]);
  const dsrc3 = dict([[S("y"), I(2)]]);
  call(dasg, "assign", [dsrc3]);
  call(dsrc3, "set", [S("y"), I(9)]);
  eq("081", "字典 assign 换成实参的拷贝", show(dasg), '{ "y": 2 }');
  eq("081", "字典相等不看键序", show(ops.eq(dict([[S("x"), I(1)], [S("y"), I(2)]]), dict([[S("y"), I(2)], [S("x"), I(1)]]))), "true");
  const ko = new GDict();
  ko.set(S("b"), I(1));
  ko.set(S("a"), I(2));
  ko.set(S("b"), I(3));
  eq("081", "改已有键不挪位置", show(V.dict(ko)), '{ "b": 3, "a": 2 }');
  ko.erase(S("b"));
  ko.set(S("b"), I(4));
  eq("081", "erase 再插会排到末尾", show(V.dict(ko)), '{ "a": 2, "b": 4 }');
  eq("081", "erase 之后索引紧凑、旧键仍可查", `${show(ko.get(S("a")))}/${show(ko.get(S("b")))}`, "2/4");
  shouldThrow("081", "Dictionary.count() 不存在（实测 Nonexistent function）", () => call(ha, "count", [I(1)]));
  shouldThrow("081", "Dictionary.merge_recursive 不存在", () => call(mgv, "merge_recursive", [dsrc3]));
  shouldThrow("080", "Array.has_all 不存在（实测 Nonexistent function）", () => call(fr, "has_all", [arrOf([I(1)])]));
}

// ---- 082 Callable 参数族：短路、调用失败（实参个数对不上）的各家口径、reduce 的 acc 规则
{
  const arrOf = (xs: Variant[]) => V.array(GArray.of(xs));
  const call = (v: Variant, name: string, args: Variant[] = []) => method(v, name, args);
  const A = arrOf([I(1), I(2), I(3), I(4)]);
  // 声明 1 个形参的谓词 / 声明 2 个的比较器；JS 箭头函数的 length 就是 Godot 那份声明的实参个数
  const one = (f: (x: Variant) => boolean) => callable((x: Variant) => V.bool(f(x)));
  const two = (f: (a: Variant, b: Variant) => Variant) => callable((a: Variant, b: Variant) => f(a, b));
  const isGt2 = (x: Variant) => (x.v as number) > 2;

  eq("082", "filter 给新数组", show(call(A, "filter", [one(isGt2)])), "[3, 4]");
  eq("082", "filter 不改原数组", show(A), "[1, 2, 3, 4]");
  eq("082", "map 收的是返回值", show(call(A, "map", [one((x) => (x.v as number) % 2 === 0)])), "[false, true, false, true]");
  eq("082", "空数组 filter 给空", show(call(arrOf([]), "filter", [one(() => true)])), "[]");
  eq("082", "空数组 map 给空", show(call(arrOf([]), "map", [one(() => true)])), "[]");
  eq("082", "any 命中", show(call(A, "any", [one(isGt2)])), "true");
  eq("082", "all 全过", show(call(A, "all", [one((x) => (x.v as number) > 0)])), "true");
  eq("082", "all 有一个不过就 false", show(call(A, "all", [one(isGt2)])), "false");
  eq("082", "空数组 any 假", show(call(arrOf([]), "any", [one(() => true)])), "false");
  eq("082", "空数组 all 真", show(call(arrOf([]), "all", [one(() => false)])), "true");
  // 短路：数一下实际被调用过几次
  let hits = 0;
  call(A, "any", [one((x) => { hits++; return (x.v as number) > 2; })]);
  eq("082", "any 命中就停（1、2、3 三次）", hits, 3);
  hits = 0;
  call(A, "all", [one((x) => { hits++; return (x.v as number) > 2; })]);
  eq("082", "all 遇假就停（只调 1）", hits, 1);
  hits = 0;
  call(A, "filter", [one((x) => { hits++; return (x.v as number) > 2; })]);
  eq("082", "filter 不短路（四格全问）", hits, 4);
  eq("082", "find_custom 给下标", show(call(A, "find_custom", [one(isGt2)])), "2");
  eq("082", "find_custom 未命中 -1", show(call(A, "find_custom", [one((x) => (x.v as number) > 99)])), "-1");
  eq("082", "find_custom 的 from 不折负数", show(call(A, "find_custom", [one(isGt2), I(-1)])), "-1");
  eq("082", "find_custom 从 from 往后", show(call(A, "find_custom", [one((x) => (x.v as number) > 0), I(3)])), "3");
  eq("082", "rfind_custom 给下标", show(call(A, "rfind_custom", [one(isGt2)])), "3");
  eq("082", "rfind_custom(…, 0) 只看下标 0", show(call(A, "rfind_custom", [one(isGt2), I(0)])), "-1");
  eq("082", "rfind_custom 折算后越界退回整段", show(call(A, "rfind_custom", [one((x) => (x.v as number) === 1), I(-99)])), "0");
  eq("082", "reduce 带 acc 从下标 0 折", show(call(A, "reduce", [two((a, x) => V.int((a.v as number) + (x.v as number))), I(100)])), "110");
  eq("082", "reduce 省略 acc 拿首元素起折", show(call(arrOf([I(1), I(2), I(3)]), "reduce", [two((a, x) => V.int((a.v as number) * 10 + (x.v as number)))])), "123");
  eq("082", "reduce 单元素省略 acc", show(call(arrOf([I(5)]), "reduce", [two((a, x) => V.int((a.v as number) + (x.v as number)))])), "5");
  eq("082", "reduce 空数组带 acc 给 acc", show(call(arrOf([]), "reduce", [two((a) => a), I(5)])), "5");
  eq("082", "reduce 空数组省略 acc 给 null", show(call(arrOf([]), "reduce", [two((a) => a)])), "<null>");
  // 调用失败（实参个数对不上）：Godot 只打 stderr 诊断，各方法把「没有结果」解释成自己的口径
  // 声明 0 个形参：Godot 会判「实参个数对不上」，整次调用失败
  const wrongArity = callable(() => V.bool(true));
  eq("082", "map 遇到调用失败就不收这一格", show(call(A, "map", [wrongArity])), "[]");
  eq("082", "filter 遇到调用失败全丢", show(call(A, "filter", [wrongArity])), "[]");
  eq("082", "any 遇到调用失败给 false", show(call(A, "any", [wrongArity])), "false");
  eq("082", "all 遇到调用失败也给 false", show(call(A, "all", [wrongArity])), "false");
  eq("082", "find_custom 遇到调用失败给 -1", show(call(A, "find_custom", [wrongArity])), "-1");
  eq("082", "reduce 遇到调用失败整表给 null", show(call(A, "reduce", [wrongArity, I(0)])), "<null>");
  // 比较器同理：1 形参的 Callable 对 sort_custom 永远不成立 → 实测原序不动
  const unsorted = arrOf([I(2), I(1)]);
  call(unsorted, "sort_custom", [one(() => true)]);
  eq("082", "实参个数不对的比较器保持原序", show(unsorted), "[2, 1]");
  shouldThrow("082", "filter 的非 Callable 实参要响", () => call(A, "filter", [I(1)]));
}

// ---- 083 定型容器：元素类型跟着值走、转换矩阵、resize 默认值、检索先收本类型
{
  const call = (v: Variant, name: string, args: Variant[] = []) => method(v, name, args);
  const typed = (kind: string, xs: Variant[]) => stampArray(V.array(GArray.of(xs)), kind as never, true);
  const SHOW = (v: Variant | null) => (v === null ? "<reject>" : show(v));

  // 转换矩阵（null 表示 Godot 的 typed.validate 失败 → 整次操作作废）
  eq("083", "int ← float 向零截断", SHOW(elemConvert("int", F(2.9))), "2");
  eq("083", "int ← 负 float 也向零", SHOW(elemConvert("int", F(-1.9))), "-1");
  eq("083", "int ← 越界 float 饱和到 INT64_MIN", SHOW(elemConvert("int", F(1e20))), "-9223372036854775808");
  eq("083", "int ← bool", SHOW(elemConvert("int", V.bool(true))), "1");
  eq("083", "int ← String 拒绝", SHOW(elemConvert("int", S("3"))), "<reject>");
  eq("083", "int ← null 拒绝", SHOW(elemConvert("int", V.nil())), "<reject>");
  eq("083", "float ← int", SHOW(elemConvert("float", I(3))), "3.0");
  eq("083", "float ← bool", SHOW(elemConvert("float", V.bool(true))), "1.0");
  eq("083", "bool ← 0 / 2 / 2.5", [0, 2, 2.5].map((n) => SHOW(elemConvert("bool", n % 1 === 0 ? I(n) : F(n)))).join(","), "false,true,true");
  eq("083", "bool ← String 拒绝", SHOW(elemConvert("bool", S("x"))), "<reject>");
  eq("083", "String ← StringName", SHOW(elemConvert("String", V.stringName("x"))), "x");
  eq("083", "String ← int 拒绝", SHOW(elemConvert("String", I(3))), "<reject>");
  eq("083", "StringName ← String", (elemConvert("StringName", S("x")) as Variant).t, Tag.STRING_NAME);
  eq("083", "Vector2 ← int 拒绝", SHOW(elemConvert("Vector2", I(1))), "<reject>");
  eq("083", "Array ← Dictionary 拒绝", SHOW(elemConvert("Array", V.dict(new GDict()))), "<reject>");

  // resize 的填充值（实测 8 种）
  const defOf = (kind: string) => show(elemDefault(kind as never));
  eq("083", "int 默认 0", defOf("int"), "0");
  eq("083", "float 默认 0.0", defOf("float"), "0.0");
  eq("083", "bool 默认 false", defOf("bool"), "false");
  eq("083", "String 默认空串", "[" + defOf("String") + "]", "[]");
  eq("083", "StringName 默认 &\"\"", defOf("StringName"), "");
  eq("083", "Vector2 默认 (0.0, 0.0)", defOf("Vector2"), "(0.0, 0.0)");
  eq("083", "Array 默认 []", defOf("Array"), "[]");
  eq("083", "Dictionary 默认 {  }", defOf("Dictionary"), "{  }");

  // 装元素：能转就转、不能转就不进去
  const ai = typed("int", [I(1), F(2.5), V.bool(true)]);
  eq("083", "字面量初值逐格转换", show(ai), "[1, 2, 1]");
  call(ai, "append", [F(4.9)]);
  call(ai, "append", [S("s")]);
  call(ai, "append", [V.nil()]);
  eq("083", "append 被拒的元素不进去", show(ai), "[1, 2, 1, 4]");
  call(ai, "insert", [I(0), F(9.8)]);
  eq("083", "insert 也转换", show(ai), "[9, 1, 2, 1, 4]");
  call(ai, "insert", [I(0), S("x")]);
  eq("083", "insert 被拒时数组不动", show(ai), "[9, 1, 2, 1, 4]");
  call(ai, "fill", [F(5.7)]);
  eq("083", "fill 转换后填满", show(ai), "[5, 5, 5, 5, 5]");
  // 检索值先收成本类型（与未定型数组的 -1 形成对照，见 080）
  const q = typed("int", [I(1), I(2)]);
  eq("083", "定型数组 find(1.0) 命中", show(call(q, "find", [F(1)])), "0");
  eq("083", "定型数组 count(1.0) 计数", show(call(q, "count", [F(1)])), "1");
  eq("083", "定型数组 has(1.0) 为真", show(call(q, "has", [F(1)])), "true");
  eq("083", "未定型数组 find(1.0) 仍是 -1", show(call(V.array(GArray.of([I(1)])), "find", [F(1)])), "-1");
  eq("083", "定型数组 find(\"s\") 收不下 → -1", show(call(q, "find", [S("s")])), "-1");
  call(q, "erase", [F(2.5)]);
  eq("083", "erase 也先收成本类型", show(q), "[1]");
  // resize
  const rz = typed("int", [I(1)]);
  call(rz, "resize", [I(3)]);
  eq("083", "resize 扩张填类型默认值", show(rz), "[1, 0, 0]");
  call(rz, "resize", [I(1)]);
  eq("083", "resize 收缩是截断", show(rz), "[1]");
  const rzu = V.array(GArray.of([I(1)]));
  call(rzu, "resize", [I(3)]);
  eq("083", "未定型数组填 null", show(rzu), "[1, <null>, <null>]");
  // 传播：duplicate/slice/filter 保留定型，map 与 + 不保留
  const keepTyped = (v: Variant) => {
    call(v, "append", [S("s")]);
    return show(v);
  };
  eq("083", "duplicate 保留定型", keepTyped(call(typed("int", [I(1)]), "duplicate")), "[1]");
  eq("083", "slice 保留定型", keepTyped(call(typed("int", [I(1)]), "slice", [I(0), I(1)])), "[1]");
  eq("083", "filter 保留定型", keepTyped(call(typed("int", [I(1)]), "filter", [callable((x: Variant) => V.bool(true))])), "[1]");
  eq("083", "map 不保留定型", keepTyped(call(typed("int", [I(1)]), "map", [callable((x: Variant) => x)])), '[1, "s"]');
  eq("083", "+ 不保留定型", keepTyped(ops.add(typed("int", [I(1)]), V.array(GArray.of([I(2)])))), '[1, 2, "s"]');
  // append_array / assign 全有或全无
  const aa = typed("int", [I(0)]);
  call(aa, "append_array", [V.array(GArray.of([I(1), S("s")]))]);
  eq("083", "append_array 有一格不合格就整个不动", show(aa), "[0]");
  call(aa, "append_array", [V.array(GArray.of([F(1.5), F(2.5)]))]);
  eq("083", "append_array 全合格就逐格转换", show(aa), "[0, 1, 2]");
  const asrc = V.array(GArray.of([I(3)]));
  const ag = typed("int", [I(9)]);
  call(ag, "assign", [asrc]);
  call(asrc, "push_back", [I(7)]);
  eq("083", "assign 换整层但不共享外层", show(ag), "[3]");
  call(ag, "assign", [V.array(GArray.of([I(4), S("s")]))]);
  eq("083", "assign 也全有或全无", show(ag), "[3]");
  // 未定型数组赋给定型变量：Godot 是运行时报错（即使数组是空的）
  shouldThrow("083", "未定型数组不能当定型变量的初值", () => stampArray(V.array(GArray.of([])), "int", false));
  shouldThrow("083", "未定型字典同理", () => stampDict(V.dict(new GDict()), "String", "int", false));
  // 定型字典：键与值各自转换
  const dt = stampDict(V.dict(new GDict()), "String", "int", true);
  const dv = dt.v as GDict;
  dv.set(S("a"), F(1.9));
  eq("083", "字典值按 valKind 转换", show(dt), '{ "a": 1 }');
  dv.set(V.stringName("b"), I(2));
  eq("083", "字典键按 keyKind 收成 String", show(dt), '{ "a": 1, "b": 2 }');
  dv.set(I(3), I(3));
  eq("083", "键收不下就整次 set 作废", show(dt), '{ "a": 1, "b": 2 }');
  eq("083", "字典 has 先收键类型", show(dt.t === Tag.DICT ? method(dt, "has", [V.stringName("a")]) : V.nil()), "true");
  eq("083", "字典 get 收不下的键当不存在", show(method(dt, "get", [I(1)])), "<null>");
  eq("083", "find_key 先收值类型", show(method(dt, "find_key", [F(2.0)])), "b");
  // 空数组 insert(0) 等边界不受定型影响
  const freshT = typed("int", []);
  call(freshT, "insert", [I(0), I(1)]);
  eq("083", "空的定型数组 insert(0) 给一格", show(freshT), "[1]");
}

// ---- 087/088/089 Vector2 写语义：值类型写回、键型与值型口径、== 的操作数报错
{
  const V2 = (x: number, y: number) => vector2(x, y);
  const w = (v: Variant, key: Variant, value: Variant) => vecWrite(v.v as GVector2, key, value, "index");
  const p = (v: Variant, name: string, value: Variant) => writeProp(v, name, value) as Variant;
  const SHOW2 = (r: Variant | null) => (r === null ? "<原地>" : show(r));

  eq("087", "写 x 产出新值", SHOW2(p(V2(1, 2), "x", I(9))), "(9.0, 2.0)");
  eq("087", "写 y", SHOW2(p(V2(1, 2), "y", I(9))), "(1.0, 9.0)");
  eq("087", "下标写 0/1 都认", [SHOW2(w(V2(1, 2), I(0), I(7))), SHOW2(w(V2(1, 2), I(1), I(7)))].join(" "), "(7.0, 2.0) (1.0, 7.0)");
  eq("087", "字符串键 x/y 也认（实测 v[\"y\"] = 5 改的是 y）", SHOW2(w(V2(1, 2), S("y"), I(5))), "(1.0, 5.0)");
  eq("087", "StringName 键同样认", SHOW2(w(V2(1, 2), V.stringName("x"), I(5))), "(5.0, 2.0)");
  eq("087", "int 实参收成 float32", SHOW2(p(V2(1, 2), "x", I(3))), "(3.0, 2.0)");
  eq("087", "写入照旧过 float32", (w(V2(1, 2), I(0), F(0.1)).v as GVector2).x, Math.fround(0.1));
  eq("087", "1e20 落到 float32 的可表示值", show(w(V2(1, 2), I(0), F(1e20))), "(100000002004087730000.0, 2.0)");
  eq("087", "负值向零不是向下取整", show(w(V2(1, 2), I(0), F(-2.5))), "(-2.5, 2.0)");
  // 值类型：写不动别人
  {
    const v = V2(1, 2);
    const copy = p(v, "x", I(100)) as Variant;
    eq("087", "写回的新值不影响原值", `${show(v)} ${show(copy)}`, "(1.0, 2.0) (100.0, 2.0)");
  }
  // 报错口径（实测 088/089）：属性名不存在、下标越界、实参类型不对、跟非向量比 ==
  shouldThrow("088", "未知属性名要响", () => p(V2(1, 2), "zz", I(1)));
  shouldThrow("088", "bool 不能写进分量", () => p(V2(1, 2), "x", V.bool(true)));
  shouldThrow("088", "String 不能写进分量", () => p(V2(1, 2), "y", S("s")));
  shouldThrow("088", "Vector2 不能写进分量", () => p(V2(1, 2), "x", V2(1, 2)));
  shouldThrow("088", "null 不能写进分量", () => p(V2(1, 2), "x", V.nil()));
  shouldThrow("088", "下标 2 越界要响", () => w(V2(1, 2), I(2), I(9)));
  shouldThrow("088", "下标 -1 不做尾部折算", () => w(V2(1, 2), I(-1), I(9)));
  shouldThrow("088", "非向量基的属性写要响", () => writeProp(I(1), "x", I(2)));
  shouldThrow("089", "Vector2 == int 报错（不是给 false）", () => valueEq(V2(1, 2), I(3)));
  shouldThrow("089", "反过来也一样", () => valueEq(I(3), V2(1, 2)));
  shouldThrow("089", "Vector2 == String 报错", () => valueEq(V2(1, 2), S("x")));
  shouldThrow("089", "Vector2 == Array 报错", () => valueEq(V2(1, 2), V.array(GArray.of([]))));
  shouldThrow("089", "ops.eq 同样要响", () => ops.eq(V2(1, 2), F(1)));
  eq("089", "跟 null 比仍然是 false", `${valueEq(V2(1, 2), V.nil())}/${valueEq(V.nil(), V2(1, 2))}`, "false/false");
  eq("087", "Vector2 之间按分量比", `${valueEq(V2(1, 2), V2(1.0, 2.0))}/${valueEq(V2(1, 2), V2(1, 3))}`, "true/false");
  // 读侧：0/1/"x"/"y" 都能读，越界报实测那句
  eq("087", "读 v[0]", show(vecReadIndex(vector2(1, 2).v as GVector2, I(1))), "2.0");
  eq("087", "读 v[\"x\"]", show(vecReadIndex(vector2(1, 2).v as GVector2, S("x"))), "1.0");
  shouldThrow("087", "读越界下标要响", () => vecReadIndex(vector2(1, 2).v as GVector2, I(2)));
  // writeIdx：容器走原地（返回 null），Vector2 走写回
  {
    const arr = V.array(GArray.of([I(1), I(2)]));
    eq("087", "数组下标写是原地改", SHOW2(writeIdx(arr, I(0), I(9))), "<原地>");
    eq("087", "数组那一格真的变了", show(arr), "[9, 2]");
    const dict = new GDict();
    dict.set(S("k"), I(1));
    const dv = V.dict(dict);
    eq("087", "字典同理", SHOW2(writeIdx(dv, S("k"), I(2))), "<原地>");
    eq("087", "字典那一格改了", show(dv), '{ "k": 2 }');
    eq("087", "Vector2 的下标写回报新值", SHOW2(writeIdx(V2(1, 2), I(1), I(8))), "(1.0, 8.0)");
  }
}

{
  // ---- step 39：容器当字典键（090 实测）。桶按内容算，并且**冻在插入那一刻**。
  const arr = (xs: Variant[]) => V.array(GArray.of(xs));
  const newDict = () => new GDict();
  const dict = (pairs: [Variant, Variant][]) => {
    const g = newDict();
    for (const [k, v] of pairs) g.set(k, v);
    return V.dict(g);
  };

  eq("090", "等值数组落进同一个桶", keyOf(arr([I(1), I(2)])) === keyOf(arr([I(1), I(2)])), "true");
  eq("090", "[1] 与 [1.0] 是两个桶（身份口径）", keyOf(arr([I(1)])) === keyOf(arr([F(1)])), "false");

  const g1 = newDict();
  const a1 = arr([I(1), I(2)]);
  g1.set(a1, I(5));
  eq("090", "等值新数组命中同一格", show(g1.get(arr([I(1), I(2)]))), "5");
  eq("090", "has 走同一格", `${String(g1.has(a1))}/${String(g1.has(arr([I(1), I(2)])))}`, "true/true");
  eq("090", "掺 float 的查询落空", show(g1.get(arr([F(1), F(2)]))), "<null>");
  g1.set(arr([I(1), I(2)]), I(6));
  eq("090", "等值键再写是顶掉同一格", `${String(g1.size())} ${show(V.dict(g1))}`, "1 { [1, 2]: 6 }");

  // 实测 q3：`{"a":1,"b":2}` 与 `{"b":2,"a":1}` 是两个格，尽管它们 `==` 成立 —— 键序进桶
  const od = newDict();
  od.set(dict([[S("a"), I(1)], [S("b"), I(2)]]), I(9));
  eq("090", "换了键序就查不着", show(od.get(dict([[S("b"), I(2)], [S("a"), I(1)]]))), "<null>");
  eq("090", "原序才命中", show(od.get(dict([[S("a"), I(1)], [S("b"), I(2)]]))), "9");

  // ghost：键改过之后这一格从所有查询里消失，但打印仍是存着的那个值（实测 q4/r4/s5）
  const gd = newDict();
  const m1 = arr([I(1)]);
  gd.set(m1, I(8));
  (m1.v as GArray).append(I(2));
  eq("090", "改过的键现值旧值都查不着", `${String(gd.has(arr([I(1)])))}/${String(gd.has(arr([I(1), I(2)])))}`, "false/false");
  eq("090", "改过的键也擦不掉", `${String(gd.erase(arr([I(1)])))}/${String(gd.size())}`, "false/1");
  eq("090", "打印取存着的值而不是重新查", show(V.dict(gd)), "{ [1, 2]: 8 }");

  // 同一个桶底下能并存两格（实测 r5）
  const c1 = arr([I(7), I(8)]);
  const s2 = newDict();
  s2.set(c1, I(1));
  (c1.v as GArray).append(I(9));
  s2.set(arr([I(7), I(8)]), I(2));
  eq("090", "同桶两格并存", `${String(s2.size())} ${show(V.dict(s2))}`, "2 { [7, 8, 9]: 1, [7, 8]: 2 }");
  eq("090", "新格查得着、ghost 格查不着", `${show(s2.get(arr([I(7), I(8)])))}/${show(s2.get(c1))}`, "2/<null>");
  eq("090", "erase 只擦得掉查得着的那格", `${String(s2.erase(arr([I(7), I(8)])))}/${String(s2.erase(c1))}/${String(s2.size())}`, "true/false/1");

  // 浅拷贝照抄冻结的桶（s1），深拷贝按新内容重算（t3）
  const sh = newDict();
  const kk = arr([I(1), I(2)]);
  sh.set(kk, I(1));
  const cp = sh.duplicate();
  (kk.v as GArray).append(I(3));
  eq(
    "090",
    "浅拷贝不重算桶",
    `${show(cp.get(arr([I(1), I(2)])))}/${show(cp.get(arr([I(1), I(2), I(3)])))}/${show(V.dict(cp))}`,
    "<null>/<null>/{ [1, 2, 3]: 1 }",
  );
  const dp = sh.duplicate(true);
  eq("090", "深拷贝按现内容重算", `${show(dp.get(arr([I(1), I(2), I(3)])))}/${show(dp.get(arr([I(1), I(2)])))}`, "1/<null>");

  // merge 搬的是存着的值（实测 u1/u2），不是按现值重查
  const src = newDict();
  const sk = arr([I(1), I(2)]);
  src.set(sk, I(1));
  (sk.v as GArray).append(I(3));
  const mg = newDict();
  mg.mergeWith(src, false);
  eq("090", "ghost 格也 merge 得过去", `${show(V.dict(mg))}/${show(mg.get(arr([I(1), I(2), I(3)])))}`, "{ [1, 2, 3]: 1 }/1");

  // Vector2 键：值类型，写不坏（实测 k5/q7）
  const vd = newDict();
  vd.set(vector2(1, 2), I(1));
  vd.set(vector2(1, 2), I(2));
  eq("090", "等值 Vector2 顶掉同一格", `${String(vd.size())} ${show(V.dict(vd))}`, "1 { (1.0, 2.0): 2 }");
  eq("090", "换成分量就不是那个键了", `${String(vd.has(vector2(9, 2)))}/${show(vd.get(vector2(1.0, 2.0)))}`, "false/2");

  // 空容器键（实测 k8）
  const ed = newDict();
  ed.set(arr([]), I(1));
  ed.set(dict([]), I(2));
  eq("090", "空数组与空字典是两格", `${show(ed.get(arr([])))}/${show(ed.get(dict([])))}/${show(V.dict(ed))}`, "1/2/{ []: 1, {  }: 2 }");

  // 定型字典的容器键（实测 q5：Dictionary[Array,int] 里 [1,2] 命中、[1.0,2.0] 不命中）
  const tg = (stampDict(dict([]), "Array", "int", true).v as GDict);
  tg.set(arr([I(1), I(2)]), I(5));
  eq("090", "定型 Array 键按身份查", `${show(tg.get(arr([I(1), I(2)])))}/${show(tg.get(arr([F(1), F(2)])))}`, "5/<null>");

  // 嵌套容器键：改内层同样把它变成 ghost（实测 r8）
  const inner = arr([I(1)]);
  const nd = newDict();
  nd.set(arr([inner]), I(8));
  (inner.v as GArray).append(I(2));
  eq("090", "改内层让整格查不着", `${show(nd.get(arr([arr([I(1)])])))}/${show(V.dict(nd))}`, "<null>/{ [[1, 2]]: 8 }");

  // 自引用容器当键：step 47 起按实测的**两道闸门**走 —— 桶塌在 101 层（旧断言要求"响亮报缺"，
  // 是那时还没有闸门口径；现在真值说了算，改断言不改实现）
  const cyc = GArray.of([]);
  cyc.append(V.array(cyc));
  eq("090", "自引用数组的桶塌在 101 层（3×101 + 记号 + 101）", String(keyOf(V.array(cyc)).length), "405");
  {
    const other = GArray.of([]);
    other.append(V.array(other));
    eq("090", "两个不同的环算出同一个桶", String(keyOf(V.array(other)) === keyOf(V.array(cyc))), "true");
    const dd = newDict();
    dd.set(V.array(cyc), I(1));
    eq("090", "环键存得下也查得着", `${dd.size()}/${dd.has(V.array(other))}`, "1/true");
  }
  eq("090", "自引用数组跟自己比是 true", valueEq(V.array(cyc), V.array(cyc)), "true");
}


{
  // ---- step 40：Vector3（091 / 092 实测）。分量 float32、写它产出新值、打印走短格式。
  const V3 = (x: number, y: number, z: number) => vector3(x, y, z);
  const m3 = (v: Variant, name: string, ...args: Variant[]) => vector3Method(asVec3(v) as GVector3, name, args);
  const vv = (n: Variant) => show(n);

  eq("091", "构造与拷贝", `${vv(V3(1, 2, 3))}/${vv(vector3New([]))}/${vv(vector3New([V3(1, 2, 3)]))}`, "(1.0, 2.0, 3.0)/(0.0, 0.0, 0.0)/(1.0, 2.0, 3.0)");
  eq("091", "打印是短格式", vv(V3(0.1, 0, 0)), "(0.1, 0.0, 0.0)");
  shouldThrow("091", "单参数值不是构造器（实测 Parse Error）", () => vector3New([F(1.5)]));
  shouldThrow("091", "两参也不行", () => vector3New([F(1), F(2)]));
  eq("091", "x 给 fround 后的真值", vv(vec3ReadIndex(asVec3(V3(0.1, 0, 0)) as GVector3, I(0))), "0.10000000149012");
  eq("091", "读 0/1/2 与 x/y/z 同一路", `${vv(vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, I(2)))}/${vv(vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, S("y")))}`, "3.0/2.0");
  shouldThrow("092", "下标 3 越界要响", () => vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, I(3)));
  shouldThrow("092", "负下标不折算", () => vec3ReadIndex(asVec3(V3(1, 2, 3)) as GVector3, I(-1)));

  eq("091", "加减与标量乘除", `${vv(ops.add(V3(1, 2, 3), V3(0.5, 0, 0)))}/${vv(ops.sub(V3(1, 2, 3), V3(1, 1, 1)))}/${vv(ops.mul(V3(1, 2, 3), F(2.5)))}/${vv(ops.div(V3(2, 3, 4), F(2)))}`, "(1.5, 2.0, 3.0)/(0.0, 1.0, 2.0)/(2.5, 5.0, 7.5)/(1.0, 1.5, 2.0)");
  eq("091", "向量乘除是逐分量", `${vv(ops.mul(V3(2, 3, 4), V3(0.5, 1, 2)))}/${vv(ops.div(V3(2, 3, 4), V3(2, 3, 4)))}/${vv(ops.neg(V3(1, 2, 3)))}`, "(1.0, 3.0, 8.0)/(1.0, 1.0, 1.0)/(-1.0, -2.0, -3.0)");
  shouldThrow("091", "Vector3 + 标量 不接（Godot 那边是解析期报错）", () => ops.add(V3(1, 2, 3), I(1)));
  eq("091", "比较按 x→y→z 字典序", `${ops.lt(V3(1, 2, 3), V3(1, 2, 4)).v}/${ops.lt(V3(1, 3, 0), V3(2, 0, 0)).v}/${ops.lt(V3(0, 1, 9), V3(0, 2, 0)).v}/${ops.gte(V3(1, 2, 3), V3(1, 2, 4)).v}/${vec3Cmp(asVec3(V3(1, 2, 3)) as GVector3, asVec3(V3(1, 2, 3)) as GVector3)}`, "true/true/true/false/0");
  eq("091", "== 是 fround 后的分量比较", `${valueEq(V3(1, 2, 3), V3(1, 2, 3.0000001))}/${valueEq(V3(0.1 + 0.2, 0, 0), V3(0.3, 0, 0))}/${valueEq(V3(1, 2, 3), V3(1, 2, 4))}`, "true/true/false");
  eq("091", "跟 null 比是 false", `${valueEq(V3(1, 2, 3), V.nil())}/${!valueEq(V3(1, 2, 3), V.nil())}`, "false/true");
  shouldThrow("092", "Vector3 == Vector2 要响", () => valueEq(V3(1, 2, 3), vector2(1, 2)));
  shouldThrow("092", "反过来也响", () => valueEq(vector2(1, 2), V3(1, 2, 3)));
  shouldThrow("092", "Vector3 == int 要响（Godot 那边是解析期拦）", () => valueEq(V3(1, 2, 3), I(3)));

  eq("091", "写分量产出新值", `${vv(vec3Write(asVec3(V3(1, 2, 3)) as GVector3, I(2), I(8), "index"))}/${vv(vec3Write(asVec3(V3(1, 2, 3)) as GVector3, S("z"), F(1), "index"))}`, "(1.0, 2.0, 8.0)/(1.0, 2.0, 1.0)");
  shouldThrow("092", "未知属性名要响", () => vec3Write(asVec3(V3(1, 2, 3)) as GVector3, S("zz"), I(8), "prop"));
  shouldThrow("092", "越界下标写要响", () => vec3Write(asVec3(V3(1, 2, 3)) as GVector3, I(3), I(8), "index"));

  eq("091", "静态常量表", `${vv(vector3Const("UP"))}/${vv(vector3Const("DOWN"))}/${vv(vector3Const("FORWARD"))}/${vv(vector3Const("BACK"))}/${vv(vector3Const("LEFT"))}/${vv(vector3Const("INF"))}`, "(0.0, 1.0, 0.0)/(0.0, -1.0, 0.0)/(0.0, 0.0, -1.0)/(0.0, 0.0, 1.0)/(-1.0, 0.0, 0.0)/(inf, inf, inf)");
  shouldThrow("091", "Vector3.MAX 实测不存在", () => vector3Const("MAX"));

  eq("091", "length / length_squared / dot / cross", `${vv(m3(V3(3, 4, 0), "length"))}/${vv(m3(V3(3, 4, 0), "length_squared"))}/${vv(m3(V3(1, 0, 0), "dot", V3(0, 1, 0)))}/${vv(m3(V3(1, 2, 3), "cross", V3(0, 1, 0)))}`, "5.0/25.0/0.0/(-3.0, 0.0, 1.0)");
  eq("091", "归一化与限长", `${vv(m3(V3(3, 4, 0), "normalized"))}/${vv(m3(V3(0, 0, 0), "normalized"))}/${vv(m3(V3(1, 2, 3), "limit_length", F(1)))}/${vv(m3(V3(0.1, 0.2, 0.3), "limit_length", F(10)))}`, "(0.6, 0.8, 0.0)/(0.0, 0.0, 0.0)/(0.267261, 0.534522, 0.801784)/(0.1, 0.2, 0.3)");
  eq("091", "lerp / distance / direction", `${vv(m3(V3(1, 2, 3), "lerp", V3(2, 3, 4), F(0.5)))}/${vv(m3(V3(1, 2, 3), "distance_to", V3(1, 2, 4)))}/${vv(m3(V3(1, 2, 3), "distance_squared_to", V3(1, 2, 4)))}/${vv(m3(V3(1, 2, 3), "direction_to", V3(1, 2, 4)))}`, "(1.5, 2.5, 3.5)/1.0/1.0/(0.0, 0.0, 1.0)");
  eq("091", "abs / sign / floor / ceil / round", `${vv(m3(V3(-1.5, 2, -3), "abs"))}/${vv(m3(V3(-1.5, 0, 3), "sign"))}/${vv(m3(V3(1.7, -1.2, 0.5), "floor"))}/${vv(m3(V3(1.7, -1.2, 0.5), "ceil"))}/${vv(m3(V3(-1.5, -2.5, 3.5), "round"))}`, "(1.5, 2.0, 3.0)/(-1.0, 0.0, 1.0)/(1.0, -2.0, 0.0)/(2.0, -1.0, 1.0)/(-2.0, -3.0, 4.0)");
  eq("091", "snapped 与 snappedf", `${vv(m3(V3(1.2, 2.6, 3.1), "snapped", V3(0.5, 0.5, 0.5)))}/${vv(m3(V3(1.4, 2.6, 3.1), "snappedf", F(1)))}/${vv(m3(V3(1, 2, 3), "snapped", vector3Const("INF")))}`, "(1.0, 2.5, 3.0)/(1.0, 3.0, 3.0)/(nan, nan, nan)");
  eq("091", "clamp / min / max", `${vv(m3(V3(1, 2, 3), "clamp", V3(1.5, 1.5, 1.5), V3(2.5, 2.5, 2.5)))}/${vv(m3(V3(1, 2, 3), "min", V3(2, 1, 5)))}/${vv(m3(V3(1, 2, 3), "max", V3(2, 1, 5)))}`, "(1.5, 2.0, 2.5)/(1.0, 1.0, 3.0)/(2.0, 2.0, 5.0)");
  eq("091", "angle_to 是 atan2(|cross|, dot)", vv(m3(V3(0, 1, 0), "angle_to", V3(1, 0, 0))), "1.57079637050629");
  eq("091", "cubic_interpolate 是 Catmull-Rom", vv(m3(V3(1, 2, 3), "cubic_interpolate", V3(2, 2, 2), V3(3, 3, 3), V3(4, 4, 4), F(0.5))), "(1.25, 1.8125, 2.375)");
  eq("091", "轴下标 X=0 / Y=1 / Z=2", `${vv(m3(V3(1, 2, 3), "min_axis_index"))}${vv(m3(V3(1, 2, 3), "max_axis_index"))}/${vv(m3(V3(5, 3, 4), "min_axis_index"))}${vv(m3(V3(5, 3, 4), "max_axis_index"))}`, "02/10");
  eq(
    "091",
    "is_equal_approx：阈值 max(1e-5, 1e-5*|a|)",
    `${m3(V3(1, 2, 3), "is_equal_approx", V3(1.0000095, 2, 3)).v}/${m3(V3(1, 2, 3), "is_equal_approx", V3(1.00001, 2, 3)).v}/${m3(V3(3, 4, 5), "is_equal_approx", V3(3.000029, 4, 5)).v}/${m3(V3(3, 4, 5), "is_equal_approx", V3(3.000031, 4, 5)).v}/${m3(V3(0.001, 0, 0), "is_equal_approx", V3(0.0010002, 0, 0)).v}`,
    "true/false/true/false/true",
  );
  eq("091", "is_normalized / is_finite", `${m3(V3(1, 1, 1), "is_normalized").v}/${m3(V3(1, 0, 0), "is_normalized").v}/${m3(V3(0.7071067811865475, 0.7071067811865475, 0), "is_normalized").v}/${m3(V3(1e300, 0, 0), "is_finite").v}/${m3(V3(1, 2, 3), "is_finite").v}`, "false/true/true/false/true");

  // 探针**没能**钉死语义的（reflect 六个点互相矛盾、bounce/slide 要求单位法向且会往 stderr 打一行、
  // slerp 末位不足信、is_zero_approx / clampf 没测）与实测不存在的成员，全都必须响
  for (const n of ["reflect", "bounce", "slide"]) {
    shouldThrow("091", `Vector3.${n}() 未实现要响`, () => m3(V3(1, 2, 3), n, V3(0, 1, 0)));
  }
  // step 41 解锁的三条（期望取自 093 的 golden）
  eq("093", "Vector3.clampf 与 clamp 同值", `${vv(m3(V3(1, 2, 3), "clampf", F(1.5), F(2.5)))}/${vv(m3(V3(3, 2, 1), "clampf", F(1.5), F(2.5)))}/${vv(m3(V3(-1, 2, 5), "clampf", F(0), F(1)))}`, "(1.5, 2.0, 2.5)/(2.5, 2.0, 1.5)/(0.0, 1.0, 1.0)");
  eq("093", "Vector3.is_zero_approx", `${m3(V3(0, 0, 0), "is_zero_approx").v}/${m3(V3(0.000009, 0, 0), "is_zero_approx").v}/${m3(V3(0.00001, 0, 0), "is_zero_approx").v}/${m3(V3(0, 0, -0.00002), "is_zero_approx").v}`, "true/true/false/false");
  eq("093", "Vector3.is_normalized 用 1e-3（用 1e-5 会把 0.9995 判错）", `${m3(V3(0.9995, 0, 0), "is_normalized").v}/${m3(V3(0.9992, 0, 0), "is_normalized").v}/${m3(V3(0.5774, 0.5774, 0.5774), "is_normalized").v}/${m3(V3(1, 1, 0.045), "is_normalized").v}`, "true/false/true/false");
  eq(
    "093",
    "Vector3.slerp：权重留 double、求和后落一次 float32",
    `${vv(m3(V3(3, 4, 0), "slerp", V3(0, 5, 0), F(0.5)))}/${vv(m3(V3(1, 2, 3), "slerp", V3(4, 5, 6), F(0.3)))}/${vv(m3(V3(1, 2, 3), "slerp", V3(-1, -2, -3), F(0.5)))}/${vv(m3(V3(0, 0, 0), "slerp", V3(1, 0, 0), F(0.5)))}`,
    "(1.581139, 4.743417, 0.0)/(1.710528, 2.878237, 4.045945)/(0.0, 0.0, 0.0)/(0.5, 0.0, 0.0)",
  );
  for (const n of ["nlerp", "from_size", "lerpf", "angle_to_signed", "orthogonal", "to_float32", "to_double", "to_int8_array"]) {
    shouldThrow("091", `实测不存在的 Vector3.${n} 要响`, () => m3(V3(1, 2, 3), n));
  }

  eq("091", "typeof 给 9、is 只认 Vector3", `${typeOf(V3(1, 2, 3)).v}/${isType(V3(1, 2, 3), "Vector3").v}/${isType(V3(1, 2, 3), "Vector2").v}`, "9/true/false");
  eq("091", "定型数组的默认值", vv(elemDefault("Vector3")), "(0.0, 0.0, 0.0)");
  eq("091", "Vector3 键与 Vector2 键不同桶", keyOf(V3(1, 2, 3)) === keyOf(vector2(1, 2)), false);
  {
    const g = GArray.of([V3(3, 1, 0), V3(1, 2, 3), V3(2, 0, 0)]);
    g.sort();
    eq("091", "sort 走字典序", show(V.array(g)), "[(1.0, 2.0, 3.0), (2.0, 0.0, 0.0), (3.0, 1.0, 0.0)]");
    eq("091", "has / count 按分量身份", `${g.has(V3(3, 1, 0))}/${g.count(V3(1.0, 2.0, 3.0))}`, "true/1");
  }
}



{
  // ---- step 42：Vector2i（094 / 095 实测）。int32 值类型：构造与写入截断、算完回绕、length_squared 走 int64。
  const Z = (x: number | bigint, y: number | bigint) => vector2i(x, y);
  const zm = (v: Variant, name: string, ...args: Variant[]) => vector2iMethod(asVec2i(v) as GVector2i, name, args);
  const zs = (n: Variant) => show(n);

  eq("094", "构造、拷贝与从 Vector2 升级", `${zs(vector2iNew([]))}/${zs(Z(-1.7, -2.2))}/${zs(vector2iNew([Z(1, 2)]))}/${zs(vector2iNew([vector2(1.7, 2.2)]))}`, "(0, 0)/(-1, -2)/(1, 2)/(1, 2)");
  eq("094", "Vector2 也能吃 Vector2i", zs(vector2New([Z(1, 2)])), "(1.0, 2.0)");
  eq("094", "打印是整数、分量读出来是 int", `${zs(Z(1, 2))}/${zs(vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, S("y")))}`, "(1, 2)/2");
  shouldThrow("095", "下标 5 越界要响", () => vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, I(5)));
  shouldThrow("095", "负下标不折算", () => vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, I(-1)));
  shouldThrow("095", "未知键要响", () => vec2iReadIndex(asVec2i(Z(1, 2)) as GVector2i, S("z")));
  shouldThrow("095", "写 bool 要响", () => vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), V.bool(true), "prop"));

  eq("094", "写入向零截断、超界回绕", `${zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), F(2.7), "prop"))}/${zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, I(1), F(-0.9), "index"))}/${zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), I(2147483648), "prop"))}`, "(2, 2)/(1, 0)/(-2147483648, 2)");
  eq("094", "int64 载荷也要回绕", zs(vec2iWrite(asVec2i(Z(1, 2)) as GVector2i, S("x"), I(9007199254740993n), "prop")), "(1, 2)");

  eq("094", "加减乘逐分量且回绕 int32", `${zs(ops.add(Z(2147483647, 0), Z(1, 0)))}/${zs(ops.sub(Z(-2147483648, 5), Z(1, 0)))}/${zs(ops.mul(Z(2147483647, 0), I(2)))}/${zs(ops.neg(Z(-2147483648, 0)))}`, "(-2147483648, 0)/(2147483647, 5)/(-2, 0)/(-2147483648, 0)");
  eq("094", "除与模向零截断、符号跟被除数", `${zs(ops.div(Z(7, -7), Z(2, 2)))}/${zs(ops.mod(Z(-7, 7), Z(2, -2)))}/${zs(ops.div(Z(1, 2), Z(2, 2)))}/${zs(ops.mod(Z(7, 7), I(2)))}`, "(3, -3)/(-1, 1)/(0, 1)/(1, 1)");
  eq("094", "掺 float 标量升级成 Vector2", `${zs(ops.mul(Z(6, 6), F(0.5)))}/${zs(ops.div(Z(6, 6), F(4.0)))}/${show(ops.mul(Z(6, 6), F(0.5)))}`, "(3.0, 3.0)/(1.5, 1.5)/(3.0, 3.0)");
  shouldThrow("095", "Vector2i / 0 要响", () => ops.div(Z(7, 7), I(0)));
  shouldThrow("095", "Vector2i % 0 要响", () => ops.mod(Z(7, 7), I(0)));
  shouldThrow("094", "Vector2i + 标量不接（实测解析期报错）", () => ops.add(Z(1, 2), I(1)));
  shouldThrow("094", "Vector2i + Vector2 不接（实测解析期报错）", () => ops.add(Z(1, 2), vector2(1, 1)));
  eq("094", "比较是字典序", `${ops.lt(Z(1, 2), Z(1, 3)).v}/${ops.lt(Z(1, 2), Z(0, 9)).v}/${ops.gt(Z(1, 2), Z(0, 9)).v}/${ops.lte(Z(1, 2), Z(1, 2)).v}`, "true/false/true/true");
  eq("094", "== 按分量、实参先截断", `${valueEq(Z(1, 2), Z(1.0, 2.0))}/${valueEq(Z(1, 2), Z(1.7, 2))}/${valueEq(Z(1, 2), Z(1, 3))}`, "true/true/false");
  eq("094", "跟 null 比是 false、跟 Vector2 混比要响", `${valueEq(Z(1, 2), V.nil())}/${!valueEq(Z(1, 2), V.nil())}`, "false/true");
  shouldThrow("094", "Vector2i == Vector2 要响", () => valueEq(Z(1, 2), vector2(1, 2)));
  shouldThrow("094", "Vector2i == int 要响", () => valueEq(Z(1, 2), I(1)));

  eq("094", "length 是 double、length_squared 走精确 int64", `${zs(zm(Z(3, -4), "length"))}/${zs(zm(Z(2147483647, 1), "length_squared"))}/${zs(zm(Z(3, -4), "distance_squared_to", Z(0, 0)))}/${zs(zm(Z(7, 3), "distance_squared_to", Z(0, 0)))}`, "5.0/4611686014132420610/25/58");
  eq("094", "aspect 是 double 除法", `${zs(zm(Z(3, 4), "aspect"))}/${zs(zm(Z(0, 4), "aspect"))}/${zs(zm(Z(3, 0), "aspect"))}/${zs(zm(Z(0, 0), "aspect"))}`, "0.75/0.0/inf/nan");
  eq("094", "abs / sign / min / max / clamp", `${zs(zm(Z(3, -4), "abs"))}/${zs(zm(Z(3, -4), "sign"))}/${zs(zm(Z(3, -4), "min", Z(1, 9)))}/${zs(zm(Z(3, -4), "max", Z(1, 9)))}/${zs(zm(Z(7, 3), "clamp", Z(1, 1), Z(4, 4)))}`, "(3, 4)/(1, -1)/(1, -4)/(3, 9)/(4, 3)");
  eq("094", "MIN 的 abs 与负号都回绕", `${zs(zm(Z(-2147483648, 0), "abs"))}/${zs(zm(Z(-2147483648, 0), "sign"))}`, "(-2147483648, 0)/(-1, 0)");
  eq("094", "snapped 与 step 0", `${zs(zm(Z(7, 3), "snapped", Z(2, 2)))}/${zs(zm(Z(-7, 3), "snapped", Z(2, 2)))}/${zs(zm(Z(-7, 3), "snapped", Z(0, 1)))}`, "(8, 4)/(-6, 4)/(-7, 3)");
  eq("094", "distance_to / 轴下标", `${zs(zm(Z(7, 3), "distance_to", Z(0, 0)))}/${zs(zm(Z(7, 3), "min_axis_index"))}${zs(zm(Z(7, 3), "max_axis_index"))}`, "7.61577310586391/10");
  eq("094", "常量表含 MAX/MIN、没有 INF", `${zs(vector2iConst("ONE"))}/${zs(vector2iConst("UP"))}/${zs(vector2iConst("DOWN"))}/${zs(vector2iConst("MAX"))}/${zs(vector2iConst("MIN"))}`, "(1, 1)/(0, -1)/(0, 1)/(2147483647, 2147483647)/(-2147483648, -2147483648)");
  shouldThrow("094", "Vector2i.INF 实测不存在", () => vector2iConst("INF"));

  // 实测**不存在**的成员（别按 Vector2/Vector3 的表照抄）
  for (const n of ["is_normalized", "is_equal_approx", "normalized", "direction_to", "move_toward", "floor", "ceil", "round", "clampf", "snappedf", "ceildiv", "floordiv", "posmod", "signwrapping"]) {
    shouldThrow("094", `Vector2i.${n}() 实测不存在要响`, () => zm(Z(1, 2), n));
  }

  eq("094", "typeof 给 6、is 只认 Vector2i", `${typeOf(Z(1, 2)).v}/${isType(Z(1, 2), "Vector2i").v}/${isType(Z(1, 2), "Vector2").v}`, "6/true/false");
  eq("094", "定型数组默认值是 (0, 0)", zs(elemDefault("Vector2i")), "(0, 0)");
  eq("094", "Vector2i 键与 Vector2 / Vector3 键都不同桶", keyOf(Z(1, 2)) === keyOf(vector2(1, 2)) || keyOf(Z(1, 2)) === keyOf(vector3(1, 2, 3)), false);
  {
    const g = GArray.of([Z(3, 1), Z(1, 2), Z(3, 0)]);
    g.sort();
    eq("094", "sort 走字典序", show(V.array(g)), "[(1, 2), (3, 0), (3, 1)]");
    eq("094", "has / count 按分量身份", `${g.has(Z(1, 2))}/${g.count(Z(1.0, 2.0))}`, "true/1");
  }
  {
    const gd = new GDict();
    gd.set(Z(1, 2), I(1));
    gd.set(Z(1.7, 2.2), I(2));
    eq("094", "截断后是同一个键（构造即截断）", `${gd.size()} ${show(V.dict(gd))}`, "1 { (1, 2): 2 }");
  }
}

// ---- 096 Color：值类型这一族的最后一个（分量 float32 + 4 位小数打印），逐条探针实测（Godot 4.6.3）
{
  const C = (...a: Variant[]) => colorNew(a);
  const g = (name: string, args: Variant[] = []) => colorStatic(name, args);
  const msg = (fn: () => unknown): string => {
    try {
      fn();
      return "没有报错";
    } catch (e) {
      return (e as Error).message;
    }
  };
  const inst = C(V.float(0.1), V.float(0.2), V.float(0.3), V.float(0.4));
  const instOf = () => asColor(inst) as GColor;
  const M = (v: Variant) => (name: string, args: Variant[] = []) =>
    show(colorMethod(asColor(v) as GColor, name, args));
  const A = (v: Variant) => (key: Variant) => show(colorRead(asColor(v) as GColor, key, "prop"));

  eq("096", "零参是黑但 alpha 为 1", show(C()), "(0.0, 0.0, 0.0, 1.0)");
  eq("096", "三参补 alpha 1", show(C(V.int(1), V.int(2), V.int(3))), "(1.0, 2.0, 3.0, 1.0)");
  eq("096", "单参拷贝", show(C(inst)), "(0.1, 0.2, 0.3, 0.4)");
  eq("096", "字符串走名字表", show(C(V.str("red"))), "(1.0, 0.0, 0.0, 1.0)");
  eq("096", "名字表下划线可省、大小写不限", show(C(V.str("MINTCREAM"))), "(0.9608, 1.0, 0.9804, 1.0)");
  eq("096", "认不出来给兜底色（Godot 那边另有一行 stderr，产物不复现）", show(C(V.str("notacolor"))), "(0.0, 0.0, 0.0, 1.0)");
  eq("096", "0x 前缀不认", show(C(V.str("0x80ff0000"))), "(0.0, 0.0, 0.0, 1.0)");
  eq("096", "html 只认十六进制、不认名字", show(g("html", [V.str("red")])), "(0.0, 0.0, 0.0, 1.0)");
  eq("096", "html 的八位是 RGBA（alpha 在后）", show(g("html", [V.str("80ff0000")])), "(0.502, 1.0, 0.0, 0.0)");
  eq("096", "html 的三位会展开", show(g("html", [V.str("f00")])), "(1.0, 0.0, 0.0, 1.0)");
  eq("096", "from_string 认不出来用第二个实参", show(g("from_string", [V.str("bogus"), color(1, 2, 3, 4)])), "(1.0, 2.0, 3.0, 4.0)");
  shouldThrow("096", "from_string 必须两个实参", () => g("from_string", [V.str("red")]));
  eq("096", "from_hsv 三参补 alpha 1", show(g("from_hsv", [V.float(0.5), V.float(0.25), V.float(0.5)])), "(0.375, 0.5, 0.5, 1.0)");
  eq("096", "from_hsv 的扇区号按 6 取模", show(g("from_hsv", [V.float(1), V.float(1), V.float(1)])), "(1.0, 0.0, 0.0, 1.0)");
  eq("096", "常量面与名字表是同一张", show(g("ALICE_BLUE")), "(0.9412, 0.9725, 1.0, 1.0)");
  eq("096", "TRANSPARENT 是白带零 alpha", show(g("TRANSPARENT")), "(1.0, 1.0, 1.0, 0.0)");
  shouldThrow("096", "名单里没有 NAVY（只有 NAVY_BLUE）", () => g("NAVY"));
  shouldThrow("096", "常量只有 UPPER_SNAKE，没有 camelCase", () => g("AliceBlue"));

  eq("096", "打印是 4 位小数", show(color(1 / 3, 0.1, 0.123456789, 1)), "(0.3333, 0.1, 0.1235, 1.0)");
  eq("096", "恰好 -0.0 也保留负号（Vector2 在这里给 0.0）", show(color(1 / 3, 1e-5, -1e-5, -0)), "(0.3333, 0.0, -0.0, -0.0)");
  eq("096", "inf / nan 原样印", show(color(Infinity, NaN, -Infinity, 1)), "(inf, nan, -inf, 1.0)");
  eq("096", "整数分量走 strFloat 的展开", show(color(1e20, 1e-8, -1e-8, 1)), "(100000002004087730000.0, 0.0, -0.0, 1.0)");
  eq("096", "非零但舍到零留负号", strColor(Math.fround(-1e-5)), "-0.0");
  eq("096", "半个单位往上进位", strColor(Math.fround(0.00006)), "0.0001");

  eq("096", "派生 h", A(inst)(V.str("h")), "0.58333331346512");
  eq("096", "派生 s", A(inst)(V.str("s")), "0.66666668653488");
  eq("096", "派生 v 就是最大分量", A(inst)(V.str("v")), "0.30000001192093");
  eq("096", "字节属性 r8 / a8", `${A(inst)(V.str("r8"))}/${A(inst)(V.str("a8"))}`, "26/102");
  const wild = color(NaN, Infinity, -Infinity, 0.4);
  eq(
    "096",
    "字节的三条极端口径（nan 过 int32 给了 INT32_MIN、inf 顶到 255、-inf 落到 0）",
    [A(wild)(V.str("r8")), A(wild)(V.str("g8")), A(wild)(V.str("b8"))].join(" "),
    "-2147483648 255 0",
  );
  eq("096", "0.7 的字节是 179：float32 里积是精确的 178.5", A(color(0, 0, 0, 0.7))(V.str("a8")), "179");
  eq("096", "灰的 h/s 归零", `${A(color(0.5, 0.5, 0.5, 1))(V.str("h"))}/${A(color(0.5, 0.5, 0.5, 1))(V.str("s"))}`, "0.0/0.0");
  eq("096", "负分量的 s 不夹取", A(color(-0.5, 0.2, 0.9, 1))(V.str("s")), "1.55555558204651");
  eq("096", "分量读出来是 float32", A(inst)(V.str("r")), "0.10000000149012");

  eq("096", "to_html 默认就带 alpha", M(color(0.6, 0.4, 0.2, 1))("to_html"), "996633ff");
  eq("096", "to_html(false) 才是 6 位", M(color(0.25, 0.5, 0.75, 0.5))("to_html", [V.bool(false)]), "4080bf");
  eq("096", "to_html(true) 是 8 位", M(color(0.4, 0.5, 0.6, 0.7))("to_html", [V.bool(true)]), "668099b3");
  eq("096", "to_rgba32 按 RGBA 打包", M(color(0.6, 0.4, 0.2, 1))("to_rgba32"), "2573612031");
  eq("096", "to_argb32 / to_abgr32 各按名字排", `${M(color(0.6, 0.4, 0.2, 1))("to_argb32")}/${M(color(0.6, 0.4, 0.2, 1))("to_abgr32")}`, "4288243251/4281558681");
  eq("096", "全 1 打包到 4294967295", M(color(1, 1, 1, 1))("to_rgba32"), "4294967295");
  eq("096", "全 0 打包到 0", M(color(0, 0, 0, 0))("to_rgba32"), "0");
  eq("096", "get_luminance 是 Rec.709 权重", M(color(0.25, 0.5, 0.75, 1))("get_luminance"), "0.46490001678467");
  eq("096", "灰的亮度就是分量本身", M(color(0.5, 0.5, 0.5, 1))("get_luminance"), "0.5");
  eq("096", "lightened 是向白插值、alpha 不动", M(color(0.6, 0.4, 0.2, 0.3))("lightened", [V.float(0.5)]), "(0.8, 0.7, 0.6, 0.3)");
  eq("096", "darkened 是向黑插值", M(color(0.6, 0.4, 0.2, 0.3))("darkened", [V.float(0.5)]), "(0.3, 0.2, 0.1, 0.3)");
  eq("096", "lightened 不会冲过 1", M(color(1, 1, 1, 1))("lightened", [V.float(0.5)]), "(1.0, 1.0, 1.0, 1.0)");
  eq("096", "负的 amount 往回走", M(color(0.6, 0.4, 0.2, 1))("lightened", [V.float(-0.5)]), "(0.4, 0.1, -0.2, 1.0)");
  eq("096", "darkened 的负 amount 往上", M(color(0.6, 0.4, 0.2, 1))("darkened", [V.float(-0.5)]), "(0.9, 0.6, 0.3, 1.0)");
  eq("096", "inverted 保留 alpha", M(color(0.6, 0.4, 0.2, 0.3))("inverted"), "(0.4, 0.6, 0.8, 0.3)");
  eq("096", "lerp 逐分量", M(color(0.1, 0.2, 0.3, 0.4))("lerp", [color(0.7, 0.8, 0.9, 1), V.float(0.333)]), "(0.2998, 0.3998, 0.4998, 0.5998)");
  eq(
    "096",
    "is_equal_approx 与向量共用 1e-5 相对容差",
    `${M(color(1, 2, 3, 4))("is_equal_approx", [color(1.000009, 2, 3, 4)])}/${M(color(1, 2, 3, 4))("is_equal_approx", [color(1.00001, 2, 3, 4)])}`,
    "true/false",
  );
  eq("096", "method 分派接住了 Color", show(method(inst, "inverted", [])), "(0.9, 0.8, 0.7, 0.4)");
  for (const nm of ["clamped", "is_finite", "is_zero_approx", "mix", "blend_rgb", "get_hsv", "snap", "to_rgba8", "to_bgra32"]) {
    shouldThrow("096", `Color.${nm}() 实测不存在`, () => M(inst)(nm));
  }

  eq("096", "index 分派给下标读", show(index(inst, V.int(0))), "0.10000000149012");
  eq("096", "下标读字符串键", show(index(inst, V.str("g"))), "0.20000000298023");
  eq("096", "越界下标的报错文本与 Godot 同字", msg(() => index(inst, V.int(4))), "Invalid access of index '4' on a base object of type: 'Color'.");
  eq("096", "Color+Color", show(ops.add(color(1, 2, 3, 4), color(0.5, 0.5, 0.5, 0.5))), "(1.5, 2.5, 3.5, 4.5)");
  eq("096", "Color-Color", show(ops.sub(color(1, 2, 3, 4), color(0.5, 0.5, 0.5, 0.5))), "(0.5, 1.5, 2.5, 3.5)");
  eq("096", "Color*Color 逐分量", show(ops.mul(color(1, 2, 3, 4), color(2, 3, 4, 5))), "(2.0, 6.0, 12.0, 20.0)");
  eq(
    "096",
    "Color*标量与标量*Color 同值",
    `${show(ops.mul(color(1, 2, 3, 4), V.int(2)))}|${show(ops.mul(V.int(2), color(1, 2, 3, 4)))}`,
    "(2.0, 4.0, 6.0, 8.0)|(2.0, 4.0, 6.0, 8.0)",
  );
  eq("096", "Color/Color", show(ops.div(color(1, 2, 3, 4), color(2, 4, 6, 8))), "(0.5, 0.5, 0.5, 0.5)");
  eq("096", "除 0.0 给 inf 而不是除零错", show(ops.div(color(1, 2, 3, 4), V.float(0))), "(inf, inf, inf, inf)");
  eq("096", "一元负号是反色而不是取负", show(ops.neg(color(1, -2, 0, 0.5))), "(0.0, 3.0, 1.0, 0.5)");
  eq("096", "与 null 比给 false", show(ops.eq(color(1, 2, 3, 4), V.nil())), "false");
  eq("096", "null 在左边也是 false", show(ops.eq(V.nil(), color(1, 2, 3, 4))), "false");
  eq("096", "== 是 float32 分量相等", show(ops.eq(color(0.1, 0, 0, 0), color(0.1, 0, 0, 0))), "true");
  shouldThrow("096", "Color 与 int 混比要炸", () => ops.eq(color(1, 2, 3, 4), V.int(1)));
  shouldThrow("096", "Color 与 Vector2 混比要炸", () => ops.eq(color(1, 2, 3, 4), vector2(1, 2)));
  shouldThrow("096", "Color 没有大小顺序", () => ops.lt(color(1, 2, 3, 4), color(0, 0, 0, 0)));
  shouldThrow("096", "Color 不能跟 int 相加", () => ops.add(color(1, 2, 3, 4), V.int(1)));

  eq("096", "分量写不夹取", show(colorWrite(instOf(), V.str("r"), V.float(2.7), "prop")), "(2.7, 0.2, 0.3, 0.4)");
  eq("096", "写 h 是「转 HSV 换那一格再转回」", show(colorWrite(instOf(), V.str("h"), V.float(0.5), "prop")), "(0.1, 0.3, 0.3, 0.4)");
  eq("096", "写 s", show(colorWrite(instOf(), V.str("s"), V.float(0.5), "prop")), "(0.15, 0.225, 0.3, 0.4)");
  eq("096", "写 v", show(colorWrite(instOf(), V.str("v"), V.float(0.5), "prop")), "(0.1667, 0.3333, 0.5, 0.4)");
  eq("096", "写 r8 落的是字节", show(colorWrite(instOf(), V.str("r8"), V.int(128), "prop")), "(0.502, 0.2, 0.3, 0.4)");
  eq("096", "写 a8 之后 a 是 64/255", show(colorWrite(instOf(), V.str("a8"), V.int(64), "prop")), "(0.1, 0.2, 0.3, 0.251)");
  shouldThrow("096", "字节写越界没探针，响亮报缺", () => colorWrite(instOf(), V.str("r8"), V.int(300), "prop"));
  // 属性写拒绝 String 实测会炸；那行文案里键要不要带引号没探针（vecFailKey 现给 '"r"'），
  // 所以这里只钉「必须响亮报错」，不钉文案。
  shouldThrow("096", "String 写分量要炸", () => colorWrite(instOf(), V.str("r"), V.str("x"), "prop"));
  {
    const wd = writeProp(inst, "b", V.float(1)) as Variant;
    eq("096", "写分量产出新值、不动原值（值类型）", `${show(inst)} | ${show(wd)}`, "(0.1, 0.2, 0.3, 0.4) | (0.1, 0.2, 1.0, 0.4)");
  }
  eq("096", "下标写同样回报新值", show(writeIdx(inst, V.int(3), V.float(0.25)) as Variant), "(0.1, 0.2, 0.3, 0.25)");
  {
    const gd = new GDict();
    gd.set(color(1, 0, 0, 1), V.int(7));
    gd.set(color(1, 0, 0, 1.0), V.int(8));
    eq("096", "等值 Color 是同一格", `${gd.size()} ${show(V.dict(gd))}`, "1 { (1.0, 0.0, 0.0, 1.0): 8 }");
    eq("096", "分量不同的 Color 是另一格", String(gd.has(color(1, 0, 1, 1))), "false");
  }
  eq("096", "Array[Color] 的默认元素 alpha 是 1", show(elemDefault("Color")), "(0.0, 0.0, 0.0, 1.0)");
  eq(
    "096",
    "elemConvert 只收 Color 本身",
    `${elemConvert("Color", color(1, 1, 1, 1)) === null ? "拒" : "收"}/${elemConvert("Color", V.int(1)) === null ? "拒" : "收"}`,
    "收/拒",
  );
  shouldThrow("096", "Color 数组不能 sort（没有顺序）", () => {
    GArray.of([color(1, 0, 0, 1), color(0, 1, 0, 1)]).sort();
  });
}

// ---- 098 String.hash() / 全局 hash()：Godot 那条是 djb2、按 UTF-32 码点走、每步回绕 32 位（15+ 实测点）
{
  const H = (s: string) => String(hashDjb2(s));
  const vh = (v: Variant) => String(variantHash([v]).v);
  eq("098", "空串就是种子", H(""), "5381");
  eq("098", "单字符", H("a"), "177670");
  eq("098", "abc 与计划文档里那条实测同值", H("abc"), "193485963");
  eq("098", "吃码点不吃码元：BMP 中文", H("你好"), "6553378");
  eq("098", "吃码点不吃码元：一个 emoji", H("\u{1F600}"), "306085");
  eq("098", "吃码点不吃码元：两个 emoji", H("\u{1F600}\u{1F601}"), "10229318");
  eq("098", "吃码点不吃码元：组合用字母", H("a\u0301"), "5863879");
  eq("098", "边界码点 U+FFFF / U+10000", `${H("\uFFFF")}/${H("\u{10000}")}`, "243108/243109");
  eq("098", "26 个字母溢出 32 位之后仍印无符号", H("abcdefghijklmnopqrstuvwxyz"), "3927029252");
  eq("098", "43 个字符（多轮回绕）", H("the quick brown fox jumps over the lazy dog"), "2012963070");
  eq("098", "经典转义那一条", H("\t\n\\\""), "2086810998");
  eq(
    "098",
    "数字串 / 大写 / 空格 / 重复串",
    [H("0123456789"), H("A"), H(" "), H("abcabc")].join(" "),
    "995771986 177638 177605 4048076369",
  );
  eq("098", "全局 hash(String)", vh(V.str("abc")), "193485963");
  eq("098", "全局 hash(StringName) 同值", vh(V.stringName("abc")), "193485963");
  eq("098", "实例方法 hash() 与全局同值", String(method(V.str("abc"), "hash", []).v), "193485963");
  eq("098", "StringName 的方法也走同一条", String(method(V.stringName("abc"), "hash", []).v), "193485963");
  eq("098", "hash(true) / hash(false) / hash(null)", `${vh(V.bool(true))}/${vh(V.bool(false))}/${vh(V.nil())}`, "1/0/0");
  shouldThrow("098", "hash(int) 的 murmur3 链还没逆出来", () => vh(V.int(5)));
  shouldThrow("098", "hash(float) 同样报缺", () => vh(V.float(2.5)));
  shouldThrow("098", "hash(数组) 报缺，不拿 JS 自己的一套顶", () => vh(V.array(GArray.of([V.int(1)]))));
  shouldThrow("098", "hash(Vector2) 报缺", () => vh(vector2(1, 2)));
  shouldThrow("098", "hash(Color) 报缺", () => vh(color(1, 0, 0, 1)));
  shouldThrow("098", "hash() 的实参个数必须是 1", () => variantHash([]));
  shouldThrow("098", "String.hash() 不收实参", () => method(V.str("abc"), "hash", [V.int(1)]));
}

// ---- 099 split 的第三参 max_splits：46 个实测点定下来的算式（余段原样、空片段不占额度、码点下刀）
{
  const SP = (s: string, d: string, allow: boolean, cap: number) =>
    show(method(V.str(s), "split", [V.str(d), V.bool(allow), V.int(cap)]));
  const T: Array<[string, string, boolean, number, string]> = [
    ["a,b,c", ",", true, 1, '["a", "b,c"]'],
    ["a,,b", ",", true, 1, '["a", ",b"]'],
    ["a,,b", ",", false, 1, '["a", "b"]'],
    ["a,,b", ",", false, 2, '["a", "b"]'],
    ["a,,,b", ",", true, 1, '["a", ",,b"]'],
    ["a,b,,c,d", ",", false, 2, '["a", "b", "c,d"]'],
    ["a,b,,c,d", ",", true, 3, '["a", "b", "", "c,d"]'],
    [",a,", ",", true, 1, '["", "a,"]'],
    [",a,", ",", false, 1, '["a"]'],
    [",a,,b,", ",", false, 1, '["a", "b,"]'],
    [",a,,b,", ",", false, 2, '["a", "b"]'],
    ["  a  ", " ", false, 2, '["a"]'],
    [",,,", ",", false, 1, "[]"],
    [",,,", ",", false, 2, "[]"],
    [",,,", ",", true, 1, '["", ",,"]'],
    ["aa", "a", true, 1, '["", "a"]'],
    ["aa", "a", false, 1, "[]"],
    ["aaa", "aa", true, 1, '["", "a"]'],
    ["a,b,", ",", false, 1, '["a", "b,"]'],
    ["a, ,b", ",", false, 1, '["a", " ,b"]'],
    ["abc", "", true, 1, '["a", "bc"]'],
    ["abc", "", false, 1, '["a", "bc"]'],
    ["abc", "", true, 2, '["a", "b", "c"]'],
    ["ab,,cd", "", false, 2, '["a", "b", ",,cd"]'],
    ["a::b::c", "::", true, 1, '["a", "b::c"]'],
    ["aXXbXXc", "XX", false, 1, '["a", "bXXc"]'],
    ["a,b,c", ",", true, 5, '["a", "b", "c"]'],
    ["", ",", true, 1, '[""]'],
    ["", ",", false, 1, "[]"],
    ["x", ",", true, 1, '["x"]'],
  ];
  for (const [s, d, allow, cap, want] of T) {
    eq("099", `split(${JSON.stringify(s)}, ${JSON.stringify(d)}, ${allow}, ${cap})`, SP(s, d, allow, cap), want);
  }
  eq("099", "max_splits=0 就是不限刀", SP("a,b,c", ",", true, 0), '["a", "b", "c"]');
  eq("099", "max_splits 负数同样不限刀", SP("a,b,c", ",", false, -1), '["a", "b", "c"]');
  eq("099", "两参版口径没被带跑（回归位）", show(method(V.str("a,,b"), "split", [V.str(","), V.bool(false)])), '["a", "b"]');
  eq("099", "空分隔符的两参版仍逐码点", show(method(V.str("ab"), "split", [V.str("")])), '["a", "b"]');
  shouldThrow("099", "split() 不收第四个参数", () =>
    method(V.str("a,b"), "split", [V.str(","), V.bool(true), V.int(1), V.bool(true)]),
  );
  shouldThrow("099", "max_splits 要 int（float 实测是类型错）", () =>
    method(V.str("a,b"), "split", [V.str(","), V.bool(true), V.float(1.5)]),
  );
}

// ---- 100 自引用容器：打印与比较是一条固定层数闸门（101 层），深拷贝要保住环
{
  const items = (g: unknown): Variant[] => (g as { items: Variant[] }).items;
  const mkA = (): [GArray, Variant] => {
    const g = GArray.of([]);
    const gv = V.array(g);
    items(g).push(gv);
    return [g, gv];
  };
  const mkD = (): [GDict, Variant] => {
    const d = new GDict();
    const dv = V.dict(d);
    d.set(V.str("x"), dv);
    return [d, dv];
  };
  const nest = (n: number): Variant => {
    let c = V.array(GArray.of([]));
    for (let i = 0; i < n; i++) {
      const g = GArray.of([]);
      items(g).push(c);
      c = V.array(g);
    }
    return c;
  };
  const [ga, gv] = mkA();
  const [gd, dv] = mkD();
  const sa = show(gv);
  const sd = show(dv);
  eq("100", "自引用数组打印长 207：101 个左括号 + 标记 + 101 个右括号", String(sa.length), "207");
  eq("100", "数组的收尾标记是 [...]（不带空格）", sa.slice(0, 3) + "|" + sa.slice(101, 106) + "|" + sa.slice(-3), "[[[|[...]|]]]");
  eq("100", "自引用字典打印长 916", String(sd.length), "916");
  eq("100", "字典的收尾标记是带空格的 { ... }（第 707 格起）", sd.slice(0, 7) + "|" + sd.slice(707, 714), `{ \"x\": |{ ... }`);
  eq("100", "101 层的有限深结构全展开（没有标记）", String(show(nest(100)).length), "202");
  eq("100", "102 层起最里一层换成标记：环与有限深走同一道闸门", String(show(nest(101)).length), "207");
  {
    const p = GArray.of([]);
    const pv = V.array(p);
    const q = GArray.of([]);
    const qv = V.array(q);
    items(p).push(qv);
    items(q).push(pv);
    eq("100", "间接环与直接环同层数（不是重复检测）", String(show(pv).length), "207");
  }
  const [gb, bv] = mkA();
  eq("100", "两个不同的自引用数组 == 为真（实测 a == b）", String(valueEq(gv, bv)), "true");
  eq("100", "同引用仍是真", String(valueEq(gv, gv)), "true");
  const [hd, hv] = mkD();
  eq("100", "两个不同的自引用字典 == 为真", String(valueEq(dv, hv)), "true");
  eq("100", "身份版比较同样截断，不栈溢出", String(valueSame(dv, hv)), "true");
  const ca = ga.duplicate(true);
  eq("100", "深拷贝保住环：副本的第 0 格就是副本自己", String((items(ca)[0] as Variant).v === ca), "true");
  eq("100", "深拷贝的打印与原物同形", show(V.array(ca)), sa);
  eq("100", "浅拷贝照旧共享内层", String(items(ga.duplicate())[0] === gv), "true");
  const cd = gd.duplicate(true);
  eq("100", "字典深拷贝保住环", String((cd.getRequired(V.str("x")) as Variant).v === cd), "true");
  eq("100", "字典深拷贝的打印同形", show(V.dict(cd)), sd);
  // 兄弟两格各自也按绝对层数截断（实测 `str([a, a]).length()` == 414）
  eq("100", "数组里两个环：外层占掉一层，两个子环各短一格", String(show(V.array(GArray.of([gv, gv]))).length), "414");
  eq("100", "深拷出来的环按层数与原物相等", String(valueEq(V.array(ca), gv)), "true");
}

// ---- 101 自引用容器当字典键：**桶走 101 层闸门、比较走 52 层**，两道不是一条（step 47 实测）
{
  const its = (g: unknown): Variant[] => (g as { items: Variant[] }).items;
  const cyc = (): Variant => {
    const g = GArray.of([]);
    const v = V.array(g);
    its(g).push(v);
    return v;
  };
  const nest = (n: number): Variant => {
    let c = V.array(GArray.of([]));
    for (let i = 0; i < n; i++) {
      const g = GArray.of([]);
      its(g).push(c);
      c = V.array(g);
    }
    return c;
  };
  const eqs = (a: Variant, b: Variant) => String(valueEq(a, b));

  eq("101", "比较闸门 = 52：a == nest(51) 假", eqs(cyc(), nest(51)), "false");
  eq("101", "a == nest(52) 真", eqs(cyc(), nest(52)), "true");
  eq("101", "nest(51) == nest(52) 假", eqs(nest(51), nest(52)), "false");
  eq("101", "nest(52) == nest(53) 真（52 层之外明显不同的容器会相等）", eqs(nest(52), nest(53)), "true");
  {
    const d = new GDict();
    d.set(nest(100), V.int(1));
    eq("101", "桶闸门更深：d[nest(100)] 查 nest(101) 落空", `${d.has(nest(101))}/${d.size()}`, "false/1");
  }
  {
    const d = new GDict();
    d.set(nest(101), V.int(1));
    eq("101", "d[nest(101)] 查 nest(102) 命中", String(d.has(nest(102))), "true");
    d.set(nest(102), V.int(2));
    eq("101", "顶掉同一格、size 仍是 1", `${d.size()}/${String(d.getRequired(nest(101)).v)}`, "1/2");
  }
  {
    const a = cyc();
    const b = cyc();
    const d = new GDict();
    d.set(a, V.int(1));
    eq("101", "两个不同的环是同一格", String(d.has(b)), "true");
    d.set(b, V.int(2));
    eq("101", "顶掉之后两个键读到同一个值", `${String(d.getRequired(a).v)}/${String(d.getRequired(b).v)}`, "2/2");
    d.erase(a);
    eq("101", "erase 擦得掉环键", `${d.size()}/${String(d.has(b))}`, "0/false");
  }
  {
    const p = GArray.of([]);
    const q = GArray.of([]);
    const pv = V.array(p);
    const qv = V.array(q);
    its(p).push(qv);
    its(q).push(pv);
    const r = GArray.of([]);
    const s = GArray.of([]);
    const rv = V.array(r);
    its(r).push(V.array(s));
    its(s).push(rv);
    const d = new GDict();
    d.set(pv, V.int(1));
    eq("101", "间接环互等为真", eqs(pv, rv), "true");
    eq("101", "多包一层还是同一格（p / [p] / [[p]]）", `${d.has(rv)}/${d.has(V.array(GArray.of([pv])))}`, "true/true");
  }
  {
    const ca = new GDict();
    const cav = V.dict(ca);
    ca.set(V.str("k"), cav);
    const cb = new GDict();
    const cbv = V.dict(cb);
    cb.set(V.str("k"), cbv);
    const d = new GDict();
    d.set(cav, V.int(1));
    d.set(cbv, V.int(2));
    eq("101", "字典环键并格、size 1", `${d.size()}/${String(d.getRequired(cav).v)}`, "1/2");
    const arr = GArray.of([cav]);
    eq("101", "数组的 has/count 也按截断身份", `${arr.has(cbv)}/${arr.count(cbv)}`, "true/1");
  }
  {
    const e = V.array(GArray.of([]));
    const f = GArray.of([e]);
    const d = new GDict();
    d.set(e, V.int(1));
    d.set(V.array(f), V.int(2));
    eq("101", "[] 与 [[]] 仍是两格（闸门没把浅结构糊掉）", String(d.size()), "2");
  }
  {
    const k = V.array(GArray.of([V.int(1), V.int(2)]));
    const d = new GDict();
    d.set(k, V.int(5));
    its(k.v).push(V.int(3));
    eq(
      "101",
      "改过的有限键仍是 ghost（S81 旧口径没被闸门破坏）",
      `${d.size()}/${d.has(k)}/${d.has(V.array(GArray.of([V.int(1), V.int(2)])))}`,
      "1/false/false",
    );
  }
}

// ---- 102 浮点字面量的解析：Godot 先把小数位截到 17 位再拼整数除 10^k，两次舍入不是正确舍入
{
  // 比较用**数值**而不是十进制串：> 2⁵³ 的 double 会被 JS 印成最短可回读形式（…300 而不是 …256）
  const D = (t: string, want: number) => String(Math.trunc(parseGdDouble(t)) === want);
  const DK = (t: string, k: number, want: number) => String(Math.trunc(parseGdDouble(t) * k) === want);
  eq("102", "9007199254740993.0 → …994（JS 给 …992）", D("9007199254740993.0", 9007199254740994), "true");
  eq("102", "负号同口径", D("-9007199254740993.0", -9007199254740994), "true");
  eq("102", "9007199254740993.5 两条路一致（回归位）", D("9007199254740993.5", 9007199254740994), "true");
  eq("102", "小数截 17 位", DK("0.1234567890123456789", 1e17, 12345678901234568), "true");
  eq("102", "前导零占小数预算：只剩 11 位有效数字", DK("0.0000001234567890123456789", 1e25, 1234567890100000256), "true");
  eq("102", "1 后面 54 位小数被截 → 落回 1.0", DK("1.000000000000000083266726846886739642044414197265625", 1e18, 1000000000000000000), "true");
  eq("102", "100000000000000001.0 两条路一致", D("100000000000000001.0", 100000000000000000), "true");
  eq("102", "1234567890123456789.0 两条路一致", D("1234567890123456789.0", 1234567890123456768), "true");
  eq("102", "0.999999999999999999999 截位后就是 1", D("0.999999999999999999999", 1), "true");
  eq("102", "指数量不参与截位", DK("1e-23", 1e30, 10000000), "true");
  eq("102", "下划线分隔符照收", D("1_000_000.25", 1000000), "true");
  eq("102", "无小数点也按同一式子（>2⁵³ 的奇数落回偶数）", D("9007199254740993", 9007199254740992), "true");
  eq("102", "非数字串仍走 JS 的老路（字面量里遇不到，留着当护栏）", `${parseGdDouble("xyz")}/${parseGdDouble("1e")}`, "NaN/1");
}

console.log(`ops 自校验：通过 ${pass}，失败 ${fails.length}`);
if (fails.length > 0) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
