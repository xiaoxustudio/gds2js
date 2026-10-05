import { wrapValue } from "@gds2js/runtime/runtime/object";
import type { Variant } from "@gds2js/runtime/runtime/tags";

/** 手写的类没有发射器，自己给一张与产物同形状的按名派发表。 */
export function gdDispatchByName(self: object, name: string, args: Variant[]): Variant | null {
  const f = (self as Record<string, unknown>)[name];
  return typeof f === "function" ? wrapValue((f as (...a: Variant[]) => unknown).apply(self, args)) : null;
}
