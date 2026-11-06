import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../lib.mjs";
import {
  ARRAY_METHOD_ARITY,
  CALLABLE_METHOD_ARITY,
  DICT_METHOD_ARITY,
  NODE_PATH_METHOD_ARITY,
  PACK_BYTE_EXTRA_ARITY,
  PACK_METHOD_ARITY_WITH_BYTES,
  SIGNAL_METHOD_ARITY,
  STRING_METHOD_ARITY,
  STRING_NAME_METHOD_ARITY,
  VALUE_METHOD_ARITY,
} from "../../packages/runtime/src/runtime/face-arity.ts";
import { BUILTIN_INSTANCE_MEMBERS } from "../../packages/compiler/src/semantics/builtin-members.ts";
import { CTOR_ARMS } from "../../packages/compiler/src/semantics/ctor-arms.ts";
import { GLOBAL_CALLABLES } from "../../packages/runtime/src/runtime/global-names.ts";
import { GLOBAL_CALLABLE_IMPLEMENTED } from "../../packages/runtime/src/runtime/method/globals.ts";
import { GLOBAL_CONSTANTS } from "../../packages/compiler/src/lower/globals.ts";

const PACK = { ...PACK_METHOD_ARITY_WITH_BYTES, ...PACK_BYTE_EXTRA_ARITY };

const BUILTIN_METHODS = {
  String: STRING_METHOD_ARITY,
  StringName: STRING_NAME_METHOD_ARITY,
  Array: ARRAY_METHOD_ARITY,
  Dictionary: DICT_METHOD_ARITY,
  NodePath: NODE_PATH_METHOD_ARITY,
  Callable: CALLABLE_METHOD_ARITY,
  Signal: SIGNAL_METHOD_ARITY,
  PackedByteArray: PACK,
  PackedInt32Array: PACK,
  PackedInt64Array: PACK,
  PackedFloat32Array: PACK,
  PackedFloat64Array: PACK,
  PackedStringArray: PACK,
  PackedVector2Array: PACK,
  PackedVector3Array: PACK,
  PackedVector4Array: PACK,
  PackedColorArray: PACK,
  RID: { get_id: [0, 0] },
  ...VALUE_METHOD_ARITY,
};

const BUILTIN_PROPS = Object.fromEntries(
  Object.entries(BUILTIN_INSTANCE_MEMBERS).map(([type, names]) => [type, names.filter((n) => BUILTIN_METHODS[type]?.[n] === undefined)]),
);

