
const MAX_COPY = 32;
const MAX_LEN = 264;
const MAX_L1_DISTANCE = 8192;
const MAX_L2_DISTANCE = 8191;
const MAX_FARDISTANCE = 65535 + MAX_L2_DISTANCE - 1;
const HASH_LOG = 13;
const HASH_SIZE = 1 << HASH_LOG;
const HASH_MASK = HASH_SIZE - 1;

function readU16(b: Uint8Array, p: number): number {
  return (b[p] as number) | ((b[p + 1] as number) << 8);
}

function hashAt(b: Uint8Array, p: number): number {
  let v = readU16(b, p);
  v ^= readU16(b, p + 1) ^ (v >> (16 - HASH_LOG));
  return v & HASH_MASK;
}

function maxOutFor(length: number): number {
  return Math.max(length + Math.floor((length * 6) / 100), 66);
}

function compress1(input: Uint8Array): Uint8Array {
  const length = input.length;
  const out = new Uint8Array(maxOutFor(length));
  let op = 0;
  let ip = 0;
  if (length < 4) {
    if (length === 0) return out.slice(0, 0);
    out[op++] = length - 1;
    for (let i = 0; i < length; i++) out[op++] = input[i] as number;
    return out.slice(0, op);
  }
  let ipBound = length - 2;
  const ipLimit = length - 13;
  const htab = new Int32Array(HASH_SIZE);
  let copy = 2;
  out[op++] = MAX_COPY - 1;
  out[op++] = input[ip++] as number;
  out[op++] = input[ip++] as number;
  while (ip < ipLimit) {
    let len = 3;
    const anchor = ip;
    const h = hashAt(input, ip);
    let ref = htab[h] as number;
    htab[h] = anchor;
    let distance = anchor - ref;
    let match = distance !== 0 && distance < MAX_L1_DISTANCE;
    if (match) {
      for (let k = 0; k < 3; k++) {
        const a = input[ref++] as number;
        const b = input[ip++] as number;
        if (a !== b) {
          match = false;
          break;
        }
      }
    }
    if (!match) {
      out[op++] = input[anchor] as number;
      ip = anchor + 1;
      copy++;
      if (copy === MAX_COPY) {
        copy = 0;
        out[op++] = MAX_COPY - 1;
      }
      continue;
    }
    ip = anchor + len;
    distance--;
    if (distance === 0) {
      const x = input[ip - 1] as number;
      while (ip < ipBound) {
        const a = input[ref++] as number;
        if (a !== x) break;
        ip++;
      }
    } else {
      let diff = false;
      for (let k = 0; k < 8; k++) {
        const a = input[ref++] as number;
        const b = input[ip++] as number;
        if (a !== b) {
          diff = true;
          break;
        }
      }
      if (!diff) {
        while (ip < ipBound) {
          const a = input[ref++] as number;
          const b = input[ip++] as number;
          if (a !== b) break;
        }
      }
    }
    if (copy) out[op - copy - 1] = copy - 1;
    else op--;
    copy = 0;
    ip -= 3;
    len = ip - anchor;
    while (len > MAX_LEN - 2) {
      out[op++] = (7 << 5) + (distance >> 8);
      out[op++] = MAX_LEN - 2 - 7 - 2;
      out[op++] = distance & 255;
      len -= MAX_LEN - 2;
    }
    if (len < 7) {
      out[op++] = (len << 5) + (distance >> 8);
      out[op++] = distance & 255;
    } else {
      out[op++] = (7 << 5) + (distance >> 8);
      out[op++] = len - 7;
      out[op++] = distance & 255;
    }
    let hh = hashAt(input, ip);
    htab[hh] = ip++;
    hh = hashAt(input, ip);
    htab[hh] = ip++;
    out[op++] = MAX_COPY - 1;
  }
  ipBound++;
  while (ip <= ipBound) {
    out[op++] = input[ip++] as number;
    copy++;
    if (copy === MAX_COPY) {
      copy = 0;
      out[op++] = MAX_COPY - 1;
    }
  }
  if (copy) out[op - copy - 1] = copy - 1;
  else op--;
  return out.slice(0, op);
}

