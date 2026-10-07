/** RID 这个结构体值：`typeof` 23、印 `RID(<id>)`、`get_id()` 回那个 int64。
 *  值只能从 `rid_from_int64()` / `rid_allocate_id()` 来（实测 `RID(int)` 那句是解析期拒：
 *  `No constructor of "RID" matches the signature "RID(int)"`），所以这里不发构造函数。 */
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

/** 实测 `rid_allocate_id()` 在新进程里从 13241 起、每调一次加一（三格连读 13241 / 13242 / 13243，另一份脚本首格同为 13241）。
 *  计数走 number：bigint 的 `+=` 在静态目标上报 SC1043（非数值、非字符串的比较式没有 lowering），而这段号远在 2^53 之内。 */
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
