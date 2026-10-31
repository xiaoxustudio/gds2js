import { V, Tag, type Variant } from "../../tags";
import { nextObjectId } from "./null-object";
import { CallableBox } from "./callable";

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

const NEW_CTOR_ARITIES = new Map<object, number>();
const NEW_BOXES = new Map<string, Variant>();

export function nativeClassNew(name: string, args: number): Variant {
  const base = nativeClass(name);
  const hit = NEW_BOXES.get(name);
  if (hit !== undefined) return hit;
  NEW_CTOR_ARITIES.set(base.v as object, args);
  const boxed = V.object(new CallableBox(null, "new", base, [], null));
  NEW_BOXES.set(name, boxed);
  return boxed;
}

export function nativeClassNewArgs(target: unknown): number | null {
  if (target === null || typeof target !== "object") return null;
  return NEW_CTOR_ARITIES.get(target) ?? null;
}

export function isNativeClass(v: Variant): boolean {
  return v.t === Tag.OBJECT && v.v instanceof GdNativeClass;
}

export function asNativeClass(v: Variant): GdNativeClass | null {
  return v.t === Tag.OBJECT && v.v instanceof GdNativeClass ? v.v : null;
}
