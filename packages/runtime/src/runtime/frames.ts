import { V, type Variant } from "./tags";
import { GodotRuntimeError } from "./errors";
import { GArray, GDict, showArgsSep } from "./values";

/** 一帧：脚本路径、函数名（lambda 是 `<anonymous lambda>`）与这一帧当前执行到的行。 */
type Frame = { source: string; fn: string; line: number };

const STACK: Frame[] = [];

/** 进一支函数：把进栈前的深度交给调用方，退出时按它复位 —— 协程交错时才不会把别人的帧摘走。 */
export function frameEnter(source: string, fn: string): number {
  const depth = STACK.length;
  STACK.push({ source, fn, line: 0 });
  return depth;
}

export function frameExit(depth: number): void {
  if (depth <= STACK.length) STACK.length = depth;
}

/** 本帧当前走到 `.gd` 的哪一行：栈顶那帧报的就是这一格，父帧报的是调用点那一行。 */
export function frameLine(line: number): void {
  const top = STACK[STACK.length - 1];
  if (top !== undefined) top.line = line;
}

/** 帧序列，最近的在前（`print_stack` / `get_stack` / `push_error` 三块共用）。 */
function stackFrames(): Frame[] {
  const out: Frame[] = [];
  for (let i = STACK.length - 1; i >= 0; i--) {
    const f = STACK[i];
    if (f !== undefined) out.push(f);
  }
  return out;
}

/** `print_stack()` 的每帧一行实测走 stdout，要与其余 print 同序 —— 宿主装载时把自己的行缓冲登记进来。 */
let printSink: ((line: string) => void) | null = null;

export function setStackPrintSink(fn: (line: string) => void): void {
  printSink = fn;
}

function writeStdoutLine(line: string): void {
  if (printSink !== null) printSink(line);
  else process.stdout.write(line + "\n");
}

/** `print_stack()`：每帧一行、没有表头（实测 stdout，语料 273）。 */
export function gPrintStack(): Variant {
  for (const line of stackFrameLines()) writeStdoutLine(line);
  return V.nil();
}

export function stackFrameLines(): string[] {
  return stackFrames().map((f, i) => `Frame ${String(i)} - ${f.source}:${String(f.line)} in function '${f.fn}'`);
}

/** 运行期错误作废的是**当前那支函数**：引擎先把这一块推到 stderr，再从该函数返回，调用方接着跑（S406，九格 + 十九格的返回型默认值量的）。不是引擎那一句的就原样再抛出去。 */
export function gdFunctionError(err: unknown): void {
  if (!(err instanceof GodotRuntimeError)) throw err;
  const fs = stackFrames();
  const top = fs[0];
  const at = top === undefined ? "? (-1)" : `${top.fn} (${top.source}:${String(top.line)})`;
  const lines = [`SCRIPT ERROR: ${err.message}`, `   at: ${at}`, "   GDScript backtrace (most recent call first):"];
  for (const [i, f] of fs.entries()) lines.push(`       [${String(i)}] ${f.fn} (${f.source}:${String(f.line)})`);
  process.stderr.write(lines.join("\n") + "\n");
}

/** `push_error` / `push_warning` 那一块：首行 + `at:` + backtrace 表头 + 每帧一行（实测原文，语料 273）。 */
export function stackBlockLines(head: string, at: string, args: Variant[]): string[] {
  const out = [`${head}: ${showArgsSep(args, "")}`, `   at: ${at}`, "   GDScript backtrace (most recent call first):"];
  for (const [i, f] of stackFrames().entries()) out.push(`       [${String(i)}] ${f.fn} (${f.source}:${String(f.line)})`);
  return out;
}

/** 两支 push 整块走 stderr，且都不中断脚本（实测 `push_error` 前后的 print 照打，空实参照打 `ERROR: `）。 */
function pushBlock(head: string, at: string, args: Variant[]): Variant {
  process.stderr.write(stackBlockLines(head, at, args).join("\n") + "\n");
  return V.nil();
}

export function gPushError(args: Variant[]): Variant {
  return pushBlock("ERROR", "push_error (core/variant/variant_utility.cpp:1024)", args);
}

export function gPushWarning(args: Variant[]): Variant {
  return pushBlock("WARNING", "push_warning (core/variant/variant_utility.cpp:1034)", args);
}

