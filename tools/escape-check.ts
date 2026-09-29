import { parseSource } from "../src/parse/parser";
import { lower } from "../src/lower/lower";
import { UnsupportedError } from "../src/runtime/errors";

let pass = 0;
const fails: string[] = [];

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

await eq("\\U 越界一位换成 U+FFFD", `"${B}U110000"`, FFFD);
await eq("\\U 越界只换它自己那一位", `"a${B}U110001b"`, `a${FFFD}b`);
await eq("\\U000000 被换成 U+FFFD（Godot 不允许串里留真 NUL）", `"${B}U000000"`, FFFD);
await eq("\\u0000 同样换成 U+FFFD", `"${B}u0000"`, FFFD);
await eq("多处越界各自换一位", `"${B}U110000x${B}U110001"`, `${FFFD}x${FFFD}`);
await eq("\\u 前置 + \\u 后续配对", `"${B}uD800${B}uDC00"`, A1);
await eq("\\U 前置 + \\U 后续配对", `"${B}U00D800${B}U00DC00"`, A1);
await eq("跨 \\u 与 \\U 也配", `"${B}uD800${B}U00DC00x"`, `${A1}x`);
await eq("配对结果两边还能接普通字符", `"x${B}U00D800${B}U00DC00y"`, `x${A1}y`);
await throws("孤立前置代理", `"${B}uD800"`, "string-escape");
await throws("孤立后续代理", `"${B}uDC00"`, "string-escape");
await throws("\\U 写的孤立前置代理", `"${B}U00D800"`, "string-escape");
await throws("代理后面接普通字符仍算孤立", `"${B}uD800x"`, "string-escape");
await throws("\\U 少一位十六进制", `"${B}U0041"`, "string-escape");
await throws("\\U 五位也不够", `"${B}U00041"`, "string-escape");
await throws("\\u 少一位", `"${B}u041"`, null);
await throws("\\u 后面不是十六进制", `"${B}uZZZZ"`, null);
await throws("\\x 不是 GDScript 的转义", `"${B}x41"`, "string-escape");

console.log(`转义自校验：通过 ${pass}，失败 ${fails.length}`);
if (fails.length > 0) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
