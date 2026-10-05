// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let builtins = rt.V.array(rt.GArray.of([rt.V.str("Nil"), rt.V.str("bool"), rt.V.str("int"), rt.V.str("float"), rt.V.str("String"), rt.V.str("Vector2"), rt.V.str("Vector2i"), rt.V.str("Rect2"), rt.V.str("Rect2i"), rt.V.str("Vector3"), rt.V.str("Vector3i"), rt.V.str("Transform2D"), rt.V.str("Vector4"), rt.V.str("Vector4i"), rt.V.str("Plane"), rt.V.str("Quaternion"), rt.V.str("AABB"), rt.V.str("Basis"), rt.V.str("Transform3D"), rt.V.str("Projection"), rt.V.str("Color"), rt.V.str("StringName"), rt.V.str("NodePath"), rt.V.str("RID"), rt.V.str("Object"), rt.V.str("Callable"), rt.V.str("Signal"), rt.V.str("Dictionary"), rt.V.str("Array"), rt.V.str("PackedByteArray"), rt.V.str("PackedInt32Array"), rt.V.str("PackedInt64Array"), rt.V.str("PackedFloat32Array"), rt.V.str("PackedFloat64Array"), rt.V.str("PackedStringArray"), rt.V.str("PackedVector2Array"), rt.V.str("PackedVector3Array"), rt.V.str("PackedColorArray"), rt.V.str("PackedVector4Array")]));
    for (let x of rt.iter(builtins)) {
      print(rt.showArgs([rt.V.str("b|"), x, rt.V.str("|"), rt.gTypeExists(x)]));
    }
    let classes = rt.V.array(rt.GArray.of([rt.V.str("Node"), rt.V.str("Node2D"), rt.V.str("Resource"), rt.V.str("RefCounted"), rt.V.str("HTTPRequest"), rt.V.str("GDScript"), rt.V.str("SceneTree"), rt.V.str("MainLoop"), rt.V.str("Node3D"), rt.V.str("Camera2D"), rt.V.str("Label"), rt.V.str("godot"), rt.V.str("Variant"), rt.V.str("CharacterBody2D"), rt.V.str("RenderingDevice"), rt.V.str("AudioStreamPlayback")]));
    for (let x of rt.iter(classes)) {
      print(rt.showArgs([rt.V.str("c|"), x, rt.V.str("|"), rt.gTypeExists(x)]));
    }
    let misses = rt.V.array(rt.GArray.of([rt.V.str(""), rt.V.str(" "), rt.V.str("node"), rt.V.str("Int"), rt.V.str("INT"), rt.V.str("No Such"), rt.V.str("Vector"), rt.V.str("Str"), rt.V.str("Object "), rt.V.str("TYPE_INT"), rt.V.str("[Node]")]));
    for (let x of rt.iter(misses)) {
      print(rt.showArgs([rt.V.str("m|"), x, rt.V.str("|"), rt.gTypeExists(x)]));
    }
    print(rt.showArgs([rt.V.str("k01|"), rt.typeOf(rt.gTypeExists(rt.V.str("Node")))]));
    print(rt.showArgs([rt.V.str("k02|"), rt.gTypeExists(rt.V.str("ImageFormat")), rt.V.str("|"), rt.gTypeExists(rt.V.str("TextServer")), rt.V.str("|"), rt.gTypeExists(rt.V.str("PhysicsServer2D"))]));
    print(rt.showArgs([rt.V.str("k03|"), rt.gTypeExists(rt.V.str("SQLite")), rt.V.str("|"), rt.gTypeExists(rt.V.str("EditorNode")), rt.V.str("|"), rt.gTypeExists(rt.V.str("JSValue")), rt.V.str("|"), rt.gTypeExists(rt.V.str("PlaceHolderTexture2D"))]));
    let f = rt.globalCallable("type_exists");
    print(rt.showArgs([rt.V.str("z01|"), rt.typeOf(f), rt.V.str("|"), f, rt.V.str("|"), rt.method(f, "get_method", []), rt.V.str("|"), rt.method(f, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("z02|"), rt.variantHash([rt.globalCallable("type_exists")]), rt.V.str("|"), rt.variantHash([rt.V.str("type_exists")]), rt.V.str("|"), rt.ops.eq(rt.globalCallable("type_exists"), rt.globalCallable("type_exists")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("type_exists"), rt.globalCallable("error_string"))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
