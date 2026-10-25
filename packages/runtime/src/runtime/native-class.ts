import { V, Tag, type Variant } from "./tags";
import { nextObjectId } from "./identity";

export class GdNativeClass {
  readonly gdObjectId: number = nextObjectId();
  constructor(readonly className: string) {}
}

const BOXES = new Map<string, Variant>();

export function nativeClass(name: string): Variant {
  const hit = BOXES.get(name);
  if (hit !== undefined) return hit;
  const boxed = V.object(new GdNativeClass(name));
  BOXES.set(name, boxed);
  return boxed;
}

export function isNativeClass(v: Variant): boolean {
  return v.t === Tag.OBJECT && v.v instanceof GdNativeClass;
}

export function asNativeClass(v: Variant): GdNativeClass | null {
  return v.t === Tag.OBJECT && v.v instanceof GdNativeClass ? v.v : null;
}
