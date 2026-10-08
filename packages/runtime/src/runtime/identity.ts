/** 对象身份的发号器与「号 → 还活着的那个对象」的登记处。
 *  号是我们自己按分配顺序发的稳定整数：同一次运行里同一对象恒等、不同对象不等，
 *  这套关系与引擎一致；数字本身与引擎那侧的号无关，所以带号的打印在语料两侧都先掩成 `<类名#号>` 再比。 */
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
export class GdNullObject {
  readonly isNullRef = true;
}

export const NULL_OBJECT = new GdNullObject();

export function isNullRefValue(inner: unknown): boolean {
  return inner instanceof GdNullObject;
}

/** `weakref(x)` 的盒子：自己也占一个身份号（实测印 `<WeakRef#号>`），目标没了 `get_ref()` 就给 `<null>`。 */
export class WeakRefBox {
  readonly gdObjectId: number = nextObjectId(this);
  constructor(readonly target: Variant | null) {}
}

export function weakRefBox(target: Variant | null): WeakRefBox {
  return new WeakRefBox(target);
}

export function isWeakRefBox(inner: unknown): inner is WeakRefBox {
  return inner instanceof WeakRefBox;
}

/** `bytes_to_var()` 读到「身份直写」那一支 OBJECT 时造的盒子：自己占一个号（实测印 `<EncodedObjectAsID#号>`），
 *  `get_object_id()` 给的是字节里那个号，与盒子自己的号无关（S285 ②）。 */
export class EncodedObjectIdBox {
  readonly gdObjectId: number = nextObjectId(this);
  constructor(readonly storedId: number | bigint) {}
}

export function encodedObjectIdBox(storedId: number | bigint): EncodedObjectIdBox {
  return new EncodedObjectIdBox(storedId);
}

export function isEncodedObjectIdBox(inner: unknown): inner is EncodedObjectIdBox {
  return inner instanceof EncodedObjectIdBox;
}
