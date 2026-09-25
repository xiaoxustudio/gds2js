import { V, type Variant } from "./tags";

/**
 * 二维向量 —— GDScript 内建的数学类型。
 *
 * **分量是 32 位 float**（探针实测，不是打印造成的）：
 *   `Vector2(1e15, 0).x == 1e15` → **false**，`.x` 单独打印给 `999999986991104.0`；
 *   `Vector2(0.1, 0).x` → `0.10000000149012`；`Vector2(0.1,0) == Vector2(0.100000001,0)` → **true**。
 * 所以在构造处统一 `Math.fround`：算术结果也都是"新建一个 GVector2"，于是同样落到 float32，
 * 与 Godot 的 real_t=float 一致（`Vector2(1e15,1)*2` → `(1999999973982208.0, 2.0)` 实测）。
 *
 * 注意：打印**不**走通用浮点规则，另有 6 位小数的专用格式（见 values.ts 的 strVec2）。
 */
export class GVector2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
  }
}

export function vector2(x: number, y: number): Variant {
  return V.object(new GVector2(x, y));
}

/** 取向量实例，不是 Vector2 对象则 null（ops 里分派用）。 */
export function asVec2(v: Variant): GVector2 | null {
  return v.v instanceof GVector2 ? (v.v as GVector2) : null;
}
