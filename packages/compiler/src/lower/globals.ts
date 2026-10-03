/** GDScript 的全局常量（`PI` / `TAU` / `INF` / `NAN` 与 `CONNECT_*`）：kind 是它的类型归类，value 是发射用的表达式文本。 */
export type GlobalConst = { kind: "float" | "int"; value: string };

export const GLOBAL_CONSTANTS: Readonly<Record<string, GlobalConst>> = Object.freeze({
  // typeof 3（float）
  PI: { kind: "float", value: "3.141592653589793" },
  TAU: { kind: "float", value: "6.283185307179586" },
  INF: { kind: "float", value: "Number.POSITIVE_INFINITY" },
  NAN: { kind: "float", value: "Number.NaN" },
  // typeof 2（int）
  CONNECT_DEFERRED: { kind: "int", value: "1" },
  CONNECT_PERSIST: { kind: "int", value: "2" },
  CONNECT_ONE_SHOT: { kind: "int", value: "4" },
  CONNECT_REFERENCE_COUNTED: { kind: "int", value: "8" },
});

export function isGlobalConst(name: string): boolean {
  return Object.hasOwn(GLOBAL_CONSTANTS, name);
}
