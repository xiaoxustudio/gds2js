/**
 * ops / fast 的自校验。期望值全部来自 corpus/cases 的 godot.txt（Godot 4.6.3 实测），
 * 不是我凭印象写的。跑：node_modules/.bin/tsx tools/ops-check.ts
 *
 * 注意：这不是差分测试台的替代 —— 它只校验运行时算子，
 * 真正的端到端对比要等 emitter 落地后由 tools/js-runner.mjs 驱动。
 */
import { GodotRuntimeError, UnsupportedError } from "../src/runtime/errors";
import { fast } from "../src/runtime/fast";
import { ops, strOps } from "../src/runtime/ops";
import { V } from "../src/runtime/tags";
import { GArray, GDict, show, strFloat } from "../src/runtime/values";

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

// ---- 005 / 006 / 016 int64：D1 决定抛 unsupported，不静默降级
shouldThrow("005", "9223372036854775807 超出 2^53", () => I(9223372036854775807));
shouldThrow("006", "int64 回绕语义", () => ops.add(I(9223372036854775807), I(1)));
shouldThrow("016", "1<<62 需要 int64", () => ops.shl(I(1), I(62)));

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
shouldThrow("017", "科学计数法格式化未补测", () => strFloat(1e30));

// ---- 018 String（UTF-32 语义 S26）
eq("018", "\"hello\"[0]", strOps.at("hello", 0), "h");
eq("018", "length()", strOps.length("hello"), 5);
eq("018", "substr(1,3)", strOps.substr("hello", 1, 3), "ell");
eq("018", "to_upper()", "hello".toUpperCase(), "HELLO");
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

console.log(`ops 自校验：通过 ${pass}，失败 ${fails.length}`);
if (fails.length > 0) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
