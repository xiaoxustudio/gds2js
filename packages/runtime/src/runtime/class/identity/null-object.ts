import type { Variant } from "../../tags";

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

export class GdNullObject {
  readonly isNullRef = true;
}

export const NULL_OBJECT = new GdNullObject();

export function isNullRefValue(inner: unknown): boolean {
  return inner instanceof GdNullObject;
}

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
