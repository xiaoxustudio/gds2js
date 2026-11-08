import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../lib.mjs";
import { ops } from "../../packages/runtime/src/runtime/ops.ts";
import { and, or as orFn } from "../../packages/runtime/src/runtime/builtins.ts";
import { V, type Variant } from "../../packages/runtime/src/runtime/tags.ts";
import { GArray } from "../../packages/runtime/src/runtime/values.ts";
import { dictOf } from "../../packages/runtime/src/runtime/methods.ts";
import { vector2 } from "../../packages/runtime/src/runtime/class/vector/vector2.ts";
import { vector2i } from "../../packages/runtime/src/runtime/class/vector/vector2i.ts";
import { vector3 } from "../../packages/runtime/src/runtime/class/vector/vector3.ts";
import { vector3i } from "../../packages/runtime/src/runtime/class/vector/vector3i.ts";
import { vector4, GVector4 } from "../../packages/runtime/src/runtime/class/vector/vector4.ts";
import { vector4i } from "../../packages/runtime/src/runtime/class/vector/vector4i.ts";
import { rect2, rect2i } from "../../packages/runtime/src/runtime/class/shape/rect.ts";
import { aabb } from "../../packages/runtime/src/runtime/class/shape/aabb.ts";
import { plane } from "../../packages/runtime/src/runtime/class/orient/plane.ts";
import { quaternion } from "../../packages/runtime/src/runtime/class/orient/quaternion.ts";
import { basis } from "../../packages/runtime/src/runtime/class/orient/basis.ts";
import { transform2d } from "../../packages/runtime/src/runtime/class/orient/transform2d.ts";
import { transform3d } from "../../packages/runtime/src/runtime/class/orient/transform3d.ts";
import { projection } from "../../packages/runtime/src/runtime/class/orient/projection.ts";
import { color } from "../../packages/runtime/src/runtime/class/color/color.ts";
import { nodePathValue } from "../../packages/runtime/src/runtime/class/identity/node-path.ts";
import { ridCtor } from "../../packages/runtime/src/runtime/class/identity/rid.ts";
import { nullCallable } from "../../packages/runtime/src/runtime/class/identity/callable.ts";
import { Signal } from "../../packages/runtime/src/runtime/class/identity/signal.ts";
import { packCtor } from "../../packages/runtime/src/runtime/class/bytes/packed.ts";
import { nativeClass } from "../../packages/runtime/src/runtime/class/identity/native-class.ts";
import { UnsupportedError } from "../../packages/runtime/src/runtime/errors.ts";


const DATA = join(ROOT, "site", "public", "data", "v1");
const OUT = join(ROOT, "packages", "runtime", "test", "operator-face.test.ts");

const EXPR = {
  Nil: "V.nil()",
  bool: "V.bool(true)",
  int: "V.int(7)",
  float: "V.float(2.5)",
  String: 'V.str("ab")',
  StringName: 'V.stringName("ab")',
  NodePath: 'nodePathValue("a/b")',
  Vector2: "vector2(1, 2)",
  Vector2i: "vector2i(1, 2)",
  Vector3: "vector3(1, 2, 3)",
  Vector3i: "vector3i(1, 2, 3)",
  Vector4: "vector4(1, 2, 3, 4)",
  Vector4i: "vector4i(1, 2, 3, 4)",
  Rect2: "rect2(1, 2, 3, 4)",
  Rect2i: "rect2i(1, 2, 3, 4)",
  AABB: "aabb(1, 2, 3, 4, 5, 6)",
  Plane: "plane(1, 2, 3, 4)",
  Quaternion: "quaternion(1, 2, 3, 4)",
  Basis: "basis(1, 0, 0, 0, 1, 0, 0, 0, 1)",
  Transform2D: "transform2d(1, 0, 0, 1, 0, 0)",
  Transform3D: "transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0)",
  Projection: "projection(new GVector4(1, 0, 0, 0), new GVector4(0, 1, 0, 0), new GVector4(0, 0, 1, 0), new GVector4(0, 0, 0, 1))",
  Color: "color(0.1, 0.2, 0.3, 0.4)",
  Array: "V.array(GArray.of([V.int(1), V.int(2)]))",
  Dictionary: "dictOf([[V.int(1), V.int(2)]])",
  PackedByteArray: 'packCtor("byte", [])',
  PackedInt32Array: 'packCtor("int32", [])',
  PackedInt64Array: 'packCtor("int64", [])',
  PackedFloat32Array: 'packCtor("float32", [])',
  PackedFloat64Array: 'packCtor("float64", [])',
  PackedStringArray: 'packCtor("string", [])',
  PackedVector2Array: 'packCtor("vector2", [])',
  PackedVector3Array: 'packCtor("vector3", [])',
  PackedVector4Array: 'packCtor("vector4", [])',
  PackedColorArray: 'packCtor("color", [])',
  Callable: "nullCallable()",
  Signal: 'V.object(new Signal("x"))',
  RID: "ridCtor([])",
  Object: `nativeClass("Node")`,
};


