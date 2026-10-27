/**
 * 引擎类值上的成员面（`GDScriptNativeClass` 那一层）—— 生成物，别手改，改请重跑生成流程（`pnpm regen:engine-class-face`）。
*
 *   node tools/engine-class-face-probe.mjs
 *   node tools/engine-class-face.mjs write
*
 * 数据是 Godot 4.6.3 无头进程里对每支类取 `X.new` 后读回的实测值（typeof / str() 标签 /
 * `get_method()` / `is_valid()` / `get_argument_count()` / `is_null()` / `bind(1)` 之后的元数 /
 * `ClassDB.class_has_method()`）。发射期按这张表把成员名解成静态调用，运行时不背表 —— 原生轨
 * 明令不收按名取成员的写法。
 *
 * 表里没有的类或成员一律不在这一层放行：造实例要对象模型，那是阶段三。
 */

export type EngineClassMember = { member: string; typeofCode: number; label: string; args: number; boundArgs: number };

export const ENGINE_CLASS_FACES: Readonly<Record<string, readonly EngineClassMember[]>> = Object.freeze({
  "Node": [{"member":"new","typeofCode":25,"label":"GDScriptNativeClass::new","args":0,"boundArgs":-1}],
  "RefCounted": [{"member":"new","typeofCode":25,"label":"GDScriptNativeClass::new","args":0,"boundArgs":-1}],
  "Object": [{"member":"new","typeofCode":25,"label":"GDScriptNativeClass::new","args":0,"boundArgs":-1}],
  "Resource": [{"member":"new","typeofCode":25,"label":"GDScriptNativeClass::new","args":0,"boundArgs":-1}],
  "FileAccess": [{"member":"new","typeofCode":25,"label":"GDScriptNativeClass::new","args":0,"boundArgs":-1}],
  "GDScript": [{"member":"new","typeofCode":25,"label":"GDScriptNativeClass::new","args":0,"boundArgs":-1}],
});
