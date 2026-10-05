import { V, Tag, type Variant } from "./tags";
import { nextObjectId } from "./identity";

/**
 * 引擎类名当值用（`var k = Node`）：4.6.3 实测 `typeof` 24、`Node == Node` 真、`Node == Label` 假、
 * 当字典键照身份分格（`{Node: 1}` 的 `has(Node)` 真），而打印是 `<GDScriptNativeClass#一个号>` 那种带进程内号的串，
 * 复现不了 —— 所以这里只发**身份**，打印与 `.new()` 那几支各自响亮拒。
 */
export class GdNativeClass {
  /** 与实例同一套身份号：`keyOf` 与等式都读它，所以同一个类名两次取值必须落在同一个盒子上。 */
  readonly gdObjectId: number = nextObjectId();
  constructor(readonly className: string) {}
}

const BOXES = new Map<string, Variant>();

/** 一个类名一个盒子：实测 `Node == Node` 真，跨两次取值也是同一身份。 */
export function nativeClass(name: string): Variant {
  const hit = BOXES.get(name);
  if (hit !== undefined) return hit;
  const boxed = V.object(new GdNativeClass(name));
  BOXES.set(name, boxed);
  return boxed;
}

export function isNativeClass(v: Variant): boolean {
  return v.t === Tag.OBJECT && v.v instanceof GdNativeClass;
}

export function asNativeClass(v: Variant): GdNativeClass | null {
  return v.t === Tag.OBJECT && v.v instanceof GdNativeClass ? v.v : null;
}
