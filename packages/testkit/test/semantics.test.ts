/**
 * testkit 的承重不变量。
 *
 * 这里只钉**通过路径**的口径。失败路径（记一笔红的、继续跑、最后一起报）没法在
 * 一个自身要绿的测试里验 —— expect.soft 会把红记在当前 test 上，无法撤销。
 * 那条靠负对照覆盖：故意把 ops 里一格期望值改坏，确认报 `通过 1508，失败 1`。
 */
import { describe, expect, it, TestRunner } from "vitest";
import { eq, isExpectedThrow, ok, shouldThrow } from "../src/assert";

function readCounters(): { pass: number; fail: number } {
  const meta = TestRunner.getCurrentTest()!.meta as Record<string, unknown>;
  return (meta.gds2jsAsserts ?? { pass: 0, fail: 0 }) as { pass: number; fail: number };
}

/** 造一个只有 name 对得上、并非真 UnsupportedError 实例的假错误。
 *  testkit 按 name 认而不按 instanceof 认，所以这个应当被接受 ——
 *  这正是它能不依赖 @gds2js/runtime（从而不成环）的代价与前提。 */
function fakeError(name: string, message: string): Error {
  return Object.assign(new Error(message), { name });
}

describe("testkit · String() 折叠口径", () => {
  it("eq 把 2 / 2n / \"2\" 视为相等（旧 String(actual)===String(expected) 的逐字口径）", () => {
    eq("c", "number vs string", 2, "2");
    eq("c", "bigint vs string", 2n, "2");
    eq("c", "number vs bigint", 2, 2n);
    eq("c", "bool vs string", true, "true");
    eq("c", "null vs string", null, "null");
    eq("c", "undefined vs string", undefined, "undefined");
    expect(readCounters().pass).toBe(6);
  });

  it("升级成类型化 matcher 就会红的那几格，在这里必须是绿的（钉住不许悄悄改口径）", () => {
    // 这三条是「保留 String()」这个决策的实体化：
    // toBe 会判 2 !== "2"、2n !== 2、true !== "true"。谁想升级口径，必须先来这里改。
    expect(2).not.toBe("2" as unknown as number);
    eq("c", "口径实体化 1", 2, "2");
    eq("c", "口径实体化 2", 2n, 2);
    eq("c", "口径实体化 3", true, "true");
    expect(readCounters().pass).toBe(3);
  });
});

describe("testkit · 错误识别按 name 不按 instanceof", () => {
  it("isExpectedThrow 认那两个 name，其余不认", () => {
    expect(isExpectedThrow(fakeError("UnsupportedError", "x"))).toBe(true);
    expect(isExpectedThrow(fakeError("GodotRuntimeError", "x"))).toBe(true);
    expect(isExpectedThrow(fakeError("TypeError", "x"))).toBe(false);
    expect(isExpectedThrow(new Error("x"))).toBe(false);
    expect(isExpectedThrow("不是 Error")).toBe(false);
    expect(isExpectedThrow(null)).toBe(false);
  });

  it("shouldThrow 接受 name 伪装的 UnsupportedError，并计入 pass", () => {
    shouldThrow("c", "伪装错误也算过", () => {
      throw fakeError("UnsupportedError", "String.count() 未实现");
    });
    shouldThrow("c", "GodotRuntimeError 也算过", () => {
      throw fakeError("GodotRuntimeError", "参数不够");
    });
    expect(readCounters().pass).toBe(2);
  });
});

describe("testkit · ok / bad 与计数", () => {
  it("ok 记 pass，计数落在当前 test 的 meta 上", () => {
    ok("条件为真");
    ok("显式传 true", true);
    const c = readCounters();
    expect(c.pass).toBe(2);
    expect(c.fail).toBe(0);
  });

  it("每个 it() 有自己独立的计数桶（isolate 下不串）", () => {
    // 上一格记了 2，这一格必须从 0 开始 —— 计数是按 test 存的，不是模块级全局。
    expect(readCounters().pass).toBe(0);
    ok("本格第一笔");
    expect(readCounters().pass).toBe(1);
  });
});
