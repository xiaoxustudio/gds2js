// Callable 的成员名表（读数 `tmp/probe-callable-names/sweep.mts` 二十四名 + `tmp/probe-binds-c/u.mts` 十格，
// 一名一名过 4.6.3 的裁判）。这一门钉的是语料看不见的那一侧：表外名要给引擎那句 `Nonexistent function`，
// 而不是我们的「未实现」自述 —— 被抄来的清单污染掉的四名（`from` / `get_object_instance_id` / `is_equal` / `unbind_many`）
// 在 4.6.3 根本没这名字（S247 早量到后两支，S298 量到 `unbind_many`，这一轮把整族过了一遍）。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { callableOf, nullCallable } from "@gds2js/runtime/runtime/object";
import type { Variant } from "@gds2js/runtime/runtime/tags";
import { method } from "@gds2js/runtime/runtime/methods";

const code = (c: Variant, name: string): string => {
  try {
    method(c, name, []);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code ?? "?"}] ${err.message ?? ""}`;
  }
};

const NONESUCH = (n: string): string => `[callable-method] Invalid call. Nonexistent function '${n}' in base 'Callable'.`;
const TODO = (n: string): string => `[callable-method] Callable.${n}() 未实现`;

describe("runtime/callable · 成员名表", () => {
  it("298 · 表外名给那句 Nonexistent（两种基同句），表内未实现的仍给「未实现」", async () => {
    const lam = callableOf((args: Variant[]): Variant => args[0] as Variant, 1);
    const nul = nullCallable();

    eq("298", "打错字的名：lambda 基（引擎 g_lambda：两种基同一句）", code(lam, "frobnicate"), NONESUCH("frobnicate"));
    eq("298", "打错字的名：空 Callable 基", code(nul, "frobnicate"), NONESUCH("frobnicate"));

    for (const n of ["from", "get_object_instance_id", "is_equal", "unbind_many"]) {
      eq("298", `${n} 是抄来的清单污染：4.6.3 没这名字`, [code(lam, n), code(nul, n)].join(" | "), `${NONESUCH(n)} | ${NONESUCH(n)}`);
    }

    for (const n of ["bindv", "create", "hash", "is_custom", "is_standard", "rpc", "rpc_id", "get_object_id", "unbind"]) {
      eq("298", `${n} 存在但我们没那个式子：仍给「未实现」`, code(lam, n), TODO(n));
    }

    eq("298", "表内已实现的不误伤（is_null 照发值）", String(((method(nul, "is_null", [])) as Variant).v), "true");
  });
});