function compress2(input: Uint8Array): Uint8Array {
  const length = input.length;
  const out = new Uint8Array(maxOutFor(length));
  let op = 0;
  let ip = 0;
  if (length < 4) {
    if (length === 0) return out.slice(0, 0);
    out[op++] = length - 1;
    for (let i = 0; i < length; i++) out[op++] = input[i] as number;
    return out.slice(0, op);
  }
  let ipBound = length - 2;
  const ipLimit = length - 13;
  const htab = new Int32Array(HASH_SIZE);
  let copy = 2;
  out[op++] = MAX_COPY - 1;
  out[op++] = input[ip++] as number;
  out[op++] = input[ip++] as number;
  while (ip < ipLimit) {
    let len = 3;
    const anchor = ip;
    let ref: number;
    let distance: number;
    let run = false;
    if (input[ip] === input[ip - 1] && input[ip] === input[ip + 1] && input[ip + 1] === input[ip + 2]) {
      distance = 1;
      ip += 3;
      ref = anchor - 1 + 3;
      run = true;
    } else {
      const h = hashAt(input, ip);
      ref = htab[h] as number;
      htab[h] = anchor;
      distance = anchor - ref;
      let match = distance !== 0 && distance < MAX_FARDISTANCE;
      if (match) {
        for (let k = 0; k < 3; k++) {
          const a = input[ref++] as number;
          const b = input[ip++] as number;
          if (a !== b) {
            match = false;
            break;
          }
        }
      }
      if (match && distance >= MAX_L2_DISTANCE) {
        for (let k = 0; k < 2; k++) {
          const a = input[ip++] as number;
          const b = input[ref++] as number;
          if (a !== b) {
            match = false;
            break;
          }
        }
        if (match) len += 2;
      }
      if (!match) {
        out[op++] = input[anchor] as number;
        ip = anchor + 1;
        copy++;
        if (copy === MAX_COPY) {
          copy = 0;
          out[op++] = MAX_COPY - 1;
        }
        continue;
      }
    }
    void run;
    ip = anchor + len;
    distance--;
    if (distance === 0) {
      const x = input[ip - 1] as number;
      while (ip < ipBound) {
        const a = input[ref++] as number;
        if (a !== x) break;
        ip++;
      }
    } else {
      let diff = false;
      for (let k = 0; k < 8; k++) {
        const a = input[ref++] as number;
        const b = input[ip++] as number;
        if (a !== b) {
          diff = true;
          break;
        }
      }
      if (!diff) {
        while (ip < ipBound) {
          const a = input[ref++] as number;
          const b = input[ip++] as number;
          if (a !== b) break;
        }
      }
    }
    if (copy) out[op - copy - 1] = copy - 1;
    else op--;
    copy = 0;
    ip -= 3;
    len = ip - anchor;
    if (distance < MAX_L2_DISTANCE) {
      if (len < 7) {
        out[op++] = (len << 5) + (distance >> 8);
        out[op++] = distance & 255;
      } else {
        out[op++] = (7 << 5) + (distance >> 8);
        for (len -= 7; len >= 255; len -= 255) out[op++] = 255;
        out[op++] = len;
        out[op++] = distance & 255;
      }
    } else {
      if (len < 7) {
        distance -= MAX_L2_DISTANCE;
        out[op++] = (len << 5) + 31;
        out[op++] = 255;
        out[op++] = distance >> 8;
        out[op++] = distance & 255;
      } else {
        distance -= MAX_L2_DISTANCE;
        out[op++] = (7 << 5) + 31;
        for (len -= 7; len >= 255; len -= 255) out[op++] = 255;
        out[op++] = len;
        out[op++] = 255;
        out[op++] = distance >> 8;
        out[op++] = distance & 255;
      }
    }
    let hh = hashAt(input, ip);
    htab[hh] = ip++;
    hh = hashAt(input, ip);
    htab[hh] = ip++;
    out[op++] = MAX_COPY - 1;
  }
  ipBound++;
  while (ip <= ipBound) {
    out[op++] = input[ip++] as number;
    copy++;
    if (copy === MAX_COPY) {
      copy = 0;
      out[op++] = MAX_COPY - 1;
    }
  }
  if (copy) out[op - copy - 1] = copy - 1;
  else op--;
  out[0] = (out[0] as number) | (1 << 5);
  return out.slice(0, op);
}

