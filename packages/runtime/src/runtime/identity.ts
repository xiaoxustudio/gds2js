/** 对象身份的发号器、「号 → 还活着的那个对象」的登记处，以及两个不用 class 的形状标记。
 *  号是我们自己按分配顺序发的稳定整数：同一次运行里同一对象恒等、不同对象不等，这套关系与引擎一致；
 *  数字本身与引擎那侧的号无关，所以带号的打印在语料两侧都先掩成 `<类名#号>` 再比。
 *  空对象引用与 weakref 的盒子做成**带标记字段的普通对象**：`class` 声明在静态编译目标上还没有 lowering，`instanceof` 跟着报 SC1090。 */
import type { Variant } from "./tags";

export interface GdIdentified {
  readonly gdObjectId: number;
}

let seq = 0;

const LIVE = new Map<number, object>();

export function nextObjectId(self?: object): number {
  seq += 1;
  if (self !== undefined) LIVE.set(seq, self);
  return seq;
}

/** 号还在就给出那个对象，不在给 null（引擎对没这个号、或对象已经没了的号都是这个答复）。 */
export function liveObjectOf(id: number): object | null {
  const hit = LIVE.get(id);
  if (hit === undefined) return null;
  return hit;
}

/** 引擎那个「空对象引用」：typeof 仍是 24、与 null 相等、印 `<Object#null>`。 */
export interface NullRef {
  gdNullRef: true;
}

export const NULL_OBJECT: NullRef = { gdNullRef: true };

export function isNullRefValue(inner: unknown): boolean {
  if (typeof inner !== "object" || inner === null) return false;
  return (inner as { gdNullRef?: boolean }).gdNullRef === true;
}

/** `weakref(x)` 的盒子：自己也占一个身份号（实测印 `<WeakRef#号>`），目标没了 `get_ref()` 就给 `<null>`。 */
export interface WeakRefBox {
  gdWeakRef: true;
  gdObjectId: number;
  target: Variant | null;
}

export function weakRefBox(target: Variant | null): WeakRefBox {
  const box: WeakRefBox = { gdWeakRef: true, gdObjectId: 0, target };
  box.gdObjectId = nextObjectId(box);
  return box;
}

export function isWeakRefBox(inner: unknown): inner is WeakRefBox {
  if (typeof inner !== "object" || inner === null) return false;
  return (inner as { gdWeakRef?: boolean }).gdWeakRef === true;
}
