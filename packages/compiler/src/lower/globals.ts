/** GDScript 的全局常量（`PI` / `TAU` / `INF` / `NAN` 与 `CONNECT_*`）：kind 是它的类型归类，value 是发射用的表达式文本。 */
export type GlobalConst = { kind: "float" | "int"; value: string };

/**
 * 实测「Godot 4.6.3 有这个名字、能过解析，但我们还没实现」的全局函数（一支脚本一个名字量出来的，
 * 不存在的会给 `Function "x()" not found in base self.`，那批不在这里）。
 * 带实例号的那一族（`weakref` / `instance_from_id` / `is_instance_*`）已按 S263 的合成号口径发出，不在这张清单里。
 */
export const GLOBAL_TODO_FUNCTIONS: ReadonlySet<string> = new Set([
  "get_stack",
  "print_debug",
  "print_stack",
  "push_error",
  "push_warning",
  // 4.6.3 一支一名扫出来的第二批（`tmp/probe-global-names/sweep.log`：133 个候选里 44 支解析期合法、我们没实现）。
  // 少了这一批，`sin(0.5)` 这种合法调用会被报成 `[call-unknown]`「Godot 也没有这个名字」—— 那是假话，而且值位置还会被误拦。
  "bytes_to_var",
  "bytes_to_var_with_objects",
  "dict_to_inst",
  "inst_to_dict",
  "is_instance_of",
  "var_to_bytes",
  "var_to_bytes_with_objects",
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
  // Variant.Type 那 39 支：名字与数字全从 4.6.3 里量出来（S233），每支都与 `typeof()` 同格对上。
  // 12 / 13 / 19 在引擎里没有名字（不是漏抄）；`TYPE_LAMBDA` 与 `TYPE_CONST` 实测不存在，解析期就 `Identifier not declared`。
  TYPE_NIL: { kind: "int", value: "0" },
  TYPE_BOOL: { kind: "int", value: "1" },
  TYPE_INT: { kind: "int", value: "2" },
  TYPE_FLOAT: { kind: "int", value: "3" },
  TYPE_STRING: { kind: "int", value: "4" },
  TYPE_VECTOR2: { kind: "int", value: "5" },
  TYPE_VECTOR2I: { kind: "int", value: "6" },
  TYPE_RECT2: { kind: "int", value: "7" },
  TYPE_RECT2I: { kind: "int", value: "8" },
  TYPE_VECTOR3: { kind: "int", value: "9" },
  TYPE_VECTOR3I: { kind: "int", value: "10" },
  TYPE_TRANSFORM2D: { kind: "int", value: "11" },
  TYPE_PLANE: { kind: "int", value: "14" },
  TYPE_QUATERNION: { kind: "int", value: "15" },
  TYPE_AABB: { kind: "int", value: "16" },
  TYPE_BASIS: { kind: "int", value: "17" },
  TYPE_TRANSFORM3D: { kind: "int", value: "18" },
  TYPE_COLOR: { kind: "int", value: "20" },
  TYPE_STRING_NAME: { kind: "int", value: "21" },
  TYPE_NODE_PATH: { kind: "int", value: "22" },
  TYPE_RID: { kind: "int", value: "23" },
  TYPE_OBJECT: { kind: "int", value: "24" },
  TYPE_CALLABLE: { kind: "int", value: "25" },
  TYPE_SIGNAL: { kind: "int", value: "26" },
  TYPE_DICTIONARY: { kind: "int", value: "27" },
  TYPE_ARRAY: { kind: "int", value: "28" },
  TYPE_PACKED_BYTE_ARRAY: { kind: "int", value: "29" },
  TYPE_PACKED_INT32_ARRAY: { kind: "int", value: "30" },
  TYPE_PACKED_INT64_ARRAY: { kind: "int", value: "31" },
  TYPE_PACKED_FLOAT32_ARRAY: { kind: "int", value: "32" },
  TYPE_PACKED_FLOAT64_ARRAY: { kind: "int", value: "33" },
  TYPE_PACKED_STRING_ARRAY: { kind: "int", value: "34" },
  TYPE_PACKED_VECTOR2_ARRAY: { kind: "int", value: "35" },
  TYPE_PACKED_VECTOR3_ARRAY: { kind: "int", value: "36" },
  TYPE_PACKED_COLOR_ARRAY: { kind: "int", value: "37" },
  TYPE_PACKED_VECTOR4_ARRAY: { kind: "int", value: "38" },
  TYPE_MAX: { kind: "int", value: "39" },
});

export function isGlobalConst(name: string): boolean {
  return Object.hasOwn(GLOBAL_CONSTANTS, name);
}
