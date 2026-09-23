import { V } from "./tags";
import { GArray } from "./values";

/** range(end) / range(start, end) / range(start, end, step) */
export function range(a: number, b?: number, step = 1): GArray {
  let start = 0;
  let end = a;
  if (b !== undefined) {
    start = a;
    end = b;
  }
  if (step === 0) throw new Error("range 的步长不能为 0");
  const items = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) items.push(V.int(i));
  } else {
    for (let i = start; i > end; i += step) items.push(V.int(i));
  }
  return GArray.of(items);
}
