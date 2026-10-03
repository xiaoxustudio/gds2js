import { Tag, V, type Variant } from "./tags";

/** Callable 盒子里的调用体：只收一个数组，不 rest、不 spread、不用可选形参。 */
export type Fn = (args: Variant[]) => unknown;

/** Callable 盒子：有形状的类，不是按符号键取值的记录；本模块是叶子，不 import `values.ts` / `object.ts`（会成环）。 */
export class CallableBox {
  /** lambda 与「没有名字」的式子；**方法 / 静态方法 Callable 是 null**，靠 `(object, name)` 派发。 */
  fn: Fn | null;
  name: string | null;
  object: Variant | null;
  /** `Callable.bind(...)` 绑上去的实参：排在调用实参之后。 */
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

/** 盒子是否为空 Callable（`Callable()` / `Callable().bind(...)`）：方法 Callable 的 `fn` 也是 null，所以判据是既没有式子也没有名字。 */
export function isNullCallable(box: CallableBox): boolean {
  return box.fn === null && box.name === null;
}

/** Callable 的等式：方法比 (接收者, 方法名)，绑定的实参不进等式，lambda 比 JS 引用，空 Callable 之间一律相等。 */
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

/** `Callable()` 造出来的空 Callable：typeof 仍是 25。 */
export function nullCallable(): Variant {
  return V.object(new CallableBox());
}
