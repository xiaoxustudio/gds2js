import { Tag, V, type Variant } from "./tags";
import { globalCallableLabel } from "./global-names";
import { nextObjectId } from "./identity";

/** Callable 盒子里的调用体：只收一个数组，不 rest、不 spread、不用可选形参。 */
export type Fn = (args: Variant[]) => unknown;

/** 延后队列的在途数：宿主退出前按它把「当前这一轮的延后」排干 —— 引擎连 quit() 之后排的延后都照跑，没到期的计时器则等不到（读数 `tmp/probe-drain/compare{94,95}.txt`）。 */
let deferredPending = 0;

export function deferredPendingCount(): number {
  return deferredPending;
}

export function callDeferred(run: () => void): void {
  deferredPending++;
  setTimeout(() => {
    try {
      run();
    } finally {
      deferredPending--;
    }
  }, 0);
}

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
  /** `bind()` 有没有被**调用过**：零实参的 `bind()` 也算绑过（实测四支都一样 —— `o.m.bind() == o.m`、`abs.bind() == abs`、`lam.bind() == lam` 全是假）。 */
  boundOnce: boolean;
  /** lambda 的等式是盒子身份，所以盒子得有自己的号。 */
  readonly gdObjectId: number = nextObjectId();
  constructor(
    fn: Fn | null = null,
    name: string | null = null,
    object: Variant | null = null,
    bound: Variant[] = [],
    arity: number | null = null,
    boundOnce = false,
  ) {
    this.fn = fn;
    this.name = name;
    this.object = object;
    this.bound = bound;
    this.arity = arity;
    this.boundOnce = boundOnce;
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

/**
 * `==` 上的 Callable 等式：比 `callableSame` 多一条「绑过没绑过」。
 * 实测 `p.m == p.m` 真、`p.m == p.bind(1)` **假**、`p.bind(1) == p.bind(2)` **真** ——
 * 绑定实参不进等式，但绑定状态进。`connect()` 的身份判定仍走 `callableSame`（S190 实测口径）。
 */
export function callableEq(a: CallableBox, b: CallableBox): boolean {
  if (!callableSame(a, b)) return false;
  return a.boundOnce === b.boundOnce;
}

/** `Callable()` 造出来的空 Callable：typeof 仍是 25。 */export function nullCallable(): Variant {
  return V.object(new CallableBox());
}

/**
 * Callable 的标签 —— 打印、`Invalid call to function '<标签> (Callable)'` 与 var_to_str 之外的那几处都吃同一串：
 * 空 Callable `null::null`、lambda `<anonymous lambda>(lambda)`、全局 `@GlobalScope::abs`（`len` 那批在 `@GDScript::`）、
 * 静态 `GDScript::<名>`、实例方法 `<原生基类>[(<脚本名>)]::<名>`（内部类没有括号那一截）。
 * 后两支要知道类的身份，`object.ts` 在 import 时把那段挂进来（本模块是叶子，反向 import 会成环）。
 */
let labelHook: ((box: CallableBox) => string | null) | null = null;

export function registerCallableLabelHook(f: (box: CallableBox) => string | null): void {
  labelHook = f;
}

export function callableLabel(box: CallableBox): string | null {
  if (isNullCallable(box)) return "null::null";
  if (box.name === null) return "<anonymous lambda>(lambda)";
  if (box.object === null) return globalCallableLabel(box.name);
  return labelHook === null ? null : labelHook(box);
}
