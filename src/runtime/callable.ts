import { Tag, V, type Variant } from "./tags";

/**
 * Callable 盒子：**一个有形状的类**，不是 `Record<string, unknown>`。
 * 换成类之前它是一张按符号键取值的记录，而静态编译目标上这四样全没有 lowering（全部实测 scriptc）：
 *  - `CALLABLE in inner` 这种**计算键**判定；
 *  - `box[CALLABLE]` 取出 `unknown` 再当函数调（`checked cast of 'unknown' to '(...) => unknown'`）；
 *  - `Function.prototype.bind` / `.apply`（方法 Callable 原先靠 `v.bind(inner)` 存「已绑好的函数」）；
 *  - `fn.length`（lambda 的声明形参数原先靠它）。
 * 现在：`fn` 收**一个数组**（不 rest、不 spread、不可选形参），方法 Callable 只存 `(object, name)`
 * 由 `method()` 按名派发，lambda 的形参数由发射器写进 `arity`。
 * 单独一个叶子模块，不 import `values.ts` / `object.ts`：`object.ts → values.ts` 已经是一条边，
 * 等式判据（`values.ts` 要用）再反向 import 就成了循环 —— 与 `numstr.ts`（S177）同一处理方式。
 */
export type Fn = (args: Variant[]) => unknown;

export class CallableBox {
  /** lambda 与「没有名字」的式子；**方法 / 静态方法 Callable 是 null**，靠 `(object, name)` 派发。 */
  fn: Fn | null;
  name: string | null;
  object: Variant | null;
  /** `Callable.bind(...)` 绑上去的实参（实测排在调用实参**之后**，S190）。 */
  bound: Variant[];
  /** 声明形参数；只有 lambda 用得上（方法那条走 `methodAritiesOf` 的表）。 */
  arity: number | null;
  constructor(
    fn: Fn | null = null,
    name: string | null = null,
    object: Variant | null = null,
    bound: Variant[] = [],
    arity: number | null = null,
  ) {
    this.fn = fn;
    this.name = name;
    this.object = object;
    this.bound = bound;
    this.arity = arity;
  }
}

/** 这个 OBJECT 载荷是一个 Callable 盒子吗？空 Callable（`Callable()`）也算。 */
export function isCallableBox(inner: unknown): inner is CallableBox {
  return inner instanceof CallableBox;
}

export function isCallable(v: Variant): boolean {
  return v.t === Tag.OBJECT && isCallableBox(v.v);
}

/**
 * 一个 Callable 盒子是不是**空**的（`Callable()` / `Callable().bind(...)`）。
 * 方法 Callable 的 `fn` 也是 null（派发靠名字），所以「空」的判据是**既没有式子也没有名字**。
 */
export function isNullCallable(box: CallableBox): boolean {
  return box.fn === null && box.name === null;
}

/**
 * Callable 的等式（`tmp/f97` d1 / d2 / d3 / d4 / d7 / c5，实测于 `==`、`!=` 与 `Array.has`）：
 * - 方法 Callable 比的是 **(接收者, 方法名)**：`o.add3 == o.add3` 真、`o.add3 == p.add3` 假、
 *   `Thing.sadd3 == Thing.sadd3` 真。两个盒子是**各自新建**的（读一次属性就新建一个），
 *   所以按 JS 引用比会一路判成假 —— 那是静默错，正是这一族最贵的一类；
 * - **绑定的实参不进等式**：`o.add3.bind(1) == o.add3.bind(2)` 是**真**（d3）。照着「连绑定串一起比」
 *   写就把这一格判成假；
 * - lambda 比 JS 引用：两个**同体** lambda `f == g` 是**假**（d2），同一个 var 自比真；
 * - 空 Callable 之间一律相等（c5：`Callable() == Callable()` 真、`!=` 假）。
 */
export function callableSame(a: CallableBox, b: CallableBox): boolean {
  if (isNullCallable(a) || isNullCallable(b)) return isNullCallable(a) && isNullCallable(b);
  if (a.name !== null && b.name !== null) {
    if (a.name !== b.name) return false;
    // 比**内层**而不是盒子本身：`o.add3` 读两次拿到的是两个新 Variant，包着同一个实例
    return (a.object?.v ?? null) === (b.object?.v ?? null);
  }
  if (a.name !== null || b.name !== null) return false;
  return a.fn === b.fn;
}

/** `Callable()` 造出来的**空 Callable**：typeof 仍是 25，谓词与方法面的实测口径见 `methods.ts`。 */
export function nullCallable(): Variant {
  return V.object(new CallableBox());
}
