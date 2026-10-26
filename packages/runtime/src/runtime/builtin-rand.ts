import { V, type Variant } from "./tags";
import { GArray } from "./values";
import { intArgBig } from "./string-ops";
import { packCtor } from "./packed";
import { CMP_EPSILON, MATH_TAU, utilFloatArg, utilIntArg } from "./builtin-args";

const PCG_MUL = 6364136223846793005n;

const PCG_INC = 1442695040888963407n;

const PCG_MASK = 18446744073709551615n;

const PCG_DEFAULT_SEED = 12047754176567800795n;

type Pcg = { state: bigint; inc: bigint };

const DEFAULT_RAND: Pcg = { state: 0n, inc: 1n };

function pcgNext(rng: Pcg): number {
  const old = rng.state;
  rng.state = (old * PCG_MUL + (rng.inc | 1n)) & PCG_MASK;
  const xs = Number((((old >> 18n) ^ old) >> 27n) & 0xffffffffn);
  const rot = Number(old >> 59n);
  return ((xs >>> rot) | (xs << ((-rot) & 31))) >>> 0;
}

function pcgSeedTo(rng: Pcg, seed: bigint): void {
  rng.state = 0n;
  rng.inc = ((PCG_INC << 1n) | 1n) & PCG_MASK;
  pcgNext(rng);
  rng.state = (rng.state + (seed & PCG_MASK)) & PCG_MASK;
  pcgNext(rng);
}

function pcgClz32(x: number): number {
  let n = x >>> 0;
  if (n === 0) return 32;
  let c = 0;
  while ((n & 0x80000000) === 0) {
    c++;
    n = (n << 1) >>> 0;
  }
  return c;
}

function pcgRandd(rng: Pcg): number {
  const proto = pcgNext(rng);
  if (proto === 0) return 0;
  const hi = BigInt(pcgNext(rng));
  const lo = BigInt(pcgNext(rng));
  const sig = (((hi << 32n) | lo) | 0x8000000000000001n) & PCG_MASK;
  return Number(sig) * Math.pow(2, -64 - pcgClz32(proto));
}

function pcgBounded(rng: Pcg, bound: number): number {
  const threshold = bound >= 4294967296 ? 0 : (4294967296 - bound) % bound;
  for (;;) {
    const r = pcgNext(rng);
    if (r >= threshold) return r % bound;
  }
}

let BOOTED = false;

function pcgTimeSeed(): bigint {
  const ms = BigInt(Date.now());
  return BigInt.asUintN(64, (ms / 1000n + (ms % 1000n) * 1000n) * DEFAULT_RAND.state + PCG_INC);
}

function bootRand(): void {
  if (BOOTED) return;
  BOOTED = true;
  pcgSeedTo(DEFAULT_RAND, PCG_DEFAULT_SEED);
  pcgSeedTo(DEFAULT_RAND, pcgTimeSeed());
}

export function gSeed(v: Variant): Variant {
  bootRand();
  pcgSeedTo(DEFAULT_RAND, intArgBig(v, "seed() 的实参"));
  return V.nil();
}

export function gRandomize(): Variant {
  bootRand();
  pcgSeedTo(DEFAULT_RAND, pcgTimeSeed());
  return V.nil();
}

export function gRandi(): Variant {
  bootRand();
  return V.int(BigInt(pcgNext(DEFAULT_RAND)));
}

/** `Math::rand()` 的原样 32 位输出：`Array.pick_random()` / `shuffle()` 的取模源（S572）。 */
export function randNextUint32(): number {
  bootRand();
  return pcgNext(DEFAULT_RAND);
}

export function gRandf(): Variant {
  bootRand();
  return V.float(Math.fround(pcgNext(DEFAULT_RAND) / 4294967296));
}

export function gRandiRange(from: Variant, to: Variant): Variant {
  utilIntArg(from, "randi_range", 1);
  utilIntArg(to, "randi_range", 2);
  bootRand();
  const a = Number(BigInt.asIntN(32, intArgBig(from, "randi_range() 的第一参")));
  const b = Number(BigInt.asIntN(32, intArgBig(to, "randi_range() 的第二参")));
  if (a === b) return V.int(BigInt(a));
  const bound = Math.abs(a - b) + 1;
  return V.int(BigInt(pcgBounded(DEFAULT_RAND, bound) + Math.min(a, b)));
}

export function gRandfRange(from: Variant, to: Variant): Variant {
  bootRand();
  const a = utilFloatArg(from, "randf_range", 1);
  const b = utilFloatArg(to, "randf_range", 2);
  return V.float(pcgRandd(DEFAULT_RAND) * (b - a) + a);
}

export function gRandfn(mean: Variant, dev: Variant): Variant {
  bootRand();
  const m = utilFloatArg(mean, "randfn", 1);
  const d = utilFloatArg(dev, "randfn", 2);
  let temp = pcgRandd(DEFAULT_RAND);
  if (temp < CMP_EPSILON) temp += CMP_EPSILON;
  return V.float(m + d * (Math.cos(MATH_TAU * pcgRandd(DEFAULT_RAND)) * Math.sqrt(-2.0 * Math.log(temp))));
}

export function gRandFromSeed(v: Variant): Variant {
  const s = intArgBig(v, "rand_from_seed() 的实参");
  const local: Pcg = { state: 0n, inc: 1n };
  pcgSeedTo(local, s);
  return packCtor("int64", [V.array(GArray.of([V.int(BigInt(pcgNext(local))), V.int(s)]))]);
}
