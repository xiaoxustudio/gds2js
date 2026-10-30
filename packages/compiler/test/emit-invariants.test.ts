/**
 * 发射器输出的两条**互锁不变量**（从 tools/compile.ts 的守卫段迁出，此后 compile.ts 是纯
 * codegen；这两条也从「记得跑 test:compile 才执行」升格成快层 `pnpm test` 每次都跑）。
 *
 * ① pack codec 口径互锁：扫产物文本得到的 `NEED_ZSTD_TEXT` 与 lowering 记下的
 *    `ir.usesPackCodec` 必须逐用例一致。两条判据**互相独立**（一条看发射出来的字符串、
 *    一条看 IR 标志），合拍才有意义 —— 分叉意味着 scriptc 侧「该不该加 --dynamic」
 *    与 IR 判断不再同源。
 * ② 自兜底：带 autoRun 尾巴的产物必须自己含 `rt.reportRunFailure(`。直接跑产物
 *    （`node dist/x.mts`、scriptc 出的原生 exe）时外面没有 CLI 那层 try/catch，
 *    缺兜底就是一条 Uncaught 栈加一坨退出码，而不是响亮的一行 runtime error。
 *
 * 与 emit-guards.test.ts 同理：只用「产物文本里有没有那段形状」这一条判据，产物的**具体
 * 说明符字符串不参与断言**，所以用探测用的 EMIT_OPTS_PROBE，不复制 compile.ts 里那个冻结的
 * GEN_EMIT_OPTS（emitter.ts:264-265 只把两个 specifier 当字符串嵌进产物、不做校验）。
 */
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit";
import { NO_ANALYSIS } from "@gds2js/compiler/analyze/analysis-result";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { ENTRY_TAIL, FALLBACK_TAIL, NEED_ZSTD_TEXT } from "../../../test/support/pack-codec";
import { cases, caseScript } from "./support/corpus";

const EMIT_OPTS_PROBE = { runtimeImport: "rt", hostImport: "host" };

expect(cases.length, `单文件用例数不对劲（${cases.length}），语料根算歪了？`).toBeGreaterThan(200);

let packCodecChecked = 0;
let fallbackChecked = 0;
const packCodecMismatch: string[] = [];
const runFallbackMissing: string[] = [];

describe("发射器输出的互锁不变量", () => {
  it.each(cases)("%s", async (id) => {
    const src = readFileSync(caseScript(id), "utf8");
    let ir;
    try {
      ir = lower(await parseSource(src));
    } catch (e) {
      // 语义分析/下推就拦下的用例没有产物可验；旧实现同样是在 emitModule 成功之后才跑这两条判据。
      if (e instanceof UnsupportedError) return;
      throw e;
    }
    let gen: string;
    try {
      gen = emitModule(ir, EMIT_OPTS_PROBE, NO_ANALYSIS);
    } catch (e) {
      if (e instanceof UnsupportedError) return; // emitter 缺口那 69 例走占位文件，同样没有产物
      throw e;
    }

    packCodecChecked++;
    const saysZstd = NEED_ZSTD_TEXT.test(gen);
    const flagSays = ir.usesPackCodec === true;
    if (saysZstd !== flagSays) {
      packCodecMismatch.push(`${id}: 文本=${String(saysZstd)} / IR=${String(flagSays)}`);
    }
    expect(saysZstd, `${id} pack codec 口径不一致：文本=${String(saysZstd)} IR=${String(flagSays)}`).toBe(flagSays);

    if (ENTRY_TAIL.test(gen)) {
      fallbackChecked++;
      if (!FALLBACK_TAIL.test(gen)) runFallbackMissing.push(id);
      expect(FALLBACK_TAIL.test(gen), `${id} 有 autoRun 尾巴却没 reportRunFailure 兜底`).toBe(true);
    }
  });
});

afterAll(() => {
  // 两行读数逐字沿用 tools/compile.ts 原样（含前导两空格），归档件里按名字记的读数序列仍可 grep。
  console.log(
    `  pack codec 口径不一致 ${packCodecMismatch.length}（文本 regex vs IR 标志，应为 0）` +
      `${packCodecMismatch.length > 0 ? "：" + packCodecMismatch.join(", ") : ""}`,
  );
  console.log(
    `  自兜底缺失 ${runFallbackMissing.length}（有 autoRun 尾巴却没 reportRunFailure，应为 0）` +
      `${runFallbackMissing.length > 0 ? "：" + runFallbackMissing.join(", ") : ""}`,
  );
  console.log(`  （两条判据各验了 ${packCodecChecked} / ${fallbackChecked} 例有产物的用例）`);
});
