/** `Callable.rpc()` / `rpc_id()` 那两支名的句形（S652，读数 `tmp/probe653/{R0,R3,I3,L1,L3,L5}.gd` 一名一基一格一格过裁判）。
 *  两句都是引擎发得出来的，不是我们的自述：基是 lambda / 全局内建 → `Nonexistent function`，基是方法 / 静态 / 空 Callable → `on a null instance`。
 *  带不带实参不改句形（R0 零支与 R3 三支同句、L2 与 I3 同句）；内建类型面绑来的那一只（`Array::append.rpc()`）没量过，仍给「未实现」。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { callableOf, nullCallable } from "@gds2js/runtime/runtime/class/object/script-object";
import { CallableBox } from "@gds2js/runtime/runtime/class/identity/callable";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { method } from "@gds2js/runtime/runtime/methods";

const code = (c: Variant, name: string, args: Variant[] = []): string => {
  try {
    method(c, name, args);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code ?? "?"}] ${err.message ?? ""}`;
  }
};

const NONESUCH = (n: string): string => `[callable-method] Invalid call. Nonexistent function '${n}' in base 'Callable'.`;
const NULLINST = (n: string): string => `[callable-null-instance] Attempt to call function '${n}' in base 'Callable' on a null instance.`;
const TODO = (n: string): string => `[callable-method] Callable.${n}() 未实现`;

/** 方法 / 静态那一基：盒子里 `fn` 为空、`object` 有值（句形只读这两格，宿主值用不上）。 */
const hostOf = (): Variant => V.object(new CallableBox(null, "m", V.int(1), [], null, false, null, null));
const boundFace = (): Variant => V.object(new CallableBox(null, "append", V.int(1), [], null, false, "Array", [1, 1]));

describe("runtime/callable · rpc / rpc_id 的句形看基", () => {
  for (const n of ["rpc", "rpc_id"]) {
    it(`${n}：lambda 基给 Nonexistent`, () => {
      eq("652", `${n} 在 lambda 基上`, code(callableOf((a: Variant[]): Variant => a[0] as Variant, 1), n), NONESUCH(n));
    });
    it(`${n}：空 Callable 基给 null instance`, () => {
      eq("652", `${n} 在空 Callable 基上`, code(nullCallable(), n, n === "rpc_id" ? [V.int(1)] : []), NULLINST(n));
    });
    it(`${n}：方法 / 静态基给 null instance`, () => {
      eq("652", `${n} 在有宿主的方法基上`, code(hostOf(), n), NULLINST(n));
    });
    it(`${n}：带实参不改句形`, () => {
      eq("652", `${n} 三支实参同句`, code(hostOf(), n, [V.int(1), V.int(2), V.int(3)]), NULLINST(n));
      eq("652", `${n} lambda 基带实参同句`, code(callableOf((a: Variant[]): Variant => a[0] as Variant, 1), n, [V.int(7)]), NONESUCH(n));
    });
    it(`${n}：内建类型面绑来的那一只没量过，仍给「未实现」`, () => {
      eq("652", `${n} 在 Array::append 那一只上`, code(boundFace(), n), TODO(n));
    });
  }
});
