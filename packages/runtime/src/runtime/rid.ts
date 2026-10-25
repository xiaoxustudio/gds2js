import { Tag, V, normInt, type IntPayload, type Variant } from "./tags";

export class GdRid {
  readonly id: IntPayload;
  constructor(id: bigint) {
    this.id = normInt(id);
  }
}

export function rid(id: bigint): Variant {
  return V.object(new GdRid(id));
}

export function asRid(v: Variant): GdRid | null {
  return v.t === Tag.OBJECT && v.v instanceof GdRid ? (v.v as GdRid) : null;
}

let nextRid = 13241;

export function allocateRid(): bigint {
  const id = nextRid;
  nextRid = nextRid + 1;
  return BigInt(id);
}

/** 号就是值的全部内容：打印、等式与哈希都按它走（`RID(0)` / `RID(-1)` / `RID(9223372036854775807)` 都是实测原样）。 */
export function ridText(r: GdRid): string {
  return "RID(" + String(r.id) + ")";
}
