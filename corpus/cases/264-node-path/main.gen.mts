// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_NODE_PATH = rt.V.int(22);
const TYPE_STRING = rt.V.int(4);
const TYPE_STRING_NAME = rt.V.int(21);

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
      rt.frameLine(4);
      let p = rt.nodePathCtor([rt.V.str("a/b")]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("n01|"), rt.typeOf(p)]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("n02|"), p]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("n03|"), rt.strBuiltin([p])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("n04|"), rt.V.str(rt.varToStr(p))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("n05|"), rt.formatOf(rt.V.str("%s"), p, false)]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("n06|"), rt.nodePathCtor([rt.V.str("")])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("n07|"), rt.V.str(rt.varToStr(rt.nodePathCtor([rt.V.str("")])))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("n08|"), rt.nodePathCtor([rt.V.str("/a/b")])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("n09|"), rt.nodePathCtor([rt.V.str("a/b:1")])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("n10|"), rt.nodePathCtor([rt.V.str("a:b:c")])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("n11|"), rt.nodePathCtor([rt.V.str("x:")])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("n12|"), rt.nodePathCtor([rt.V.str("a//b")])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("n13|"), rt.nodePathCtor([rt.V.str("a/")])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("n14|"), rt.nodePathCtor([rt.V.str("//a")])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("n15|"), rt.nodePathCtor([rt.V.str("/")])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("n16|"), rt.nodePathCtor([rt.V.str(".")])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("n17|"), rt.nodePathCtor([rt.V.str("b/.")])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("n18|"), rt.nodePathCtor([rt.V.str("  a  ")])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("n19|"), rt.nodePathCtor([rt.V.str("A/b/../c")])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("n20|"), rt.method(p, "get_name_count", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("n21|"), rt.method(p, "get_subname_count", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("n22|"), rt.method(p, "get_name", [rt.V.int(0)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("n23|"), rt.method(p, "get_name", [rt.V.int(1)])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("n24|"), rt.typeOf(rt.method(p, "get_name", [rt.V.int(0)]))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("n25|"), rt.method(rt.nodePathCtor([rt.V.str("a:b")]), "get_subname", [rt.V.int(0)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("n26|"), rt.method(rt.nodePathCtor([rt.V.str("a:b:c")]), "get_subname", [rt.V.int(1)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("n27|"), rt.method(rt.nodePathCtor([rt.V.str("a:b:c")]), "get_subname_count", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("n28|"), rt.method(p, "is_absolute", [])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("n29|"), rt.method(rt.nodePathCtor([rt.V.str("/a")]), "is_absolute", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("n30|"), rt.method(rt.nodePathCtor([rt.V.str("")]), "is_empty", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("n31|"), rt.method(rt.nodePathCtor([rt.V.str("/")]), "is_empty", [])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("n32|"), rt.method(rt.nodePathCtor([rt.V.str("a/")]), "is_empty", [])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("n33|"), rt.method(p, "get_as_property_path", [])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("n34|"), rt.typeOf(rt.method(p, "get_as_property_path", []))]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("n35|"), rt.method(rt.method(p, "get_as_property_path", []), "get_name_count", [])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("n36|"), rt.method(rt.method(p, "get_as_property_path", []), "get_subname_count", [])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("n37|"), rt.strBuiltin([rt.method(rt.method(p, "get_as_property_path", []), "get_subname", [rt.V.int(0)])])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("n38|"), rt.typeOf(rt.method(rt.method(p, "get_as_property_path", []), "get_subname", [rt.V.int(0)]))]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("n39|"), rt.method(rt.nodePathCtor([rt.V.str("")]), "get_as_property_path", [])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("n40|"), rt.method(rt.nodePathCtor([rt.V.str("/")]), "get_as_property_path", [])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("n41|"), rt.method(rt.nodePathCtor([rt.V.str("x:")]), "get_as_property_path", [])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("n42|"), rt.method(rt.nodePathCtor([rt.V.str("a/b:1")]), "get_as_property_path", [])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("n43|"), rt.method(rt.nodePathCtor([rt.V.str("a:b:c")]), "get_as_property_path", [])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("n44|"), rt.ops.eq(p, rt.nodePathCtor([rt.V.str("a/b")]))]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("n45|"), rt.ops.eq(p, rt.nodePathCtor([rt.V.str("a/c")]))]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("n46|"), rt.ops.neq(p, rt.nodePathCtor([rt.V.str("a/c")]))]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("n47|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("/a/b")]), rt.nodePathCtor([rt.V.str("a/b")]))]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("n48|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str("a/b:")]))]));
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("n49|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("")]), rt.nodePathCtor([rt.V.str(".")]))]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("n50|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("A")]), rt.nodePathCtor([rt.V.str("a")]))]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("n51|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("A")]), rt.nodePathCtor([rt.method(rt.V.str("A"), "to_lower", [])]))]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("n52|"), rt.ops.eq(p, rt.V.nil())]));
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("n53|"), rt.ops.eq(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), rt.nodePathCtor([rt.V.str("a:b")]))]));
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("n54|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))])])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("n55|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_name_count", [])]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("n56|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_subname_count", [])]));
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("n57|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))]), "get_name_count", [])]));
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("n58|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))]), "get_subname_count", [])]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("n59|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))])])]));
      rt.frameLine(64);
      print(rt.showArgs([rt.V.str("n60|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + "/b"))]), "get_name_count", [])]));
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("n61|"), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + "/b"))]), "get_name", [rt.V.int(0)])])]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("n62|"), rt.nodePathCtor([rt.V.str((("a" + "\\") + "/b"))])]));
      rt.frameLine(67);
      print(rt.showArgs([rt.V.str("n63|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str("")])]))]));
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("n64|"), rt.method(rt.V.array(rt.GArray.of([p, rt.nodePathCtor([rt.V.str("/a")])])), "size", [])]));
      rt.frameLine(69);
      let d = rt.dictOf([]);
      rt.frameLine(70);
      {
        const _nv = rt.writeIdx(d, rt.nodePathCtor([rt.V.str("a/b")]), rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(71);
      {
        const _nv = rt.writeIdx(d, rt.nodePathCtor([rt.V.str("/a")]), rt.V.int(2));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("n65|"), d]));
      rt.frameLine(73);
      print(rt.showArgs([rt.V.str("n66|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
      rt.frameLine(74);
      print(rt.showArgs([rt.V.str("n67|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/c")])])]));
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("n68|"), rt.wrapValue(rt.index(d, rt.nodePathCtor([rt.V.str("/a")])))]));
      rt.frameLine(76);
      print(rt.showArgs([rt.V.str("n69|"), rt.method(d, "keys", [])]));
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("n70|"), rt.V.str(rt.varToStr(d))]));
      rt.frameLine(78);
      print(rt.showArgs([rt.V.str("n71|"), rt.strBuiltin([rt.nodePathCtor([])])]));
      rt.frameLine(79);
      print(rt.showArgs([rt.V.str("n72|"), rt.method(rt.nodePathCtor([]), "is_empty", [])]));
      rt.frameLine(80);
      print(rt.showArgs([rt.V.str("n73|"), rt.V.str(rt.varToStr(rt.nodePathCtor([])))]));
      rt.frameLine(81);
      print(rt.showArgs([rt.V.str("n74|"), rt.strBuiltin([rt.nodePathCtor([rt.stringCtor([rt.V.str("q")])])])]));
      rt.frameLine(82);
      print(rt.showArgs([rt.V.str("n75|"), rt.strBuiltin([rt.nodePathCtor([rt.V.stringName("a/b")])])]));
      rt.frameLine(83);
      print(rt.showArgs([rt.V.str("n76|"), rt.strBuiltin([rt.nodePathCtor([rt.nodePathCtor([rt.V.str("a:b")])])])]));
      rt.frameLine(84);
      print(rt.showArgs([rt.V.str("n77|"), rt.method(rt.nodePathCtor([rt.nodePathCtor([rt.V.str("a:b")])]), "get_subname_count", [])]));
      rt.frameLine(85);
      print(rt.showArgs([rt.V.str("n78|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str(("a" + "/b"))])])]));
      rt.frameLine(86);
      print(rt.showArgs([rt.V.str("n79|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str(("a" + "/b"))]))]));
      rt.frameLine(87);
      print(rt.showArgs([rt.V.str("n80|"), rt.isType(p, "NodePath")]));
      rt.frameLine(88);
      print(rt.showArgs([rt.V.str("n81|"), rt.strBuiltin([rt.variantConvert(p, TYPE_STRING, true)])]));
      rt.frameLine(89);
      print(rt.showArgs([rt.V.str("n82|"), rt.typeOf(rt.variantConvert(p, TYPE_STRING, true))]));
      rt.frameLine(90);
      print(rt.showArgs([rt.V.str("n83|"), rt.typeOf(rt.variantConvert(p, TYPE_NODE_PATH, true))]));
      rt.frameLine(91);
      print(rt.showArgs([rt.V.str("n84|"), rt.ops.eq(rt.variantConvert(p, TYPE_NODE_PATH, true), p)]));
      rt.frameLine(92);
      print(rt.showArgs([rt.V.str("n85|"), rt.strBuiltin([rt.variantConvert(rt.V.str("a/b"), TYPE_NODE_PATH, true)])]));
      rt.frameLine(93);
      print(rt.showArgs([rt.V.str("n86|"), rt.typeOf(rt.variantConvert(rt.V.str("a/b"), TYPE_NODE_PATH, true))]));
      rt.frameLine(94);
      print(rt.showArgs([rt.V.str("n87|"), rt.typeOf(rt.variantConvert(rt.V.int(5), TYPE_NODE_PATH, false))]));
      rt.frameLine(95);
      print(rt.showArgs([rt.V.str("n88|"), rt.strBuiltin([rt.variantConvert(rt.V.int(5), TYPE_NODE_PATH, false)])]));
      rt.frameLine(96);
      print(rt.showArgs([rt.V.str("n89|"), rt.typeOf(rt.variantConvert(p, TYPE_STRING_NAME, true))]));
      rt.frameLine(97);
      print(rt.showArgs([rt.V.str("n90|"), rt.strBuiltin([rt.variantConvert(p, TYPE_STRING_NAME, true)])]));
      rt.frameLine(98);
      print(rt.showArgs([rt.V.str("n91|"), rt.stringCtor([p])]));
      rt.frameLine(99);
      print(rt.showArgs([rt.V.str("n92|"), rt.typeOf(rt.stringCtor([p]))]));
      rt.frameLine(100);
      print(rt.showArgs([rt.V.str("n93|"), rt.ops.eq(rt.stringCtor([rt.nodePathCtor([rt.V.str("a:b")])]), rt.V.str("a:b"))]));
      rt.frameLine(101);
      print(rt.showArgs([rt.V.str("n94|"), rt.strBuiltin([rt.asType(p, "NodePath")])]));
      rt.frameLine(102);
      print(rt.showArgs([rt.V.str("n95|"), rt.typeOf(rt.asType(p, "NodePath"))]));
      rt.frameLine(103);
      print(rt.showArgs([rt.V.str("n96|"), rt.formatOf(rt.V.str("%6s|"), p, false)]));
      rt.frameLine(104);
      print(rt.showArgs([rt.V.str("n97|"), rt.ops.add(rt.ops.add(rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str("a")]), "get_name", [rt.V.int(0)])]), rt.V.str("|")), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str(":a")]), "get_subname", [rt.V.int(0)])]))]));
      rt.frameLine(105);
      print(rt.showArgs([rt.V.str("n98|"), rt.method(rt.nodePathCtor([rt.V.str(":a")]), "get_name_count", [])]));
      rt.frameLine(106);
      print(rt.showArgs([rt.V.str("n99|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str(":a")])])]));
      rt.frameLine(107);
      print(rt.showArgs([rt.V.str("n100|"), rt.ops.eq(rt.method(rt.nodePathCtor([rt.V.str("a/b")]), "get_as_property_path", []), rt.nodePathCtor([rt.V.str(":a/b")]))]));
      rt.frameLine(108);
      print(rt.showArgs([rt.V.str("n101|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))])]))]));
      rt.frameLine(109);
      print(rt.showArgs([rt.V.str("n102|"), rt.V.str(rt.varToStr(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))])))]));
      rt.frameLine(110);
      print(rt.showArgs([rt.V.str("n103|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_subname", [rt.V.int(0)])]));
      rt.frameLine(111);
      print(rt.showArgs([rt.V.str("n104|"), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_name", [rt.V.int(0)])])]));
      rt.frameLine(112);
      print(rt.showArgs([rt.V.str("n105|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_as_property_path", [])]));
      rt.frameLine(113);
      print(rt.showArgs([rt.V.str("n106|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))])]))]));
      rt.frameLine(114);
      print(rt.showArgs([rt.V.str("n107|"), rt.nodePathCtor([rt.V.str(("x" + "\\"))])]));
      rt.frameLine(115);
      print(rt.showArgs([rt.V.str("n108|"), rt.nodePathCtor([rt.V.str(((("x" + "\\") + "/y") + "\\"))])]));
      rt.frameLine(116);
      print(rt.showArgs([rt.V.str("n109|"), rt.method(rt.nodePathCtor([rt.V.str(((("x" + "\\") + "/y") + "\\"))]), "get_name_count", [])]));
      rt.frameLine(117);
      print(rt.showArgs([rt.V.str("n110|"), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + ":b") + ":c"))]), "get_subname", [rt.V.int(1)])])]));
      rt.frameLine(118);
      print(rt.showArgs([rt.V.str("n111|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + ":b") + ":c"))]), "get_name_count", [])]));
      rt.frameLine(119);
      print(rt.showArgs([rt.V.str("n112|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + ":b") + ":c"))]), "get_subname_count", [])]));
      rt.frameLine(120);
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