function decompress1(input: Uint8Array, maxout: number): Uint8Array | null {
  const out = new Uint8Array(maxout);
  const ipLimit = input.length;
  const ipBound = ipLimit - 2;
  let ip = 0;
  let op = 0;
  let ctrl = (input[ip++] as number) & 31;
  for (;;) {
    if (ctrl >= 32) {
      let len = (ctrl >> 5) - 1;
      let ofs = (ctrl & 31) << 8;
      let ref = op - ofs - 1;
      if (len === 6) {
        if (!(ip <= ipBound)) return null;
        len += input[ip++] as number;
      }
      if (!(ip <= ipBound)) return null;
      ref -= input[ip++] as number;
      len += 3;
      if (!(op + len <= maxout) || ref < 0) return null;
      for (let k = 0; k < len; k++) out[op++] = out[ref++] as number;
    } else {
      ctrl++;
      if (!(op + ctrl <= maxout) || !(ip + ctrl <= ipLimit)) return null;
      for (let k = 0; k < ctrl; k++) out[op++] = input[ip++] as number;
    }
    if (ip > ipBound) break;
    ctrl = input[ip++] as number;
  }
  return out.slice(0, op);
}

function decompress2(input: Uint8Array, maxout: number): Uint8Array | null {
  const out = new Uint8Array(maxout);
  const ipLimit = input.length;
  const ipBound = ipLimit - 2;
  let ip = 0;
  let op = 0;
  let ctrl = (input[ip++] as number) & 31;
  for (;;) {
    if (ctrl >= 32) {
      let len = (ctrl >> 5) - 1;
      let ofs = (ctrl & 31) << 8;
      let ref = op - ofs - 1;
      let code = 0;
      if (len === 6) {
        do {
          if (!(ip <= ipBound)) return null;
          code = input[ip++] as number;
          len += code;
        } while (code === 255);
      }
      if (!(ip <= ipBound)) return null;
      code = input[ip++] as number;
      ref -= code;
      len += 3;
      if (code === 255 && ofs === 31 << 8) {
        if (!(ip < ipBound)) return null;
        ofs = (input[ip++] as number) << 8;
        ofs += input[ip++] as number;
        ref = op - ofs - MAX_L2_DISTANCE - 1;
      }
      if (!(op + len <= maxout) || ref < 0) return null;
      for (let k = 0; k < len; k++) out[op++] = out[ref++] as number;
    } else {
      ctrl++;
      if (!(op + ctrl <= maxout) || !(ip + ctrl <= ipLimit)) return null;
      for (let k = 0; k < ctrl; k++) out[op++] = input[ip++] as number;
    }
    if (ip >= ipLimit) break;
    ctrl = input[ip++] as number;
  }
  return out.slice(0, op);
}

/** 引擎 `fastlz_compress()`：< 65536 走 level 1，否则 level 2。 */
export function fastlzCompress(input: Uint8Array): Uint8Array {
  return input.length < 65536 ? compress1(input) : compress2(input);
}

export function fastlzDecompress(input: Uint8Array, maxout: number): Uint8Array | null {
  if (input.length === 0) return null;
  const level = ((input[0] as number) >> 5) + 1;
  if (level === 1) return decompress1(input, maxout);
  if (level === 2) return decompress2(input, maxout);
  return null;
}
