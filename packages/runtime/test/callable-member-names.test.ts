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

/** 同一句式的取数版：元数守卫要读实参数，所以得有能带 args 的取句口。 */
const codeWith = (c: Variant, name: string, args: Variant[]): string => {
  try {
    method(c, name, args);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code ?? "?"}] ${err.message ?? ""}`;
  }
};

describe("runtime/callable · 成员名表", () => {
  it("298 · 表外名给那句 Nonexistent（两种基同句），表内未实现的仍给「未实现」", async () => {
    const lam = callableOf((args: Variant[]): Variant => args[0] as Variant, 1);
    const nul = nullCallable();

    eq("298", "打错字的名：lambda 基（引擎 g_lambda：两种基同一句）", code(lam, "frobnicate"), NONESUCH("frobnicate"));
    eq("298", "打错字的名：空 Callable 基", code(nul, "frobnicate"), NONESUCH("frobnicate"));

    for (const n of ["from", "get_object_instance_id", "is_equal", "unbind_many"]) {
      eq("298", `${n} 是抄来的清单污染：4.6.3 没这名字`, [code(lam, n), code(nul, n)].join(" | "), `${NONESUCH(n)} | ${NONESUCH(n)}`);
    }

    for (const n of ["rpc", "rpc_id"]) {
      eq("652", `${n} 在 lambda 基上给引擎那句 Nonexistent（不是「未实现」）`, code(lam, n), NONESUCH(n));
    }
    // `create` 的界是 [2,2]（引擎两支都要，S645 读数 f0 / f1 两向都报 Expected 2）：越界发那句元数，界内才轮到「未实现」
    eq("298", "create 界内仍给「未实现」", codeWith(lam, "create", [nul, nul]), TODO("create"));
    eq("645", "create 越界给引擎的元数句", code(lam, "create"), "[callable-arity] Invalid call to function 'create' in base 'Callable'. Expected 2 argument(s).");
    eq("645", "bindv 缺实参给同一句元数", code(lam, "bindv"), "[callable-arity] Invalid call to function 'bindv' in base 'Callable'. Expected 1 argument(s).");
    eq("645", "unbind 越界两向同一句、数取声明的全部", [code(lam, "unbind"), codeWith(lam, "unbind", [nul, nul, nul])].join(" | "),
      "[callable-arity] Invalid call to function 'unbind' in base 'Callable'. Expected 1 argument(s). | [callable-arity] Invalid call to function 'unbind' in base 'Callable'. Expected 1 argument(s).");
    eq("645", "is_null 给 1 支报 0", codeWith(lam, "is_null", [nul]), "[callable-arity] Invalid call to function 'is_null' in base 'Callable'. Expected 0 argument(s).");
    eq("645", "bind 是变参：零支原样收下", code(lam, "bind"), "没抛");
    eq("571", "hash 对 lambda 拒（宿主标识）", code(lam, "hash").startsWith("[hash-callable]"), true);
    eq("571", "get_object_id 对 lambda 拒（宿主脚本对象号）", code(lam, "get_object_id").startsWith("[callable-object-id-lambda]"), true);
    eq("571", "is_custom / is_standard 已发值", `${String(((method(lam, "is_custom", [])) as Variant).v)}/${String(((method(lam, "is_standard", [])) as Variant).v)}`, "true/false");

    eq("440", "unbind 已发货：不再给「未实现」那句", code(lam, "unbind") === TODO("unbind"), false);
    eq("298", "表内已实现的不误伤（is_null 照发值）", String(((method(nul, "is_null", [])) as Variant).v), "true");
  });
});