/** 只读容器被写时引擎推的那一块（`at:` 那行按每个方法各自的 C++ 文件与行号，S403 逐格量的）。 */
export function readOnlyError(at: string, kind: string): Variant {
  return pushBlock("ERROR", at, [V.str(`${kind} is in read-only state.`)]);
}

/** static 属性委托到实例方法：那一次调用不发生，引擎运行期打一块 ERROR，读给 null、写什么也不做（实测语料 371）。 */
export function reportNonStaticCall(fn: string): Variant {
  return pushBlock("ERROR", "callp (modules/gdscript/gdscript.cpp:940)", [V.str(`Can't call non-static function '${fn}' in script.`)]);
}

/** `%` 的格式化在运行期失败：引擎打一块非致命 ERROR、脚本照跑，回值是**格式串原样**（实测 `tmp/d6/s491c.py` 二十格）。 */
export function pctFormatError(detail: string): Variant {
  return pushBlock("ERROR", "validated_evaluate (core/variant/variant_op.h:829)", [V.str(`String formatting error: ${detail}`)]);
}

/** `String.format()` 的 `values` 不是 Array / Dictionary / Object：引擎打一块非致命 ERROR、脚本照跑，回值是**格式串原样**（实测 `tmp/d6/s511fmt.gd`，`at:` 是 `format (core/string/ustring.cpp:3598)`）。 */
export function stringFormatInvalidType(): Variant {
  return pushBlock("ERROR", "format (core/string/ustring.cpp:3598)", [V.str("Invalid type: use Array, Dictionary or Object.")]);
}

/** `String.replace_char(key, 0)`：引擎打一块非致命 ERROR、回原串（S544，`core/string/ustring.cpp:3803`）。 */
export function stringReplaceCharNul(): Variant {
  return pushBlock("ERROR", "replace_char (core/string/ustring.cpp:3803)", [V.str("`with` must not be the NUL character.")]);
}

/** `String.replace_chars(keys, 0)`：同一句，`at:` 落在公共那支（S544，`core/string/ustring.cpp:3853`）。 */
export function stringReplaceCharsNul(): Variant {
  return pushBlock("ERROR", "_replace_chars_common (core/string/ustring.cpp:3853)", [V.str("`with` must not be the NUL character.")]);
}

/** `Signal.connect()` 重复连同一个 Callable：引擎打一块非致命 ERROR、返回 31（S546，`core/object/object.cpp:1682`）。 */
export function signalDuplicateConnect(sigName: string, label: string): Variant {
  return pushBlock("ERROR", "connect (core/object/object.cpp:1682)", [V.str(`Signal '${sigName}' is already connected to given callable '${label}' in that object.`)]);
}

/** `Signal.connect(Callable())`：空 Callable 一律打这一句并返回 31（S546，`core/object/object.cpp:1639`）。 */
export function signalNullCallable(sigName: string): Variant {
  return pushBlock("ERROR", "connect (core/object/object.cpp:1639)", [V.str(`Cannot connect to '${sigName}': the provided callable is null.`)]);
}

/** `PackedByteArray.bswap16/32/64` 的两道 ERR_FAIL（S549）：非致命、块走 stderr、字节一个不动。 */
export function packBswapGuard(kind: 16 | 32 | 64, which: "offset" | "count"): Variant {
  const width = kind / 8;
  const line = which === "offset" ? (kind === 16 ? 702 : kind === 32 ? 719 : 736) : (kind === 16 ? 706 : kind === 32 ? 722 : 739);
  const cond = which === "offset" ? `p_offset < 0 || p_offset > int64_t(sz) - ${String(width)}` : `p_count > floor((sz - p_offset) / ${String(width)})`;
  return pushBlock("ERROR", `func_PackedByteArray_bswap${String(kind)} (core/variant/variant_call.cpp:${String(line)})`, [V.str(`Condition "${cond}" is true.`)]);
}

/** `PackedByteArray.decode_*` 的越界 ERR_FAIL_COND_V（S550）：读侧那块带 ` Returning: 0`。 */
export function packDecodeGuard(fn: string, line: number, width: number): Variant {
  const cond = width === 1 ? "p_offset < 0 || p_offset > int64_t(size) - 1" : `p_offset < 0 || p_offset > (int64_t(size) - ${String(width)})`;
  return pushBlock("ERROR", `${fn} (core/variant/variant_call.cpp:${String(line)})`, [V.str(`Condition "${cond}" is true. Returning: 0`)]);
}

