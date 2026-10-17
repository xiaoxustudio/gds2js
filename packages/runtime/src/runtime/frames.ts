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