const PROBE: Record<string, () => Variant> = {
  Nil: () => V.nil(),
  bool: () => V.bool(true),
  int: () => V.int(7),
  float: () => V.float(2.5),
  String: () => V.str("ab"),
  StringName: () => V.stringName("ab"),
  NodePath: () => nodePathValue("a/b"),
  Vector2: () => vector2(1, 2),
  Vector2i: () => vector2i(1, 2),
  Vector3: () => vector3(1, 2, 3),
  Vector3i: () => vector3i(1, 2, 3),
  Vector4: () => vector4(1, 2, 3, 4),
  Vector4i: () => vector4i(1, 2, 3, 4),
  Rect2: () => rect2(1, 2, 3, 4),
  Rect2i: () => rect2i(1, 2, 3, 4),
  AABB: () => aabb(1, 2, 3, 4, 5, 6),
  Plane: () => plane(1, 2, 3, 4),
  Quaternion: () => quaternion(1, 2, 3, 4),
  Basis: () => basis(1, 0, 0, 0, 1, 0, 0, 0, 1),
  Transform2D: () => transform2d(1, 0, 0, 1, 0, 0),
  Transform3D: () => transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0),
  Projection: () => projection(new GVector4(1, 0, 0, 0), new GVector4(0, 1, 0, 0), new GVector4(0, 0, 1, 0), new GVector4(0, 0, 0, 1)),
  Color: () => color(0.1, 0.2, 0.3, 0.4),
  Array: () => V.array(GArray.of([V.int(1), V.int(2)])),
  Dictionary: () => dictOf([[V.int(1), V.int(2)]]),
  PackedByteArray: () => packCtor("byte", []),
  PackedInt32Array: () => packCtor("int32", []),
  PackedInt64Array: () => packCtor("int64", []),
  PackedFloat32Array: () => packCtor("float32", []),
  PackedFloat64Array: () => packCtor("float64", []),
  PackedStringArray: () => packCtor("string", []),
  PackedVector2Array: () => packCtor("vector2", []),
  PackedVector3Array: () => packCtor("vector3", []),
  PackedVector4Array: () => packCtor("vector4", []),
  PackedColorArray: () => packCtor("color", []),
  Callable: () => nullCallable(),
  Signal: () => V.object(new Signal("x")),
  RID: () => ridCtor([]),
  Object: () => nativeClass("Node"),
};

function probeCall(op: string, a: Variant, b: Variant): void {
  switch (op) {
    case "+": ops.add(a, b); return;
    case "-": ops.sub(a, b); return;
    case "*": ops.mul(a, b); return;
    case "/": ops.div(a, b); return;
    case "%": ops.mod(a, b, true); return;
    case "**": ops.pow(a, b); return;
    case "==": ops.eq(a, b); return;
    case "!=": ops.neq(a, b); return;
    case "<": ops.lt(a, b); return;
    case "<=": ops.lte(a, b); return;
    case ">": ops.gt(a, b); return;
    case ">=": ops.gte(a, b); return;
    case "&": ops.band(a, b); return;
    case "|": ops.bor(a, b); return;
    case "^": ops.bxor(a, b); return;
    case "<<": ops.shl(a, b); return;
    case ">>": ops.shr(a, b); return;
    case "~": ops.bnot(a); return;
    case "and": and(a, () => b); return;
    case "or": orFn(a, () => b); return;
    case "in": ops.inOp(a, b); return;
    case "not": V.bool(!ops.truthy(a)); return;
    case "unary-": ops.neg(a); return;
    case "unary+": ops.pos(a); return;
  }
}

function exprOf(op, a, b) {
  switch (op) {
    case "+": return `ops.add(${a}, ${b})`;
    case "-": return `ops.sub(${a}, ${b})`;
    case "*": return `ops.mul(${a}, ${b})`;
    case "/": return `ops.div(${a}, ${b})`;
    case "%": return `ops.mod(${a}, ${b}, true)`;
    case "**": return `ops.pow(${a}, ${b})`;
    case "==": return `ops.eq(${a}, ${b})`;
    case "!=": return `ops.neq(${a}, ${b})`;
    case "<": return `ops.lt(${a}, ${b})`;
    case "<=": return `ops.lte(${a}, ${b})`;
    case ">": return `ops.gt(${a}, ${b})`;
    case ">=": return `ops.gte(${a}, ${b})`;
    case "&": return `ops.band(${a}, ${b})`;
    case "|": return `ops.bor(${a}, ${b})`;
    case "^": return `ops.bxor(${a}, ${b})`;
    case "<<": return `ops.shl(${a}, ${b})`;
    case ">>": return `ops.shr(${a}, ${b})`;
    case "~": return `ops.bnot(${a})`;
    case "and": return `and(${a}, () => ${b})`;
    case "or": return `or(${a}, () => ${b})`;
    case "in": return `ops.inOp(${a}, ${b})`;
    case "not": return `V.bool(!ops.truthy(${a}))`;
    case "unary-": return `ops.neg(${a})`;
    case "unary+": return `ops.pos(${a})`;
    default: return null;
  }
}

