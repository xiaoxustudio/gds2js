/**
 * 4.6.3 实测「能当值用的全局函数名」表（一支脚本一个名字量出来的：`tmp/probe-unknown-value/value_names.log`
 * 给能不能过解析与打印形状，`gc6.log` 给 `get_argument_count()` 与 `get_method()`，`gc7.log` 给变元的上下界）。
 * 类型名（`int` / `Vector2` / `PackedByteArray` 那 21 个）在值位置是**解析期就拒**的，一张都不在这表里。
 */
export type GlobalScopeTag = "GlobalScope" | "GDScript";

/** `scope` 是打印前缀那半截，`argc` 是 `get_argument_count()` 的读数，`bounds` 是 `.call()` 认的实参区间；`null` = 我们没实现那个式子，`.call` 响亮拒。 */
export type GlobalCallableRow = { scope: GlobalScopeTag; argc: number; bounds: readonly [number, number] | null };

const GS = (argc: number, bounds?: readonly [number, number]): GlobalCallableRow => ({
  scope: "GlobalScope",
  argc,
  bounds: bounds ?? [argc, argc],
});
const GD = (argc: number, bounds?: readonly [number, number]): GlobalCallableRow => ({
  scope: "GDScript",
  argc,
  bounds: bounds ?? [argc, argc],
});
/** Godot 有这个名字、能当值用，但我们还没那个式子：值与 `get_argument_count()` 照量到的发，`.call()` 拒。 */
const TODO = (scope: GlobalScopeTag, argc: number): GlobalCallableRow => ({ scope, argc, bounds: null });

export const GLOBAL_CALLABLES: Readonly<Record<string, GlobalCallableRow>> = Object.freeze({
  abs: GS(1),
  angle_difference: GS(2),
  ceil: GS(1),
  ceilf: GS(1),
  ceili: GS(1),
  clamp: GS(3),
  clampf: GS(3),
  clampi: GS(3),
  convert: GD(2),
  cubic_interpolate: GS(5),
  deg_to_rad: GS(1),
  ease: GS(2),
  exp: GS(1),
  floor: GS(1),
  floorf: GS(1),
  floori: GS(1),
  fmod: GS(2),
  fposmod: GS(2),
  get_stack: TODO("GDScript", 0),
  hash: GS(1),
  instance_from_id: TODO("GlobalScope", 1),
  inverse_lerp: GS(3),
  is_equal_approx: GS(2),
  is_finite: GS(1),
  is_inf: GS(1),
  is_nan: GS(1),
  is_zero_approx: GS(1),
  len: GD(1),
  lerp: GS(3),
  lerpf: GS(3),
  load: GD(1),
  log: GS(1),
  max: GS(2),
  maxf: GS(2),
  maxi: GS(2),
  min: GS(2),
  minf: GS(2),
  mini: GS(2),
  move_toward: GS(3),
  posmod: GS(2),
  pow: GS(2),
  print: TODO("GlobalScope", 1),
  print_rich: TODO("GlobalScope", 1),
  print_stack: TODO("GDScript", 0),
  print_verbose: TODO("GlobalScope", 1),
  prints: TODO("GlobalScope", 1),
  printt: TODO("GlobalScope", 1),
  push_error: TODO("GlobalScope", 1),
  push_warning: TODO("GlobalScope", 1),
  rad_to_deg: GS(1),
  randf: TODO("GlobalScope", 0),
  randf_range: TODO("GlobalScope", 2),
  randfn: TODO("GlobalScope", 2),
  randi: TODO("GlobalScope", 0),
  randi_range: TODO("GlobalScope", 2),
  randomize: TODO("GlobalScope", 0),
  range: GD(0, [1, 3]),
  remap: GS(5),
  round: GS(1),
  roundf: GS(1),
  roundi: GS(1),
  seed: TODO("GlobalScope", 1),
  sign: GS(1),
  signf: GS(1),
  signi: GS(1),
  smoothstep: GS(3),
  snapped: GS(2),
  snappedf: GS(2),
  snappedi: GS(2),
  sqrt: GS(1),
  str: GS(1, [1, Number.POSITIVE_INFINITY]),
  str_to_var: GS(1),
  type_convert: GS(2),
  typeof: GS(1),
  var_to_str: GS(1),
  weakref: TODO("GlobalScope", 1),
  wrapf: GS(3),
  wrapi: GS(3),
});

/** 这 78 个名字在值位置合法（实测一律 `typeof 25`）：分析器放行、发射器据此发全局 Callable 的唯一依据。 */
export const GLOBAL_VALUE_NAMES: ReadonlySet<string> = new Set(Object.keys(GLOBAL_CALLABLES));

/** 打印形式与那句 `Invalid call to function '… (Callable)'` 里的函数标签：实测是 `@<注册表>::<名字>`，`len` / `load` / `range` / `convert` / `get_stack` / `print_stack` 在 `@GDScript` 那侧。 */
export function globalCallableLabel(name: string): string | null {
  const row = GLOBAL_CALLABLES[name];
  return row === undefined ? null : `@${row.scope}::${name}`;
}

/** 全局 Callable 的行；不是这 78 个名字之一给 null。 */
export function globalCallableRow(name: string | null): GlobalCallableRow | null {
  if (name === null) return null;
  return GLOBAL_CALLABLES[name] ?? null;
}