/** `PackedByteArray.encode_*` 的越界 ERR_FAIL_COND（S550）：写侧**没有括号**、也没有 ` Returning`。 */
export function packEncodeGuard(fn: string, line: number, width: number): Variant {
  const cond = `p_offset < 0 || p_offset > int64_t(size) - ${String(width)}`;
  return pushBlock("ERROR", `${fn} (core/variant/variant_call.cpp:${String(line)})`, [V.str(`Condition "${cond}" is true.`)]);
}

/** `PackedByteArray.decode_var` 一族的负偏移（S552）：四支各回 -1 / `Variant()` / 0 / false。 */
export function packVarOffsetNegative(fn: string, line: number, ret: string): Variant {
  return pushBlock("ERROR", `${fn} (core/variant/variant_call.cpp:${String(line)})`, [V.str(`Condition "p_offset < 0" is true. Returning: ${ret}`)]);
}

/** 解码器剩余不足 4 字节（S552）：引擎在 marshalls 打一块 `len < 4`，三支解码随后给 null / 0 / false。 */
export function packVarShort(): Variant {
  return pushBlock("ERROR", "decode_variant (core/io/marshalls.cpp:190)", [V.str('Condition "len < 4" is true. Returning: ERR_INVALID_DATA')]);
}

/** `PackedByteArray.decompress()` 的三块失败文案（S559）：buffer ≤ 0 / 空压缩源 / zlib 解不开。 */
export function packDecompressBufferZero(): void {
  pushBlock("ERROR", "func_PackedByteArray_decompress (core/variant/variant_call.cpp:818)", [V.str("Decompression buffer size must be greater than zero.")]);
}

export function packDecompressSrcZero(): void {
  pushBlock("ERROR", "func_PackedByteArray_decompress (core/variant/variant_call.cpp:821)", [V.str("Compressed buffer size must be greater than zero.")]);
}

export function packDecompressInflateErr(): void {
  pushBlock("ERROR", "decompress (core/io/compression.cpp:197)", [V.str('Condition "err != 1" is true. Returning: -1')]);
}

/** `decompress_dynamic()` 的空输入（S557）：compression 那层先打 `p_src_size <= 0`，再打外层 `Decompression failed.`。 */
export function packDynamicSrcEmpty(): Variant {
  return pushBlock("ERROR", "decompress_dynamic (core/io/compression.cpp:233)", [V.str('Condition "p_src_size <= 0" is true. Returning: (-3)')]);
}

/** `decompress_dynamic()` 只收 DEFLATE / GZIP（S560）：其它模式先打 compression 295 那句，再打外层 844。 */
export function packDynamicBadMode(): Variant {
  return pushBlock("ERROR", "decompress_dynamic (core/io/compression.cpp:295)", [V.str('Condition "p_mode != MODE_DEFLATE && p_mode != MODE_GZIP" is true. Returning: (-1)')]);
}

/** `decompress_dynamic()` 失败（S557）：外层统一一句 `Decompression failed.`，回空 pack。 */
export function packDynamicFailed(): Variant {
  return pushBlock("ERROR", "func_PackedByteArray_decompress_dynamic (core/variant/variant_call.cpp:844)", [V.str("Decompression failed.")]);
}

/** `to_vector2_array` / `to_vector3_array` / `to_color_array` 的长度不是整组（S553）：打一块 ERROR、回空 pack。 */
export function packSizeMultiple(fn: string, line: number, message: string): Variant {
  return pushBlock("ERROR", `${fn} (core/variant/variant_call.cpp:${String(line)})`, [V.str(message)]);
}

/** `get_stack()`：Array，每帧一支 Dictionary，键序固定 source / function / line，键实测是 String。 */
export function gGetStack(): Variant {
  const rows = stackFrames().map((f) => {
    const d = new GDict();
    d.set(V.str("source"), V.str(f.source));
    d.set(V.str("function"), V.str(f.fn));
    d.set(V.str("line"), V.int(f.line));
    return V.dict(d);
  });
  return V.array(GArray.of(rows));
}
