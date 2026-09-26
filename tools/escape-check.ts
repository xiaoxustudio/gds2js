/**
 * 字符串转义的 lowering 自校验。
 *
 * 为什么单独一个工具而不是塞进语料：`\U110000`（越界）、`\U000000`（NUL）这些**合法**写法，
 * Godot 除了给对字符串还会往 stderr 打一行 `Unicode parsing error, ...`，而 golden 是
 * stdout+stderr 合流的 —— 放进语料就等于要求我们的产物也打印那条警告。所以这些只校"降出来的
 * 字符串值对不对"；能进语料的干净部分在 `corpus/cases/075-escape-unicode`（逐字节差分）。
 *
 * 每条期望值都来自 corpus 探针目录下对 Godot 4.6.3 的实测（长度与 `== String.chr(...)` 断言），
 * 不是照 JS/Unicode 常识推的。跑：node_modules/.bin/tsx tools/escape-check.ts
 */
import { parseSource } from "../src/parse/parser";
import { lower } from "../src/lower/lower";
import { UnsupportedError } from "../src/runtime/errors";

let pass = 0;
const fails: string[] = [];

/** 把 `var s = <源字面量>` 降成 IR，取回那个字符串值。 */
async function decode(literal: string): Promise<string> {
  const src = ["extends SceneTree", "", `var s = ${literal}`, ""].join("\n");
  const m = lower(await parseSource(src));
  const init = m.vars[0]?.init;
  if (!init || init.kind !== "lit" || init.lit !== "string") {
    throw new Error(`没降出字符串字面量：${literal}`);
  }
  return init.value as string;
}

async function eq(what: string, literal: string, expected: string): Promise<void> {
  try {
    const got = await decode(literal);
    if (got === expected) {
      pass++;
    } else {
      fails.push(`${what}：期望 ${JSON.stringify(expected)}，实得 ${JSON.stringify(got)}`);
    }
  } catch (e) {
    fails.push(`${what}：意外抛错 ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function throws(what: string, literal: string, code: string | null): Promise<void> {
  try {
    const got = await decode(literal);
    fails.push(`${what}：本该报 ${code}，却降出了 ${JSON.stringify(got)}`);
  } catch (e) {
    if (e instanceof UnsupportedError && (code === null || e.code === code)) pass++;
    else fails.push(`${what}：抛错了 ${e instanceof Error ? `${e.constructor?.name}: ${e.message}` : String(e)}`);
  }
}

const B = String.fromCharCode(92);
const A1 = String.fromCodePoint(0x10000);
const FFFD = String.fromCharCode(0xfffd);

// —— 越界与 NUL：Godot 都当合法字符串，只是额外警告一句（警告不进语料，见文件头）
await eq("\\U 越界一位换成 U+FFFD", `"${B}U110000"`, FFFD);
await eq("\\U 越界只换它自己那一位", `"a${B}U110001b"`, `a${FFFD}b`);
await eq("\\U000000 是真 NUL 不是 U+FFFD", `"${B}U000000"`, String.fromCharCode(0));
await eq("多处越界各自换一位", `"${B}U110000x${B}U110001"`, `${FFFD}x${FFFD}`);
// —— 相邻代理转义配成一个码点（实测 \uD800\uDC00、\U00D800\U00DC00、跨写法都等于 String.chr(0x10000)）
await eq("\\u 前置 + \\u 后续配对", `"${B}uD800${B}uDC00"`, A1);
await eq("\\U 前置 + \\U 后续配对", `"${B}U00D800${B}U00DC00"`, A1);
await eq("跨 \\u 与 \\U 也配", `"${B}uD800${B}U00DC00x"`, `${A1}x`);
await eq("配对结果两边还能接普通字符", `"x${B}U00D800${B}U00DC00y"`, `x${A1}y`);
// —— Godot 在解析期就拒的形式，我们也必须在解析期拒（放过去就是"编译成功但 Godot 跑不了"）
await throws("孤立前置代理", `"${B}uD800"`, "string-escape");
await throws("孤立后续代理", `"${B}uDC00"`, "string-escape");
await throws("\\U 写的孤立前置代理", `"${B}U00D800"`, "string-escape");
await throws("代理后面接普通字符仍算孤立", `"${B}uD800x"`, "string-escape");
await throws("\\U 少一位十六进制", `"${B}U0041"`, "string-escape");
await throws("\\U 五位也不够", `"${B}U00041"`, "string-escape");
// 这两条 tree-sitter 会先给 ERROR 节点（lower 报「顶层节点 ERROR 未支持」），同样是编译期拒绝，
// 只是错码不是 string-escape —— 断言"必须拒"就够，别把 CST 的报错口径也当成转义层的。
await throws("\\u 少一位", `"${B}u041"`, null);
await throws("\\u 后面不是十六进制", `"${B}uZZZZ"`, null);
await throws("\\x 不是 GDScript 的转义", `"${B}x41"`, "string-escape");

console.log(`转义自校验：通过 ${pass}，失败 ${fails.length}`);
if (fails.length > 0) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
