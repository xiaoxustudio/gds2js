import { Tag, V, type Variant } from "./tags";
import { globalCallableLabel } from "./global-names";
import { nextObjectId } from "./identity";

export type Fn = (args: Variant[]) => unknown;

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

export class CallableBox {
  fn: Fn | null;
  name: string | null;
  object: Variant | null;
  bound: Variant[];
  arity: number | null;
  boundOnce: boolean;
  readonly gdObjectId: number = nextObjectId();
  builtin: string | null;
  builtinBounds: [number, number] | null;
  builtinSnap: Variant | null;
  unbindCount: number;
  defaultCount: number;
  detachedOwner: string | null;
  invalidMethod: boolean;
  constructor(
    fn: Fn | null = null,
    name: string | null = null,
    object: Variant | null = null,
    bound: Variant[] = [],
    arity: number | null = null,
    boundOnce = false,
    builtin: string | null = null,
    builtinBounds: [number, number] | null = null,
    defaultCount = 0,
    builtinSnap: Variant | null = null,
    unbindCount = 0,
    detachedOwner: string | null = null,
    invalidMethod = false,
  ) {
    this.fn = fn;
    this.name = name;
    this.object = object;
    this.bound = bound;
    this.arity = arity;
    this.boundOnce = boundOnce;
    this.builtin = builtin;
    this.builtinBounds = builtinBounds;
    this.defaultCount = defaultCount;
    this.builtinSnap = builtinSnap;
    this.unbindCount = unbindCount;
    this.detachedOwner = detachedOwner;
    this.invalidMethod = invalidMethod;
  }
}

export function boundBuiltinCallable(recv: Variant, face: string, name: string, min: number, max: number): Variant {
  return V.object(new CallableBox(null, name, recv, [], null, false, face, [min, max], 0, boundSnapHook === null ? null : boundSnapHook(recv)));
}

let boundSnapHook: ((recv: Variant) => Variant | null) | null = null;

export function registerBoundSnapshotHook(f: (recv: Variant) => Variant | null): void {
  boundSnapHook = f;
}

/** 这个 OBJECT 载荷是一个 Callable 盒子吗？空 Callable（`Callable()`）也算。 */
export function isCallableBox(inner: unknown): inner is CallableBox {
  return inner instanceof CallableBox;
}

export function isCallable(v: Variant): boolean {
  return v.t === Tag.OBJECT && isCallableBox(v.v);
}

export function isNullCallable(box: CallableBox): boolean {
  return box.fn === null && box.name === null;
}

let recvEqHook: ((a: Variant, b: Variant) => boolean) | null = null;

export function registerRecvEqHook(f: (a: Variant, b: Variant) => boolean): void {
  recvEqHook = f;
}

export function callableSame(a: CallableBox, b: CallableBox): boolean {
  if (isNullCallable(a) || isNullCallable(b)) return isNullCallable(a) && isNullCallable(b);
  if (a.invalidMethod || b.invalidMethod) {
    return a.invalidMethod && b.invalidMethod && a.name === b.name && (a.object?.v ?? null) === (b.object?.v ?? null);
  }
  if (a.detachedOwner !== null || b.detachedOwner !== null) {
    return a.detachedOwner !== null && b.detachedOwner !== null && a.detachedOwner === b.detachedOwner && a.name === b.name;
  }
  if (a.name !== null && b.name !== null) {
    if (a.name !== b.name) return false;
    if (a.builtin !== null && b.builtin !== null && recvEqHook !== null) {
      const x = a.builtinSnap ?? a.object;
      const y = b.builtinSnap ?? b.object;
      if (x !== null && y !== null) return recvEqHook(x, y);
    }
    return (a.object?.v ?? null) === (b.object?.v ?? null);
  }
  if (a.name !== null || b.name !== null) return false;
  return a.fn === b.fn;
}

export function callableEq(a: CallableBox, b: CallableBox): boolean {
  if (!callableSame(a, b)) return false;
  if (a.boundOnce !== b.boundOnce) return false;
  return a.unbindCount === b.unbindCount;
}

export function nullCallable(): Variant {
  return V.object(new CallableBox());
}

let labelHook: ((box: CallableBox) => string | null) | null = null;

export function registerCallableLabelHook(f: (box: CallableBox) => string | null): void {
  labelHook = f;
}

export function callableLabel(box: CallableBox): string | null {
  if (isNullCallable(box)) return "null::null";
  if (box.detachedOwner !== null) return `${box.detachedOwner}::${String(box.name)}`;
  if (box.name === null) return "<anonymous lambda>(lambda)";
  if (box.object === null) return globalCallableLabel(box.name);
  return labelHook === null ? null : labelHook(box);
}
