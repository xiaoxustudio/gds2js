/**
 * Godot 数组排序的**逐行转写**：`core/templates/sort_array.h` 的 `SortArray`（introsort + 堆退化 + 收尾插入趟）。
 *
 * 为什么要有这个文件：`Array.sort_custom` 在 n ≥ 17 且存在同键时给的不是稳定顺序，而是这个算法特有的置换
 * （S184）。以前这里走 JS 的稳定 sort，同键顺序与引擎不同 —— 可复现的静默分叉。原文到手后按原文搬，
 * 两套指纹对拍都是满分：`tmp/f74` 的 45 格（`npx tsx tmp/sort-verbatim.mts`）与 `tmp/f94` 的 26 格独立格
 * （`npx tsx tmp/sort-f94.mts`，全是那 45 格里没出现过的 n、重复度与非自洽比较器）。
 *
 * 两个必须照原文的点：
 * ① **pivot 按位置读，不是快照** —— 原文拿的是 `const T *pivot_element_location = &p_array[p_pivot]`，
 *    扫描时每次现取，交换时指针跟着换；
 * ② `ERR_BAD_COMPARE` 是 **break 出当前那一个扫描 while**，不是中断整个排序，所以比较器不自洽时
 *    引擎继续跑并给出一个它特有的顺序（4.6.3 实测 `Validate` 是开的：Godot 会往 stderr 打
 *    `ERROR: bad comparison function; sorting will be broken` —— 那行文本产物复现不了，置换能复现）。
 */

type Less<T> = (a: T, b: T) => boolean;

/** 原文 `bitlog`：`for (k = 0; p_n != 1; p_n >>= 1) ++k;`（p_n ≥ 1 才调用，与原文的 sort_range 同前提） */
function bitlog(p_n: number): number {
  let n = p_n;
  let k = 0;
  while (n !== 1) {
    n = n >> 1;
    ++k;
  }
  return k;
}

const INTROSORT_THRESHOLD = 16;

class SortArray<T> {
  private readonly a: T[];
  private readonly compare: Less<T>;

  constructor(a: T[], compare: Less<T>) {
    this.a = a;
    this.compare = compare;
  }

  /** 原文 `median_of_3_index`，分支逐个照搬 */
  private medianOf3Index(pa: number, pb: number, pc: number): number {
    const a = this.a[pa] as T;
    const b = this.a[pb] as T;
    const c = this.a[pc] as T;
    if (this.compare(a, b)) {
      if (this.compare(b, c)) {
        return pb;
      } else if (this.compare(a, c)) {
        return pc;
      } else {
        return pa;
      }
    } else if (this.compare(a, c)) {
      return pa;
    } else if (this.compare(b, c)) {
      return pc;
    } else {
      return pb;
    }
  }

  /* ---------------- 堆 / 堆排 ---------------- */

  private pushHeap(first: number, holeIdx: number, topIndex: number, value: T): void {
    let hole = holeIdx;
    let parent = (hole - 1) >> 1;
    while (hole > topIndex && this.compare(this.a[first + parent] as T, value)) {
      this.a[first + hole] = this.a[first + parent] as T;
      hole = parent;
      parent = (hole - 1) >> 1;
    }
    this.a[first + hole] = value;
  }

  private adjustHeap(first: number, holeIdx: number, len: number, value: T): void {
    const topIndex = holeIdx;
    let hole = holeIdx;
    let secondChild = 2 * hole + 2;

    while (secondChild < len) {
      if (this.compare(this.a[first + secondChild] as T, this.a[first + (secondChild - 1)] as T)) {
        secondChild--;
      }
      this.a[first + hole] = this.a[first + secondChild] as T;
      hole = secondChild;
      secondChild = 2 * (secondChild + 1);
    }

    if (secondChild === len) {
      this.a[first + hole] = this.a[first + (secondChild - 1)] as T;
      hole = secondChild - 1;
    }
    this.pushHeap(first, hole, topIndex, value);
  }

  private popHeapAt(first: number, last: number, result: number, value: T): void {
    this.a[result] = this.a[first] as T;
    this.adjustHeap(first, 0, last - first, value);
  }

  private popHeap(first: number, last: number): void {
    this.popHeapAt(first, last, last - 1, this.a[last - 1] as T);
  }

  private sortHeap(first: number, last: number): void {
    let l = last;
    while (l - first > 1) {
      this.popHeap(first, l--);
    }
  }

  private makeHeap(first: number, last: number): void {
    if (last - first < 2) {
      return;
    }
    const len = last - first;
    let parent = (len - 2) >> 1;
    for (;;) {
      this.adjustHeap(first, parent, len, this.a[first + parent] as T);
      if (parent === 0) {
        return;
      }
      parent--;
    }
  }

