import { V, type Variant } from "./tags";

/**
 * 二维向量 —— GDScript 内建的数学类型。
 * Tier 1 只做最小集：加 / 减 / 取负 / 相等 / 打印。
 * 乘除、点积、normalize 这些等真有用例再补（没有实测依据就不写）。
 */
export class GVector2 {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export function vector2(x: number, y: number): Variant {
  return V.object(new GVector2(x, y));
}
