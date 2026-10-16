// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(8);
      let objs = rt.V.array(rt.GArray.of([rt.V.object(new Inner()), rt.V.object(this), rt.V.object(__gd_d_Inner), rt.nativeClass("Node"), rt.nativeClass("Image"), rt.wrapValue(rt.attribute(rt.V.object(new Inner()), "tick")), rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a")]))]), rt.V.str("s"), rt.V.int(1), rt.V.nil(), rt.globalCallable("abs"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("c001|Node2D|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Node2D")]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("c002|Node2D|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Node2D")]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("c003|Node2D|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Node2D")]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("c004|Node2D|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Node2D")]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("c005|Node2D|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Node2D")]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("c006|Node2D|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Node2D")]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("c007|Node2D|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Node2D")]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("c008|Node2D|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Node2D")]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("c009|Node2D|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Node2D")]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("c010|Node2D|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Node2D")]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("c011|Node2D|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Node2D")]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("c012|Node2D|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Node2D")]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("c013|Node2D|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Node2D")]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("c014|Label|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Label")]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("c015|Label|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Label")]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("c016|Label|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Label")]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("c017|Label|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Label")]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("c018|Label|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Label")]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("c019|Label|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Label")]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("c020|Label|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Label")]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("c021|Label|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Label")]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("c022|Label|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Label")]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("c023|Label|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Label")]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("c024|Label|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Label")]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("c025|Label|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Label")]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("c026|Label|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Label")]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("c027|Timer|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Timer")]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("c028|Timer|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Timer")]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("c029|Timer|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Timer")]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("c030|Timer|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Timer")]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("c031|Timer|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Timer")]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("c032|Timer|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Timer")]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("c033|Timer|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Timer")]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("c034|Timer|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Timer")]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("c035|Timer|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Timer")]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("c036|Timer|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Timer")]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("c037|Timer|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Timer")]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("c038|Timer|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Timer")]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("c039|Timer|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Timer")]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("c040|HTTPRequest|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "HTTPRequest")]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("c041|HTTPRequest|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "HTTPRequest")]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("c042|HTTPRequest|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "HTTPRequest")]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("c043|HTTPRequest|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "HTTPRequest")]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("c044|HTTPRequest|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "HTTPRequest")]));
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("c045|HTTPRequest|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "HTTPRequest")]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("c046|HTTPRequest|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "HTTPRequest")]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("c047|HTTPRequest|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "HTTPRequest")]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("c048|HTTPRequest|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "HTTPRequest")]));
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("c049|HTTPRequest|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "HTTPRequest")]));
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("c050|HTTPRequest|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "HTTPRequest")]));
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("c051|HTTPRequest|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "HTTPRequest")]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("c052|HTTPRequest|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "HTTPRequest")]));
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("c053|Image|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Image")]));
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("c054|Image|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Image")]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("c055|Image|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Image")]));
      rt.frameLine(64);
      print(rt.showArgs([rt.V.str("c056|Image|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Image")]));
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("c057|Image|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Image")]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("c058|Image|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Image")]));
      rt.frameLine(67);
      print(rt.showArgs([rt.V.str("c059|Image|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Image")]));
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("c060|Image|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Image")]));
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("c061|Image|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Image")]));
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("c062|Image|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Image")]));
      rt.frameLine(71);
      print(rt.showArgs([rt.V.str("c063|Image|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Image")]));
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("c064|Image|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Image")]));
      rt.frameLine(73);
      print(rt.showArgs([rt.V.str("c065|Image|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Image")]));
      rt.frameLine(74);
      print(rt.showArgs([rt.V.str("c066|InputEvent|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "InputEvent")]));
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("c067|InputEvent|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "InputEvent")]));
      rt.frameLine(76);
      print(rt.showArgs([rt.V.str("c068|InputEvent|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "InputEvent")]));
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("c069|InputEvent|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "InputEvent")]));
      rt.frameLine(78);
      print(rt.showArgs([rt.V.str("c070|InputEvent|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "InputEvent")]));
      rt.frameLine(79);
      print(rt.showArgs([rt.V.str("c071|InputEvent|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "InputEvent")]));
      rt.frameLine(80);
      print(rt.showArgs([rt.V.str("c072|InputEvent|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "InputEvent")]));
      rt.frameLine(81);
      print(rt.showArgs([rt.V.str("c073|InputEvent|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "InputEvent")]));
      rt.frameLine(82);
      print(rt.showArgs([rt.V.str("c074|InputEvent|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "InputEvent")]));
      rt.frameLine(83);
      print(rt.showArgs([rt.V.str("c075|InputEvent|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "InputEvent")]));
      rt.frameLine(84);
      print(rt.showArgs([rt.V.str("c076|InputEvent|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "InputEvent")]));
      rt.frameLine(85);
      print(rt.showArgs([rt.V.str("c077|InputEvent|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "InputEvent")]));
      rt.frameLine(86);
      print(rt.showArgs([rt.V.str("c078|InputEvent|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "InputEvent")]));
      rt.frameLine(87);
      print(rt.showArgs([rt.V.str("c079|Camera3D|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Camera3D")]));
      rt.frameLine(88);
      print(rt.showArgs([rt.V.str("c080|Camera3D|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Camera3D")]));
      rt.frameLine(89);
      print(rt.showArgs([rt.V.str("c081|Camera3D|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Camera3D")]));
      rt.frameLine(90);
      print(rt.showArgs([rt.V.str("c082|Camera3D|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Camera3D")]));
      rt.frameLine(91);
      print(rt.showArgs([rt.V.str("c083|Camera3D|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Camera3D")]));
      rt.frameLine(92);
      print(rt.showArgs([rt.V.str("c084|Camera3D|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Camera3D")]));
      rt.frameLine(93);
      print(rt.showArgs([rt.V.str("c085|Camera3D|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Camera3D")]));
      rt.frameLine(94);
      print(rt.showArgs([rt.V.str("c086|Camera3D|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Camera3D")]));
      rt.frameLine(95);
      print(rt.showArgs([rt.V.str("c087|Camera3D|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Camera3D")]));
      rt.frameLine(96);
      print(rt.showArgs([rt.V.str("c088|Camera3D|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Camera3D")]));
      rt.frameLine(97);
      print(rt.showArgs([rt.V.str("c089|Camera3D|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Camera3D")]));
      rt.frameLine(98);
      print(rt.showArgs([rt.V.str("c090|Camera3D|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Camera3D")]));
      rt.frameLine(99);
      print(rt.showArgs([rt.V.str("c091|Camera3D|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Camera3D")]));
      rt.frameLine(100);
      print(rt.showArgs([rt.V.str("c092|StyleBoxFlat|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "StyleBoxFlat")]));
      rt.frameLine(101);
      print(rt.showArgs([rt.V.str("c093|StyleBoxFlat|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "StyleBoxFlat")]));
      rt.frameLine(102);
      print(rt.showArgs([rt.V.str("c094|StyleBoxFlat|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "StyleBoxFlat")]));
      rt.frameLine(103);
      print(rt.showArgs([rt.V.str("c095|StyleBoxFlat|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "StyleBoxFlat")]));
      rt.frameLine(104);
      print(rt.showArgs([rt.V.str("c096|StyleBoxFlat|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "StyleBoxFlat")]));
      rt.frameLine(105);
      print(rt.showArgs([rt.V.str("c097|StyleBoxFlat|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "StyleBoxFlat")]));
      rt.frameLine(106);
      print(rt.showArgs([rt.V.str("c098|StyleBoxFlat|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "StyleBoxFlat")]));
      rt.frameLine(107);
      print(rt.showArgs([rt.V.str("c099|StyleBoxFlat|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "StyleBoxFlat")]));
      rt.frameLine(108);
      print(rt.showArgs([rt.V.str("c100|StyleBoxFlat|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "StyleBoxFlat")]));
      rt.frameLine(109);
      print(rt.showArgs([rt.V.str("c101|StyleBoxFlat|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "StyleBoxFlat")]));
      rt.frameLine(110);
      print(rt.showArgs([rt.V.str("c102|StyleBoxFlat|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "StyleBoxFlat")]));
      rt.frameLine(111);
      print(rt.showArgs([rt.V.str("c103|StyleBoxFlat|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "StyleBoxFlat")]));
      rt.frameLine(112);
      print(rt.showArgs([rt.V.str("c104|StyleBoxFlat|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "StyleBoxFlat")]));
      rt.frameLine(113);
      print(rt.showArgs([rt.V.str("c105|Object|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Object")]));
      rt.frameLine(114);
      print(rt.showArgs([rt.V.str("c106|Object|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Object")]));
      rt.frameLine(115);
      print(rt.showArgs([rt.V.str("c107|Object|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Object")]));
      rt.frameLine(116);
      print(rt.showArgs([rt.V.str("c108|Object|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Object")]));
      rt.frameLine(117);
      print(rt.showArgs([rt.V.str("c109|Object|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Object")]));
      rt.frameLine(118);
      print(rt.showArgs([rt.V.str("c110|Object|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Object")]));
      rt.frameLine(119);
      print(rt.showArgs([rt.V.str("c111|Object|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Object")]));
      rt.frameLine(120);
      print(rt.showArgs([rt.V.str("c112|Object|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Object")]));
      rt.frameLine(121);
      print(rt.showArgs([rt.V.str("c113|Object|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Object")]));
      rt.frameLine(122);
      print(rt.showArgs([rt.V.str("c114|Object|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Object")]));
      rt.frameLine(123);
      print(rt.showArgs([rt.V.str("c115|Object|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Object")]));
      rt.frameLine(124);
      print(rt.showArgs([rt.V.str("c116|Object|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Object")]));
      rt.frameLine(125);
      print(rt.showArgs([rt.V.str("c117|Object|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Object")]));
      rt.frameLine(126);
      print(rt.showArgs([rt.V.str("c118|RefCounted|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "RefCounted")]));
      rt.frameLine(127);
      print(rt.showArgs([rt.V.str("c119|RefCounted|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "RefCounted")]));
      rt.frameLine(128);
      print(rt.showArgs([rt.V.str("c120|RefCounted|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "RefCounted")]));
      rt.frameLine(129);
      print(rt.showArgs([rt.V.str("c121|RefCounted|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "RefCounted")]));
      rt.frameLine(130);
      print(rt.showArgs([rt.V.str("c122|RefCounted|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "RefCounted")]));
      rt.frameLine(131);
      print(rt.showArgs([rt.V.str("c123|RefCounted|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "RefCounted")]));
      rt.frameLine(132);
      print(rt.showArgs([rt.V.str("c124|RefCounted|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "RefCounted")]));
      rt.frameLine(133);
      print(rt.showArgs([rt.V.str("c125|RefCounted|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "RefCounted")]));
      rt.frameLine(134);
      print(rt.showArgs([rt.V.str("c126|RefCounted|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "RefCounted")]));
      rt.frameLine(135);
      print(rt.showArgs([rt.V.str("c127|RefCounted|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "RefCounted")]));
      rt.frameLine(136);
      print(rt.showArgs([rt.V.str("c128|RefCounted|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "RefCounted")]));
      rt.frameLine(137);
      print(rt.showArgs([rt.V.str("c129|RefCounted|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "RefCounted")]));
      rt.frameLine(138);
      print(rt.showArgs([rt.V.str("c130|RefCounted|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "RefCounted")]));
      rt.frameLine(139);
      print(rt.showArgs([rt.V.str("c131|Resource|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Resource")]));
      rt.frameLine(140);
      print(rt.showArgs([rt.V.str("c132|Resource|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Resource")]));
      rt.frameLine(141);
      print(rt.showArgs([rt.V.str("c133|Resource|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Resource")]));
      rt.frameLine(142);
      print(rt.showArgs([rt.V.str("c134|Resource|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Resource")]));
      rt.frameLine(143);
      print(rt.showArgs([rt.V.str("c135|Resource|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Resource")]));
      rt.frameLine(144);
      print(rt.showArgs([rt.V.str("c136|Resource|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Resource")]));
      rt.frameLine(145);
      print(rt.showArgs([rt.V.str("c137|Resource|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Resource")]));
      rt.frameLine(146);
      print(rt.showArgs([rt.V.str("c138|Resource|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Resource")]));
      rt.frameLine(147);
      print(rt.showArgs([rt.V.str("c139|Resource|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Resource")]));
      rt.frameLine(148);
      print(rt.showArgs([rt.V.str("c140|Resource|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Resource")]));
      rt.frameLine(149);
      print(rt.showArgs([rt.V.str("c141|Resource|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Resource")]));
      rt.frameLine(150);
      print(rt.showArgs([rt.V.str("c142|Resource|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Resource")]));
      rt.frameLine(151);
      print(rt.showArgs([rt.V.str("c143|Resource|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Resource")]));
      rt.frameLine(152);
      print(rt.showArgs([rt.V.str("c144|GDScript|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "GDScript")]));
      rt.frameLine(153);
      print(rt.showArgs([rt.V.str("c145|GDScript|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "GDScript")]));
      rt.frameLine(154);
      print(rt.showArgs([rt.V.str("c146|GDScript|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "GDScript")]));
      rt.frameLine(155);
      print(rt.showArgs([rt.V.str("c147|GDScript|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "GDScript")]));
      rt.frameLine(156);
      print(rt.showArgs([rt.V.str("c148|GDScript|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "GDScript")]));
      rt.frameLine(157);
      print(rt.showArgs([rt.V.str("c149|GDScript|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "GDScript")]));
      rt.frameLine(158);
      print(rt.showArgs([rt.V.str("c150|GDScript|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "GDScript")]));
      rt.frameLine(159);
      print(rt.showArgs([rt.V.str("c151|GDScript|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "GDScript")]));
      rt.frameLine(160);
      print(rt.showArgs([rt.V.str("c152|GDScript|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "GDScript")]));
      rt.frameLine(161);
      print(rt.showArgs([rt.V.str("c153|GDScript|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "GDScript")]));
      rt.frameLine(162);
      print(rt.showArgs([rt.V.str("c154|GDScript|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "GDScript")]));
      rt.frameLine(163);
      print(rt.showArgs([rt.V.str("c155|GDScript|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "GDScript")]));
      rt.frameLine(164);
      print(rt.showArgs([rt.V.str("c156|GDScript|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "GDScript")]));
      rt.frameLine(165);
      print(rt.showArgs([rt.V.str("c157|Node|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Node")]));
      rt.frameLine(166);
      print(rt.showArgs([rt.V.str("c158|Node|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Node")]));
      rt.frameLine(167);
      print(rt.showArgs([rt.V.str("c159|Node|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Node")]));
      rt.frameLine(168);
      print(rt.showArgs([rt.V.str("c160|Node|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Node")]));
      rt.frameLine(169);
      print(rt.showArgs([rt.V.str("c161|Node|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Node")]));
      rt.frameLine(170);
      print(rt.showArgs([rt.V.str("c162|Node|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Node")]));
      rt.frameLine(171);
      print(rt.showArgs([rt.V.str("c163|Node|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Node")]));
      rt.frameLine(172);
      print(rt.showArgs([rt.V.str("c164|Node|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Node")]));
      rt.frameLine(173);
      print(rt.showArgs([rt.V.str("c165|Node|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Node")]));
      rt.frameLine(174);
      print(rt.showArgs([rt.V.str("c166|Node|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Node")]));
      rt.frameLine(175);
      print(rt.showArgs([rt.V.str("c167|Node|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Node")]));
      rt.frameLine(176);
      print(rt.showArgs([rt.V.str("c168|Node|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Node")]));
      rt.frameLine(177);
      print(rt.showArgs([rt.V.str("c169|Node|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Node")]));
      rt.frameLine(178);
      print(rt.showArgs([rt.V.str("c170|SceneTree|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "SceneTree")]));
      rt.frameLine(179);
      print(rt.showArgs([rt.V.str("c171|SceneTree|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "SceneTree")]));
      rt.frameLine(180);
      print(rt.showArgs([rt.V.str("c172|SceneTree|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "SceneTree")]));
      rt.frameLine(181);
      print(rt.showArgs([rt.V.str("c173|SceneTree|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "SceneTree")]));
      rt.frameLine(182);
      print(rt.showArgs([rt.V.str("c174|SceneTree|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "SceneTree")]));
      rt.frameLine(183);
      print(rt.showArgs([rt.V.str("c175|SceneTree|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "SceneTree")]));
      rt.frameLine(184);
      print(rt.showArgs([rt.V.str("c176|SceneTree|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "SceneTree")]));
      rt.frameLine(185);
      print(rt.showArgs([rt.V.str("c177|SceneTree|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "SceneTree")]));
      rt.frameLine(186);
      print(rt.showArgs([rt.V.str("c178|SceneTree|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "SceneTree")]));
      rt.frameLine(187);
      print(rt.showArgs([rt.V.str("c179|SceneTree|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "SceneTree")]));
      rt.frameLine(188);
      print(rt.showArgs([rt.V.str("c180|SceneTree|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "SceneTree")]));
      rt.frameLine(189);
      print(rt.showArgs([rt.V.str("c181|SceneTree|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "SceneTree")]));
      rt.frameLine(190);
      print(rt.showArgs([rt.V.str("c182|SceneTree|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "SceneTree")]));
      rt.frameLine(191);
      print(rt.showArgs([rt.V.str("c183|MainLoop|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "MainLoop")]));
      rt.frameLine(192);
      print(rt.showArgs([rt.V.str("c184|MainLoop|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "MainLoop")]));
      rt.frameLine(193);
      print(rt.showArgs([rt.V.str("c185|MainLoop|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "MainLoop")]));
      rt.frameLine(194);
      print(rt.showArgs([rt.V.str("c186|MainLoop|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "MainLoop")]));
      rt.frameLine(195);
      print(rt.showArgs([rt.V.str("c187|MainLoop|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "MainLoop")]));
      rt.frameLine(196);
      print(rt.showArgs([rt.V.str("c188|MainLoop|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "MainLoop")]));
      rt.frameLine(197);
      print(rt.showArgs([rt.V.str("c189|MainLoop|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "MainLoop")]));
      rt.frameLine(198);
      print(rt.showArgs([rt.V.str("c190|MainLoop|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "MainLoop")]));
      rt.frameLine(199);
      print(rt.showArgs([rt.V.str("c191|MainLoop|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "MainLoop")]));
      rt.frameLine(200);
      print(rt.showArgs([rt.V.str("c192|MainLoop|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "MainLoop")]));
      rt.frameLine(201);
      print(rt.showArgs([rt.V.str("c193|MainLoop|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "MainLoop")]));
      rt.frameLine(202);
      print(rt.showArgs([rt.V.str("c194|MainLoop|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "MainLoop")]));
      rt.frameLine(203);
      print(rt.showArgs([rt.V.str("c195|MainLoop|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "MainLoop")]));
      rt.frameLine(204);
      print(rt.showArgs([rt.V.str("c196|Callable|inst|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(0))), "Callable")]));
      rt.frameLine(205);
      print(rt.showArgs([rt.V.str("c197|Callable|self|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(1))), "Callable")]));
      rt.frameLine(206);
      print(rt.showArgs([rt.V.str("c198|Callable|clsval|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(2))), "Callable")]));
      rt.frameLine(207);
      print(rt.showArgs([rt.V.str("c199|Callable|NodeCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(3))), "Callable")]));
      rt.frameLine(208);
      print(rt.showArgs([rt.V.str("c200|Callable|ImageCls|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(4))), "Callable")]));
      rt.frameLine(209);
      print(rt.showArgs([rt.V.str("c201|Callable|signal|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(5))), "Callable")]));
      rt.frameLine(210);
      print(rt.showArgs([rt.V.str("c202|Callable|vec2|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(6))), "Callable")]));
      rt.frameLine(211);
      print(rt.showArgs([rt.V.str("c203|Callable|packed|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(7))), "Callable")]));
      rt.frameLine(212);
      print(rt.showArgs([rt.V.str("c204|Callable|str|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(8))), "Callable")]));
      rt.frameLine(213);
      print(rt.showArgs([rt.V.str("c205|Callable|int|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(9))), "Callable")]));
      rt.frameLine(214);
      print(rt.showArgs([rt.V.str("c206|Callable|nil|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(10))), "Callable")]));
      rt.frameLine(215);
      print(rt.showArgs([rt.V.str("c207|Callable|callable|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(11))), "Callable")]));
      rt.frameLine(216);
      print(rt.showArgs([rt.V.str("c208|Callable|array|"), rt.isType(rt.wrapValue(rt.index(objs, rt.V.int(12))), "Callable")]));
      rt.frameLine(217);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
  declare tick: rt.Signal;
  declare k: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(5);
      this.tick = new rt.Signal("tick");
      rt.frameLine(4);
      this.k = rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["k"], (o) => { const s = o as Inner; return [s.k]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["k"], {}, (o) => { const s = o as Inner; return [s.k]; });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