export function renderOpFace(supported) {
  const cases = supported.map(([label, expr]) => `  [${JSON.stringify(label)}, () => ${expr}],`).join("\n");
  return `// 生成物，别手改，改请重跑 pnpm regen:op-face（tools/compat/op-face.mts write）。
import { describe, expect, it } from "vitest";
import { and, or } from "@gds2js/runtime/runtime/builtins";
import { ops } from "@gds2js/runtime/runtime/ops";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { vector3i } from "@gds2js/runtime/runtime/class/vector/vector3i";
import { vector4, GVector4 } from "@gds2js/runtime/runtime/class/vector/vector4";
import { vector4i } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { rect2, rect2i } from "@gds2js/runtime/runtime/class/shape/rect";
import { aabb } from "@gds2js/runtime/runtime/class/shape/aabb";
import { plane } from "@gds2js/runtime/runtime/class/orient/plane";
import { quaternion } from "@gds2js/runtime/runtime/class/orient/quaternion";
import { basis } from "@gds2js/runtime/runtime/class/orient/basis";
import { transform2d } from "@gds2js/runtime/runtime/class/orient/transform2d";
import { transform3d } from "@gds2js/runtime/runtime/class/orient/transform3d";
import { projection } from "@gds2js/runtime/runtime/class/orient/projection";
import { color } from "@gds2js/runtime/runtime/class/color/color";
import { nodePathValue } from "@gds2js/runtime/runtime/class/identity/node-path";
import { ridCtor } from "@gds2js/runtime/runtime/class/identity/rid";
import { nullCallable } from "@gds2js/runtime/runtime/class/identity/callable";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { packCtor } from "@gds2js/runtime/runtime/class/bytes/packed";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";

type Cell = [string, () => unknown];

const CASES: Cell[] = [
${cases}
];

describe("runtime/operator face", () => {
  for (const [label, run] of CASES) {
    it(label, () => {
      expect(run).not.toThrow(UnsupportedError);
    });
  }
});
`;
}

export function buildSupported() {
  const index = JSON.parse(readFileSync(join(DATA, "index.json"), "utf8"));
  const supported = [];
  for (const mod of index.modules) {
    if (!mod.id.startsWith("builtin:")) continue;
    const file = join(DATA, "modules", `${mod.id.replace(/[^A-Za-z0-9_-]+/g, "-")}.json`);
    const chunk = JSON.parse(readFileSync(file, "utf8"));
    for (const row of chunk.rows) {
      if (row.k !== "op" || row.t === "unplanned") continue;
      const m = /right: ([A-Za-z0-9_]+) ->/.exec(row.s);
      if (m === null) continue;
      const right = m[1];

      let a = EXPR[row.o];
      if (a === undefined) continue;
      const op = row.n.slice(0, row.n.length - right.length - 1);
      if (op === "xor") continue;
      if (op === "%" && (row.o === "String" || row.o === "StringName")) {
        a = row.o === "String" ? 'V.str("%s")' : 'V.stringName("%s")';
      }
      const b = right === "none" || right === "Variant" ? a : EXPR[right];
      if (b === undefined) continue;
      const expr = exprOf(op, a, right === "none" ? "" : b);
      if (expr === null) continue;
      const probe = `op#${row.o}#${op}#${right}#`;
      if (probe.includes("`")) continue;
      const leftType = row.o;
      const factory = PROBE[leftType];
      if (factory === undefined) continue;
      try {
        const l = factory();
        const r = right === "none" || right === "Variant" ? l : PROBE[right]?.();
        if (r === undefined) continue;
        probeCall(op, l, r);
      } catch (e) {
        if (e instanceof UnsupportedError) continue;
      }
      supported.push([probe, expr]);
    }
  }
  return supported;
}

if (process.argv[2] === "write") {
  const rows = buildSupported();
  writeFileSync(OUT, renderOpFace(rows), "utf8");
  console.log(`已写 ${OUT.replace(ROOT, ".")}：${String(rows.length)} 格`);
}
