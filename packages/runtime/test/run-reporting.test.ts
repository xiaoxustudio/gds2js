// 由 tools/ops-check.ts 机械搬迁：region 3401-3437。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { afterEach, describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { GodotRuntimeError, UnsupportedError, claimRunReporting, errOf, releaseRunReporting, reportRunFailure } from "@gds2js/runtime/runtime/errors";

describe("runtime/errors · 报错归谁报的三种声明形状", () => {
  it("run-fallback · 报错归谁报的三种声明形状", async () => {
    const probeFailure = (owner: string | undefined) => {
      const prev = claimRunReporting();
      const prevCode = process.exitCode;
      const realErr = process.stderr.write.bind(process.stderr);
      let written = "";
      let exitCodeSeen: unknown = undefined;
      let rethrown = "";
      releaseRunReporting(owner);
      process.stderr.write = ((chunk: unknown) => {
        written += String(chunk);
        return true;
      }) as typeof process.stderr.write;
      try {
        reportRunFailure(new UnsupportedError("string-method", "String.count() 未实现"));
      } catch (e) {
        rethrown = e instanceof UnsupportedError ? `rethrown:${e.code}` : "rethrown:other";
      } finally {
        exitCodeSeen = process.exitCode;
        process.stderr.write = realErr;
        releaseRunReporting(prev);
        process.exitCode = prevCode;
      }
      return `${written.trim() === "" ? "quiet" : written} | ${rethrown} | exit=${String(exitCodeSeen)}`;
    };

    eq("run-fallback", "errOf 认 name 不认实例（CLI 与产物吃两份 runtime 副本时也带 code）", errOf(Object.assign(new Error("String.count() 未实现"), { name: "UnsupportedError", code: "string-method" })), "[string-method] String.count() 未实现");
    eq("run-fallback", "errOf 对别的 Error 只给正文，不硬凑方括号", errOf(new GodotRuntimeError("arity", "参数不够")), "参数不够");
    eq("run-fallback", "同进程宿主声明了「归我报」：原样再抛、一声不印", probeFailure("in-process"), "quiet | rethrown:string-method | exit=undefined");
    eq("run-fallback", "隔进程宿主声明过：只写正文，皮由父进程披", probeFailure("child"), "[string-method] String.count() 未实现\n |  | exit=1");
    eq(
      "run-fallback",
      "谁都没声明（直接跑产物）：补一句 runtime error",
      probeFailure(undefined),
      "  runtime error  [string-method] String.count() 未实现\n |  | exit=1",
    );
  });

  // reportRunFailure 会写 process.exitCode，claim/release 会写 process.env.GDS2JS_RUN_OWNER。
  // 两处都在探针自己的 finally 里还原；这里再兜一道，别让漏网的声明串到别的文件。
  afterEach(() => {
    delete process.env.GDS2JS_RUN_OWNER;
  });
});