  private partialSort(first: number, last: number, middle: number): void {
    this.makeHeap(first, middle);
    for (let i = middle; i < last; i++) {
      if (this.compare(this.a[i] as T, this.a[first] as T)) {
        this.popHeapAt(first, middle, i, this.a[i] as T);
      }
    }
    this.sortHeap(first, middle);
  }

  /* ---------------- 分治 ---------------- */

  private partitioner(firstIn: number, lastIn: number, pivotIn: number): number {
    const unmodifiedFirst = firstIn;
    const unmodifiedLast = lastIn;
    let first = firstIn;
    let last = lastIn;
    // 原文是 `&p_array[p_pivot]`：交换时跟着走，比较时**每次现读那个位置**
    let pivotLoc = pivotIn;

    for (;;) {
      // ERR_BAD_COMPARE 的 break 只中断**当前这一个扫描 while**，外面的分治循环照走
      while (first !== pivotLoc && this.compare(this.a[first] as T, this.a[pivotLoc] as T)) {
        if (first === unmodifiedLast - 1) break;
        first++;
      }
      last--;
      while (last !== pivotLoc && this.compare(this.a[pivotLoc] as T, this.a[last] as T)) {
        if (last === unmodifiedFirst) break;
        last--;
      }

      if (first >= last) {
        return first;
      }

      if (pivotLoc === first) {
        pivotLoc = last;
      } else if (pivotLoc === last) {
        pivotLoc = first;
      }
      const t = this.a[first] as T;
      this.a[first] = this.a[last] as T;
      this.a[last] = t;
      first++;
    }
  }

  private introsort(firstIn: number, lastIn: number, maxDepth: number): void {
    let first = firstIn;
    let last = lastIn;
    let depth = maxDepth;
    while (last - first > INTROSORT_THRESHOLD) {
      if (depth === 0) {
        this.partialSort(first, last, last);
        return;
      }
      depth--;

      const cut = this.partitioner(
        first,
        last,
        this.medianOf3Index(first, first + ((last - first) >> 1), last - 1),
      );

      this.introsort(cut, last, depth);
      last = cut;
    }
  }

  /* ---------------- 插入趟 ---------------- */

  private unguardedLinearInsert(lastIn: number, value: T): void {
    let last = lastIn;
    let next = last - 1;
    while (this.compare(value, this.a[next] as T)) {
      if (next === 0) break;
      this.a[last] = this.a[next] as T;
      last = next;
      next--;
    }
    this.a[last] = value;
  }

  private linearInsert(first: number, last: number): void {
    const val = this.a[last] as T;
    if (this.compare(val, this.a[first] as T)) {
      for (let i = last; i > first; i--) {
        this.a[i] = this.a[i - 1] as T;
      }
      this.a[first] = val;
    } else {
      this.unguardedLinearInsert(last, val);
    }
  }

  private insertionSort(first: number, last: number): void {
    if (first === last) {
      return;
    }
    for (let i = first + 1; i !== last; i++) {
      this.linearInsert(first, i);
    }
  }

  private unguardedInsertionSort(first: number, last: number): void {
    for (let i = first; i !== last; i++) {
      this.unguardedLinearInsert(i, this.a[i] as T);
    }
  }

  private finalInsertionSort(first: number, last: number): void {
    if (last - first > INTROSORT_THRESHOLD) {
      this.insertionSort(first, first + INTROSORT_THRESHOLD);
      this.unguardedInsertionSort(first + INTROSORT_THRESHOLD, last);
    } else {
      this.insertionSort(first, last);
    }
  }

  /** 原文 `sort_range`：先 introsort（深度 `bitlog(len) * 2`），再对**整段**走一遍收尾插入趟 */
  sortRange(first: number, last: number): void {
    if (first !== last) {
      this.introsort(first, last, bitlog(last - first) * 2);
      this.finalInsertionSort(first, last);
    }
  }
}

/**
 * 按引擎的置换排一遍（返回新数组，与 `GArray` 现有口径一致）。
 * 比较器不自洽时那两条 `return` 走的是引擎 `ERR_BAD_COMPARE` 的 break 分支，置换照给 —— 但它那一行
 * stderr 复现不了；比较器中途抛错的形状没量过（引擎是原地排、我们排完才换数组）。
 */
export function sortGodot<T>(items: readonly T[], less: Less<T>): T[] {
  const a = [...items];
  new SortArray<T>(a, less).sortRange(0, a.length);
  return a;
}
