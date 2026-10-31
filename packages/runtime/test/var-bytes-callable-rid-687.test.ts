// `var_to_bytes` 的两支新编码（S687，#20 的前半；尺 `tmp/probe709/{bytes,decode}.mts` 十九格 + 语料 `432-var-bytes-callable-rid` 八格逐字节）：
// Callable **五种形**（`Callable(abs)` / 脚本方法 / 静态 / lambda / `Callable(h, "m")`）都只写一枚裸头部 `[25,0,0,0]`，
// 两支函数一字一样；解回来是**失效 Callable**（`typeof` 25、`is_valid()` false、印 `null::null`）。RID 写 `23` + int64 号。
// Signal 那一支量过了但**带对象的实例号**（`[26,…]` 尾巴上那八字节），合成号对不上引擎，照红线响亮拒。
import { describe, expect, it } from "vitest";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { CallableBox, isNullCallable } from "@gds2js/runtime/runtime/class/identity/callable";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { rid } from "@gds2js/runtime/runtime/class/identity/rid";
import { gBytesToVar, gVarToBytes, gVarToBytesWithObjects } from "@gds2js/runtime/runtime/var-bytes";
import type { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";

const bytesOf = (v: Variant): number[] => Array.from((v.v as GBytes).raw() as Iterable<number>);

describe("var-bytes · Callable 与 RID 的编码", () => {
  it("Callable 只写裸头部，两支函数一样", () => {
    const v = V.object(new CallableBox());
    expect(bytesOf(gVarToBytes(v))).toEqual([25, 0, 0, 0]);
    expect(bytesOf(gVarToBytesWithObjects(v))).toEqual([25, 0, 0, 0]);
  });

  it("那四字节解回来是失效 Callable", () => {
    const back = gBytesToVar(gVarToBytes(V.object(new CallableBox()))) as { v: unknown };
    expect(back.v).toBeInstanceOf(CallableBox);
    expect(isNullCallable(back.v as CallableBox)).toBe(true);
  });

  it("RID 写 23 加八字节号，读回来号不变", () => {
    expect(bytesOf(gVarToBytes(rid(0n)))).toEqual([23, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(bytesOf(gVarToBytes(rid(13241n)))).toEqual([23, 0, 0, 0, 185, 51, 0, 0, 0, 0, 0, 0]);
    const back = gBytesToVar(gVarToBytes(rid(13241n))) as { v: { id: bigint | number } };
    expect(String(back.v.id)).toBe("13241");
  });

  it("Signal 仍响亮拒（编码带实例号）", () => {
    expect(() => gVarToBytes(V.object(new Signal("pinged")))).toThrowError(/var_to_bytes\(\) 收到 Signal/);
  });
});
