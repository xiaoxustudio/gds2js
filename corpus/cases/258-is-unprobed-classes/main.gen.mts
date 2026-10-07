// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let objs = rt.V.array(rt.GArray.of([rt.V.object(new Inner()), rt.V.object(this), rt.V.object(__gd_d_Inner), rt.nativeClass("Node"), rt.nativeClass("Image"), rt.wrapValue(rt.attribute(rt.V.object(new Inner()), "tick")), rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a")]))]), rt.V.str("s"), rt.V.int(1), rt.V.nil(), rt.globalCallable("abs"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("c001|Node2D|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c002|Node2D|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c003|Node2D|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c004|Node2D|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c005|Node2D|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c006|Node2D|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c007|Node2D|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c008|Node2D|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c009|Node2D|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c010|Node2D|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c011|Node2D|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c012|Node2D|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c013|Node2D|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Node2D")]));
    print(rt.showArgs([rt.V.str("c014|Label|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Label")]));
    print(rt.showArgs([rt.V.str("c015|Label|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Label")]));
    print(rt.showArgs([rt.V.str("c016|Label|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Label")]));
    print(rt.showArgs([rt.V.str("c017|Label|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Label")]));
    print(rt.showArgs([rt.V.str("c018|Label|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Label")]));
    print(rt.showArgs([rt.V.str("c019|Label|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Label")]));
    print(rt.showArgs([rt.V.str("c020|Label|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Label")]));
    print(rt.showArgs([rt.V.str("c021|Label|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Label")]));
    print(rt.showArgs([rt.V.str("c022|Label|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Label")]));
    print(rt.showArgs([rt.V.str("c023|Label|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Label")]));
    print(rt.showArgs([rt.V.str("c024|Label|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Label")]));
    print(rt.showArgs([rt.V.str("c025|Label|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Label")]));
    print(rt.showArgs([rt.V.str("c026|Label|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Label")]));
    print(rt.showArgs([rt.V.str("c027|Timer|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Timer")]));
    print(rt.showArgs([rt.V.str("c028|Timer|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Timer")]));
    print(rt.showArgs([rt.V.str("c029|Timer|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Timer")]));
    print(rt.showArgs([rt.V.str("c030|Timer|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Timer")]));
    print(rt.showArgs([rt.V.str("c031|Timer|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Timer")]));
    print(rt.showArgs([rt.V.str("c032|Timer|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Timer")]));
    print(rt.showArgs([rt.V.str("c033|Timer|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Timer")]));
    print(rt.showArgs([rt.V.str("c034|Timer|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Timer")]));
    print(rt.showArgs([rt.V.str("c035|Timer|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Timer")]));
    print(rt.showArgs([rt.V.str("c036|Timer|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Timer")]));
    print(rt.showArgs([rt.V.str("c037|Timer|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Timer")]));
    print(rt.showArgs([rt.V.str("c038|Timer|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Timer")]));
    print(rt.showArgs([rt.V.str("c039|Timer|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Timer")]));
    print(rt.showArgs([rt.V.str("c040|HTTPRequest|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c041|HTTPRequest|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c042|HTTPRequest|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c043|HTTPRequest|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c044|HTTPRequest|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c045|HTTPRequest|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c046|HTTPRequest|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c047|HTTPRequest|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c048|HTTPRequest|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c049|HTTPRequest|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c050|HTTPRequest|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c051|HTTPRequest|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c052|HTTPRequest|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "HTTPRequest")]));
    print(rt.showArgs([rt.V.str("c053|Image|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Image")]));
    print(rt.showArgs([rt.V.str("c054|Image|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Image")]));
    print(rt.showArgs([rt.V.str("c055|Image|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Image")]));
    print(rt.showArgs([rt.V.str("c056|Image|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Image")]));
    print(rt.showArgs([rt.V.str("c057|Image|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Image")]));
    print(rt.showArgs([rt.V.str("c058|Image|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Image")]));
    print(rt.showArgs([rt.V.str("c059|Image|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Image")]));
    print(rt.showArgs([rt.V.str("c060|Image|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Image")]));
    print(rt.showArgs([rt.V.str("c061|Image|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Image")]));
    print(rt.showArgs([rt.V.str("c062|Image|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Image")]));
    print(rt.showArgs([rt.V.str("c063|Image|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Image")]));
    print(rt.showArgs([rt.V.str("c064|Image|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Image")]));
    print(rt.showArgs([rt.V.str("c065|Image|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Image")]));
    print(rt.showArgs([rt.V.str("c066|InputEvent|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c067|InputEvent|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c068|InputEvent|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c069|InputEvent|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c070|InputEvent|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c071|InputEvent|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c072|InputEvent|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c073|InputEvent|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c074|InputEvent|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c075|InputEvent|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c076|InputEvent|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c077|InputEvent|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c078|InputEvent|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "InputEvent")]));
    print(rt.showArgs([rt.V.str("c079|Camera3D|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c080|Camera3D|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c081|Camera3D|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c082|Camera3D|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c083|Camera3D|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c084|Camera3D|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c085|Camera3D|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c086|Camera3D|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c087|Camera3D|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c088|Camera3D|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c089|Camera3D|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c090|Camera3D|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c091|Camera3D|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Camera3D")]));
    print(rt.showArgs([rt.V.str("c092|StyleBoxFlat|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c093|StyleBoxFlat|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c094|StyleBoxFlat|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c095|StyleBoxFlat|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c096|StyleBoxFlat|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c097|StyleBoxFlat|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c098|StyleBoxFlat|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c099|StyleBoxFlat|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c100|StyleBoxFlat|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c101|StyleBoxFlat|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c102|StyleBoxFlat|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c103|StyleBoxFlat|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c104|StyleBoxFlat|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "StyleBoxFlat")]));
    print(rt.showArgs([rt.V.str("c105|Object|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Object")]));
    print(rt.showArgs([rt.V.str("c106|Object|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Object")]));
    print(rt.showArgs([rt.V.str("c107|Object|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Object")]));
    print(rt.showArgs([rt.V.str("c108|Object|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Object")]));
    print(rt.showArgs([rt.V.str("c109|Object|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Object")]));
    print(rt.showArgs([rt.V.str("c110|Object|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Object")]));
    print(rt.showArgs([rt.V.str("c111|Object|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Object")]));
    print(rt.showArgs([rt.V.str("c112|Object|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Object")]));
    print(rt.showArgs([rt.V.str("c113|Object|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Object")]));
    print(rt.showArgs([rt.V.str("c114|Object|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Object")]));
    print(rt.showArgs([rt.V.str("c115|Object|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Object")]));
    print(rt.showArgs([rt.V.str("c116|Object|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Object")]));
    print(rt.showArgs([rt.V.str("c117|Object|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Object")]));
    print(rt.showArgs([rt.V.str("c118|RefCounted|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c119|RefCounted|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c120|RefCounted|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c121|RefCounted|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c122|RefCounted|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c123|RefCounted|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c124|RefCounted|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c125|RefCounted|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c126|RefCounted|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c127|RefCounted|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c128|RefCounted|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c129|RefCounted|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c130|RefCounted|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "RefCounted")]));
    print(rt.showArgs([rt.V.str("c131|Resource|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Resource")]));
    print(rt.showArgs([rt.V.str("c132|Resource|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Resource")]));
    print(rt.showArgs([rt.V.str("c133|Resource|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Resource")]));
    print(rt.showArgs([rt.V.str("c134|Resource|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Resource")]));
    print(rt.showArgs([rt.V.str("c135|Resource|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Resource")]));
    print(rt.showArgs([rt.V.str("c136|Resource|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Resource")]));
    print(rt.showArgs([rt.V.str("c137|Resource|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Resource")]));
    print(rt.showArgs([rt.V.str("c138|Resource|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Resource")]));
    print(rt.showArgs([rt.V.str("c139|Resource|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Resource")]));
    print(rt.showArgs([rt.V.str("c140|Resource|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Resource")]));
    print(rt.showArgs([rt.V.str("c141|Resource|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Resource")]));
    print(rt.showArgs([rt.V.str("c142|Resource|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Resource")]));
    print(rt.showArgs([rt.V.str("c143|Resource|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Resource")]));
    print(rt.showArgs([rt.V.str("c144|GDScript|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c145|GDScript|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c146|GDScript|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c147|GDScript|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c148|GDScript|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c149|GDScript|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c150|GDScript|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c151|GDScript|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c152|GDScript|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c153|GDScript|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c154|GDScript|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c155|GDScript|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c156|GDScript|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "GDScript")]));
    print(rt.showArgs([rt.V.str("c157|Node|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Node")]));
    print(rt.showArgs([rt.V.str("c158|Node|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Node")]));
    print(rt.showArgs([rt.V.str("c159|Node|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Node")]));
    print(rt.showArgs([rt.V.str("c160|Node|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Node")]));
    print(rt.showArgs([rt.V.str("c161|Node|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Node")]));
    print(rt.showArgs([rt.V.str("c162|Node|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Node")]));
    print(rt.showArgs([rt.V.str("c163|Node|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Node")]));
    print(rt.showArgs([rt.V.str("c164|Node|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Node")]));
    print(rt.showArgs([rt.V.str("c165|Node|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Node")]));
    print(rt.showArgs([rt.V.str("c166|Node|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Node")]));
    print(rt.showArgs([rt.V.str("c167|Node|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Node")]));
    print(rt.showArgs([rt.V.str("c168|Node|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Node")]));
    print(rt.showArgs([rt.V.str("c169|Node|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Node")]));
    print(rt.showArgs([rt.V.str("c170|SceneTree|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c171|SceneTree|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c172|SceneTree|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c173|SceneTree|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c174|SceneTree|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c175|SceneTree|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c176|SceneTree|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c177|SceneTree|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c178|SceneTree|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c179|SceneTree|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c180|SceneTree|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c181|SceneTree|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c182|SceneTree|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "SceneTree")]));
    print(rt.showArgs([rt.V.str("c183|MainLoop|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c184|MainLoop|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c185|MainLoop|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c186|MainLoop|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c187|MainLoop|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c188|MainLoop|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c189|MainLoop|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c190|MainLoop|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c191|MainLoop|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c192|MainLoop|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c193|MainLoop|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c194|MainLoop|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c195|MainLoop|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "MainLoop")]));
    print(rt.showArgs([rt.V.str("c196|Callable|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Callable")]));
    print(rt.showArgs([rt.V.str("c197|Callable|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Callable")]));
    print(rt.showArgs([rt.V.str("c198|Callable|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Callable")]));
    print(rt.showArgs([rt.V.str("c199|Callable|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Callable")]));
    print(rt.showArgs([rt.V.str("c200|Callable|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Callable")]));
    print(rt.showArgs([rt.V.str("c201|Callable|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Callable")]));
    print(rt.showArgs([rt.V.str("c202|Callable|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Callable")]));
    print(rt.showArgs([rt.V.str("c203|Callable|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Callable")]));
    print(rt.showArgs([rt.V.str("c204|Callable|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Callable")]));
    print(rt.showArgs([rt.V.str("c205|Callable|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Callable")]));
    print(rt.showArgs([rt.V.str("c206|Callable|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Callable")]));
    print(rt.showArgs([rt.V.str("c207|Callable|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Callable")]));
    print(rt.showArgs([rt.V.str("c208|Callable|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Callable")]));
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  tick = new rt.Signal("tick");
  k = rt.V.int(1);

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["k"]);
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["k"], {}, (o) => { const s = o as Inner; return [s.k]; });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
