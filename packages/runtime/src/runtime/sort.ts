
type Less<T> = (a: T, b: T) => boolean;

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

  private partitioner(firstIn: number, lastIn: number, pivotIn: number): number {
    const unmodifiedFirst = firstIn;
    const unmodifiedLast = lastIn;
    let first = firstIn;
    let last = lastIn;
    let pivotLoc = pivotIn;

    for (;;) {
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

  sortRange(first: number, last: number): void {
    if (first !== last) {
      this.introsort(first, last, bitlog(last - first) * 2);
      this.finalInsertionSort(first, last);
    }
  }
}

export function sortGodot<T>(items: readonly T[], less: Less<T>): T[] {
  const a = [...items];
  new SortArray<T>(a, less).sortRange(0, a.length);
  return a;
}