const ENGINE_RULES = [
  { file: "packages/runtime/src/runtime/class/object/node-face.ts", fn: "nodeMethod", owners: ["Node", "Node2D", "Node3D", "Control", "SceneTree"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/object/node2d.ts", fn: "node2dMethod", owners: ["Node2D", "Control"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/object/node2d.ts", fn: "node2dGlobalTransform", owners: ["Node2D", "Control"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/object/node2d.ts", fn: "node2dRead", owners: ["Node2D", "Control"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/object/node2d.ts", fn: "node2dWrite", owners: ["Node2D", "Control"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/object/node3d.ts", fn: "node3dMethod", owners: ["Node3D"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/object/node3d.ts", fn: "node3dGlobalTransform", owners: ["Node3D"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/object/node3d.ts", fn: "node3dRead", owners: ["Node3D"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/object/node3d.ts", fn: "node3dWrite", owners: ["Node3D"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/object/control.ts", fn: "ctlMethod", owners: ["Control"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/object/control.ts", fn: "ctlRead", owners: ["Control"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/object/control.ts", fn: "ctlWrite", owners: ["Control"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/object/scene-tree.ts", fn: "treeMethod", owners: ["SceneTree"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/file-access.ts", fn: "fileAccessStatic", owners: ["FileAccess"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/file-access.ts", fn: "dirAccessStatic", owners: ["DirAccess"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/file-access.ts", fn: "fileMethod", owners: ["FileAccess"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/file-access.ts", fn: "dirMethod", owners: ["DirAccess"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/regex.ts", fn: "regExMethod", owners: ["RegEx"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/regex.ts", fn: "regExMatchMethod", owners: ["RegExMatch"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/json.ts", fn: "jsonStatic", owners: ["JSON"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/json.ts", fn: "jsonMethod", owners: ["JSON"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/host/os.ts", fn: "osStatic", owners: ["OS"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/shape/rect.ts", fn: "rect2Method", owners: ["Rect2"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/shape/rect.ts", fn: "rect2iMethod", owners: ["Rect2i"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/shape/rect.ts", fn: "rect2ReadProp", owners: ["Rect2"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/shape/rect.ts", fn: "rect2WriteProp", owners: ["Rect2"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/shape/rect.ts", fn: "rect2iReadProp", owners: ["Rect2i"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/shape/rect.ts", fn: "rect2iWriteProp", owners: ["Rect2i"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/shape/aabb.ts", fn: "aabbMethod", owners: ["AABB"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/shape/aabb.ts", fn: "aabbReadProp", owners: ["AABB"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/plane.ts", fn: "planeMethod", owners: ["Plane"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/plane.ts", fn: "planeReadProp", owners: ["Plane"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/quaternion.ts", fn: "quaternionMethod", owners: ["Quaternion"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/quaternion.ts", fn: "quaternionReadProp", owners: ["Quaternion"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/basis.ts", fn: "basisMethod", owners: ["Basis"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/basis.ts", fn: "basisReadProp", owners: ["Basis"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/basis.ts", fn: "basisWriteProp", owners: ["Basis"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/transform2d.ts", fn: "transform2dMethod", owners: ["Transform2D"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/transform2d.ts", fn: "transform2dReadProp", owners: ["Transform2D"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/transform3d.ts", fn: "transform3dMethod", owners: ["Transform3D"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/transform3d.ts", fn: "transform3dReadProp", owners: ["Transform3D"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/transform3d.ts", fn: "transform3dWriteProp", owners: ["Transform3D"], kind: "prop" },
  { file: "packages/runtime/src/runtime/class/orient/projection.ts", fn: "projectionMethod", owners: ["Projection"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/projection.ts", fn: "projectionStatic", owners: ["Projection"], kind: "method" },
  { file: "packages/runtime/src/runtime/class/orient/projection.ts", fn: "projectionReadProp", owners: ["Projection"], kind: "prop" },
  { file: "packages/runtime/src/runtime/method/string.ts", fn: "stringMethod", owners: ["String"], kind: "method" },
  { file: "packages/runtime/src/runtime/method/array.ts", fn: "arrayMethod", owners: ["Array"], kind: "method" },
  { file: "packages/runtime/src/runtime/method/dict.ts", fn: "dictMethod", owners: ["Dictionary"], kind: "method" },
  { file: "packages/runtime/src/runtime/method/callable.ts", fn: "callableMethod", owners: ["Callable"], kind: "method" },
];

const OBJECT_METHODS = ["has_method", "get_class", "get_instance_id", "is_class", "get", "set", "get_meta", "set_meta", "has_meta", "remove_meta", "call", "callv"];

const VIRTUAL_METHODS = ["_enter_tree", "_exit_tree", "_ready", "_process"];

const VIRTUAL_OWNERS = ["Node", "Node2D", "Node3D", "Control"];

const EXTRA_GLOBAL_IMPLEMENTED = ["print", "print_debug", "print_rich", "print_verbose", "printerr", "printraw", "prints", "printt"];

const EXTRA_PROPS = { Node: ["name"] };

const EXTRA_METHODS = { FileAccess: ["get_open_error"] };

function functionBody(source: string, fnName: string): string {
  const re = new RegExp(`(?:export\\s+)?function\\s+${fnName}\\s*\\(`, "g");
  const m = re.exec(source);
  if (m === null) return "";
  const start = source.indexOf("{", m.index + m[0].length);
  if (start < 0) return "";
  let depth = 0;
  let quote = "";
  for (let i = start; i < source.length; i++) {
    const ch = source[i] as string;
    if (quote !== "") {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      const nl = source.indexOf("\n", i);
      i = nl < 0 ? source.length : nl;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? source.length : end + 1;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, i);
    }
  }
  return source.slice(start + 1);
}

function collectLabels(file: string, fnName: string): Set<string> {
  const body = functionBody(readFileSync(join(ROOT, file), "utf8"), fnName);
  const out = new Set<string>();
  for (const m of body.matchAll(/case\s+"([^"]+)"/g)) out.add(m[1] as string);
  for (const m of body.matchAll(/name\s*===\s*"([^"]+)"/g)) out.add(m[1] as string);
  for (const m of body.matchAll(/"([^"]+)"\s*===\s*name/g)) out.add(m[1] as string);
  return out;
}

export function buildInventories() {
  const methods = Object.create(null);
  const props = Object.create(null);
  const add = (owner, kind, names) => {
    const table = kind === "method" ? methods : props;
    if (table[owner] === undefined) table[owner] = new Set();
    for (const n of names) table[owner].add(n);
  };
  for (const [type, table] of Object.entries(BUILTIN_METHODS)) add(type, "method", Object.keys(table));
  for (const [type, names] of Object.entries(BUILTIN_PROPS)) add(type, "prop", names);
  add("Object", "method", OBJECT_METHODS);
  for (const owner of VIRTUAL_OWNERS) add(owner, "method", VIRTUAL_METHODS);
  for (const [owner, names] of Object.entries(EXTRA_PROPS)) add(owner, "prop", names);
  for (const [owner, names] of Object.entries(EXTRA_METHODS)) add(owner, "method", names);
  for (const rule of ENGINE_RULES) {
    const labels = collectLabels(rule.file, rule.fn);
    for (const owner of rule.owners) add(owner, rule.kind, labels);
  }
  return {
    methods: Object.fromEntries(Object.entries(methods).map(([k, v]) => [k, [...v].sort()])),
    props: Object.fromEntries(Object.entries(props).map(([k, v]) => [k, [...v].sort()])),
    globals: {
      callables: GLOBAL_CALLABLES,
      implemented: [...new Set([...GLOBAL_CALLABLE_IMPLEMENTED, ...EXTRA_GLOBAL_IMPLEMENTED])].sort(),
      constants: Object.keys(GLOBAL_CONSTANTS).sort(),
    },
    ctors: Object.keys(CTOR_ARMS).sort(),
    builtinTypes: [...new Set([...Object.keys(BUILTIN_METHODS), ...Object.keys(BUILTIN_PROPS)])].sort(),
  };
}

export function classChain(classes, name) {
  const out = [];
  const seen = new Set();
  let cur = name;
  while (typeof cur === "string" && !seen.has(cur)) {
    seen.add(cur);
    out.push(cur);
    cur = classes[cur]?.i ?? null;
  }
  return out;
}

export function hasMember(inv, kind, classes, owner, name) {
  const table = kind === "method" ? inv.methods : inv.props;
  for (const cls of classChain(classes, owner)) {
    if (table[cls]?.includes(name)) return true;
  }
  return false;
}
