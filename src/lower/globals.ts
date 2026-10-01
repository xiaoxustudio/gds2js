/**
 * GDScript 的**全局常量**（`PI` / `TAU` / `INF` / `NAN` 与 `CONNECT_*`），`tmp/f99` / `tmp/f99b` 量出来的。
 *
 * 两条实现约束都是量出来的，不是设计偏好：
 * - **值**：`PI == 3.141592653589793` 真、`TAU == PI * 2.0` 真、`TAU == 6.283185307179586` 真
 *   （p05），而**打印**是 `3.14159265358979` / `6.28318530717959` —— 那是 float 的渲染口径
 *   （S124 那一族），所以这里存的必须是同一个 double，不能存「印出来的那个数」，
 *   否则 `PI == 3.14159265358979` 会从 false 变成 true（p05 r1 两格就是用来分辨这两种的）。
 * - **遮蔽**：`const PI = 1`（p10）与函数里的 `var PI = 5`（p12）都**合法**且盖住全局，
 *   所以发射器不能把 `PI` 折成字面量 —— 折了就绕过 JS 的作用域、把用户自己的那一格静默吃掉。
 *   形状是「产物顶层 `const PI = …`，只在模块真的裸引用了这个名字时才发」：
 *   局部 `var PI` 在 JS 里自然遮蔽它，模块级 `const PI` 走 `this.PI` 那条分支、也就不会产生引用。
 */
export type GlobalConst = { kind: "float" | "int"; value: string };

export const GLOBAL_CONSTANTS: Readonly<Record<string, GlobalConst>> = Object.freeze({
  // typeof 3（float）
  PI: { kind: "float", value: "3.141592653589793" },
  TAU: { kind: "float", value: "6.283185307179586" },
  INF: { kind: "float", value: "Number.POSITIVE_INFINITY" },
  NAN: { kind: "float", value: "Number.NaN" },
  // typeof 2（int）。值与**行为**是两件事：行为见 runtime/signal.ts 的 `connectTo`（S194）。
  CONNECT_DEFERRED: { kind: "int", value: "1" },
  CONNECT_PERSIST: { kind: "int", value: "2" },
  CONNECT_ONE_SHOT: { kind: "int", value: "4" },
  CONNECT_REFERENCE_COUNTED: { kind: "int", value: "8" },
});

export function isGlobalConst(name: string): boolean {
  return Object.hasOwn(GLOBAL_CONSTANTS, name);
}
