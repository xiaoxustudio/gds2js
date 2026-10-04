/** GDScript 的全局常量（`PI` / `TAU` / `INF` / `NAN` 与 `CONNECT_*`）：kind 是它的类型归类，value 是发射用的表达式文本。 */
export type GlobalConst = { kind: "float" | "int"; value: string };

/**
 * 实测「Godot 4.6.3 有这个名字、能过解析，但我们还没实现」的全局函数（一支脚本一个名字量出来的，
 * 不存在的会给 `Function "x()" not found in base self.`，那批不在这里）。
 * 随机数一族不进 `test:diff`：同一个 seed 的序列要复刻得先逆引擎的 PCG；`weakref` / `instance_from_id`
 * / `get_stack` 的打印带指针号，属「复现不了的打印」那一族。
 */
export const GLOBAL_TODO_FUNCTIONS: ReadonlySet<string> = new Set([
  "str_to_var",
  "type_convert",
  "convert",
  "weakref",
  "instance_from_id",
  "get_stack",
  "print_stack",
  "seed",
  "randomize",
  "randi",
  "randf",
  "randi_range",
  "randf_range",
  "randfn",
  // 4.6.3 实测「有这个名字、能过解析」的打印一族（`prints` 参数间一个空格、`printt` 一个制表符、`print_rich` 直接拼、
  // `print_verbose` 在 headless 下不出声、`push_warning` 的 `WARNING:` 那行实测走 stderr）：我们没实现，拒的措辞得是「我们拒」而不是「Godot 也没有」。
  "prints",
  "printt",
  "print_rich",
  "print_verbose",
  "push_error",
  "push_warning",
]);


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
