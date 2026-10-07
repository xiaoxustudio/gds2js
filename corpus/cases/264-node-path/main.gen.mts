// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_NODE_PATH = rt.V.int(22);
const TYPE_STRING = rt.V.int(4);
const TYPE_STRING_NAME = rt.V.int(21);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.nodePathCtor([rt.V.str("a/b")]);
    print(rt.showArgs([rt.V.str("n01|"), rt.typeOf(p)]));
    print(rt.showArgs([rt.V.str("n02|"), p]));
    print(rt.showArgs([rt.V.str("n03|"), rt.strBuiltin([p])]));
    print(rt.showArgs([rt.V.str("n04|"), rt.V.str(rt.varToStr(p))]));
    print(rt.showArgs([rt.V.str("n05|"), rt.formatOf(rt.V.str("%s"), p)]));
    print(rt.showArgs([rt.V.str("n06|"), rt.nodePathCtor([rt.V.str("")])]));
    print(rt.showArgs([rt.V.str("n07|"), rt.V.str(rt.varToStr(rt.nodePathCtor([rt.V.str("")])))]));
    print(rt.showArgs([rt.V.str("n08|"), rt.nodePathCtor([rt.V.str("/a/b")])]));
    print(rt.showArgs([rt.V.str("n09|"), rt.nodePathCtor([rt.V.str("a/b:1")])]));
    print(rt.showArgs([rt.V.str("n10|"), rt.nodePathCtor([rt.V.str("a:b:c")])]));
    print(rt.showArgs([rt.V.str("n11|"), rt.nodePathCtor([rt.V.str("x:")])]));
    print(rt.showArgs([rt.V.str("n12|"), rt.nodePathCtor([rt.V.str("a//b")])]));
    print(rt.showArgs([rt.V.str("n13|"), rt.nodePathCtor([rt.V.str("a/")])]));
    print(rt.showArgs([rt.V.str("n14|"), rt.nodePathCtor([rt.V.str("//a")])]));
    print(rt.showArgs([rt.V.str("n15|"), rt.nodePathCtor([rt.V.str("/")])]));
    print(rt.showArgs([rt.V.str("n16|"), rt.nodePathCtor([rt.V.str(".")])]));
    print(rt.showArgs([rt.V.str("n17|"), rt.nodePathCtor([rt.V.str("b/.")])]));
    print(rt.showArgs([rt.V.str("n18|"), rt.nodePathCtor([rt.V.str("  a  ")])]));
    print(rt.showArgs([rt.V.str("n19|"), rt.nodePathCtor([rt.V.str("A/b/../c")])]));
    print(rt.showArgs([rt.V.str("n20|"), rt.method(p, "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n21|"), rt.method(p, "get_subname_count", [])]));
    print(rt.showArgs([rt.V.str("n22|"), rt.method(p, "get_name", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("n23|"), rt.method(p, "get_name", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("n24|"), rt.typeOf(rt.method(p, "get_name", [rt.V.int(0)]))]));
    print(rt.showArgs([rt.V.str("n25|"), rt.method(rt.nodePathCtor([rt.V.str("a:b")]), "get_subname", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("n26|"), rt.method(rt.nodePathCtor([rt.V.str("a:b:c")]), "get_subname", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("n27|"), rt.method(rt.nodePathCtor([rt.V.str("a:b:c")]), "get_subname_count", [])]));
    print(rt.showArgs([rt.V.str("n28|"), rt.method(p, "is_absolute", [])]));
    print(rt.showArgs([rt.V.str("n29|"), rt.method(rt.nodePathCtor([rt.V.str("/a")]), "is_absolute", [])]));
    print(rt.showArgs([rt.V.str("n30|"), rt.method(rt.nodePathCtor([rt.V.str("")]), "is_empty", [])]));
    print(rt.showArgs([rt.V.str("n31|"), rt.method(rt.nodePathCtor([rt.V.str("/")]), "is_empty", [])]));
    print(rt.showArgs([rt.V.str("n32|"), rt.method(rt.nodePathCtor([rt.V.str("a/")]), "is_empty", [])]));
    print(rt.showArgs([rt.V.str("n33|"), rt.method(p, "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n34|"), rt.typeOf(rt.method(p, "get_as_property_path", []))]));
    print(rt.showArgs([rt.V.str("n35|"), rt.method(rt.method(p, "get_as_property_path", []), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n36|"), rt.method(rt.method(p, "get_as_property_path", []), "get_subname_count", [])]));
    print(rt.showArgs([rt.V.str("n37|"), rt.strBuiltin([rt.method(rt.method(p, "get_as_property_path", []), "get_subname", [rt.V.int(0)])])]));
    print(rt.showArgs([rt.V.str("n38|"), rt.typeOf(rt.method(rt.method(p, "get_as_property_path", []), "get_subname", [rt.V.int(0)]))]));
    print(rt.showArgs([rt.V.str("n39|"), rt.method(rt.nodePathCtor([rt.V.str("")]), "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n40|"), rt.method(rt.nodePathCtor([rt.V.str("/")]), "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n41|"), rt.method(rt.nodePathCtor([rt.V.str("x:")]), "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n42|"), rt.method(rt.nodePathCtor([rt.V.str("a/b:1")]), "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n43|"), rt.method(rt.nodePathCtor([rt.V.str("a:b:c")]), "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n44|"), rt.ops.eq(p, rt.nodePathCtor([rt.V.str("a/b")]))]));
    print(rt.showArgs([rt.V.str("n45|"), rt.ops.eq(p, rt.nodePathCtor([rt.V.str("a/c")]))]));
    print(rt.showArgs([rt.V.str("n46|"), rt.ops.neq(p, rt.nodePathCtor([rt.V.str("a/c")]))]));
    print(rt.showArgs([rt.V.str("n47|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("/a/b")]), rt.nodePathCtor([rt.V.str("a/b")]))]));
    print(rt.showArgs([rt.V.str("n48|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str("a/b:")]))]));
    print(rt.showArgs([rt.V.str("n49|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("")]), rt.nodePathCtor([rt.V.str(".")]))]));
    print(rt.showArgs([rt.V.str("n50|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("A")]), rt.nodePathCtor([rt.V.str("a")]))]));
    print(rt.showArgs([rt.V.str("n51|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("A")]), rt.nodePathCtor([rt.method(rt.V.str("A"), "to_lower", [])]))]));
    print(rt.showArgs([rt.V.str("n52|"), rt.ops.eq(p, rt.V.nil())]));
    print(rt.showArgs([rt.V.str("n53|"), rt.ops.eq(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), rt.nodePathCtor([rt.V.str("a:b")]))]));
    print(rt.showArgs([rt.V.str("n54|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))])])]));
    print(rt.showArgs([rt.V.str("n55|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n56|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_subname_count", [])]));
    print(rt.showArgs([rt.V.str("n57|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n58|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))]), "get_subname_count", [])]));
    print(rt.showArgs([rt.V.str("n59|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))])])]));
    print(rt.showArgs([rt.V.str("n60|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + "/b"))]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n61|"), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + "/b"))]), "get_name", [rt.V.int(0)])])]));
    print(rt.showArgs([rt.V.str("n62|"), rt.nodePathCtor([rt.V.str((("a" + "\\") + "/b"))])]));
    print(rt.showArgs([rt.V.str("n63|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str("")])]))]));
    print(rt.showArgs([rt.V.str("n64|"), rt.method(rt.V.array(rt.GArray.of([p, rt.nodePathCtor([rt.V.str("/a")])])), "size", [])]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.nodePathCtor([rt.V.str("a/b")]), rt.V.int(1));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.nodePathCtor([rt.V.str("/a")]), rt.V.int(2));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("n65|"), d]));
    print(rt.showArgs([rt.V.str("n66|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
    print(rt.showArgs([rt.V.str("n67|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/c")])])]));
    print(rt.showArgs([rt.V.str("n68|"), rt.wrapValue(rt.index(d, rt.nodePathCtor([rt.V.str("/a")])))]));
    print(rt.showArgs([rt.V.str("n69|"), rt.method(d, "keys", [])]));
    print(rt.showArgs([rt.V.str("n70|"), rt.V.str(rt.varToStr(d))]));
    print(rt.showArgs([rt.V.str("n71|"), rt.strBuiltin([rt.nodePathCtor([])])]));
    print(rt.showArgs([rt.V.str("n72|"), rt.method(rt.nodePathCtor([]), "is_empty", [])]));
    print(rt.showArgs([rt.V.str("n73|"), rt.V.str(rt.varToStr(rt.nodePathCtor([])))]));
    print(rt.showArgs([rt.V.str("n74|"), rt.strBuiltin([rt.nodePathCtor([rt.stringCtor([rt.V.str("q")])])])]));
    print(rt.showArgs([rt.V.str("n75|"), rt.strBuiltin([rt.nodePathCtor([rt.V.stringName("a/b")])])]));
    print(rt.showArgs([rt.V.str("n76|"), rt.strBuiltin([rt.nodePathCtor([rt.nodePathCtor([rt.V.str("a:b")])])])]));
    print(rt.showArgs([rt.V.str("n77|"), rt.method(rt.nodePathCtor([rt.nodePathCtor([rt.V.str("a:b")])]), "get_subname_count", [])]));
    print(rt.showArgs([rt.V.str("n78|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str(("a" + "/b"))])])]));
    print(rt.showArgs([rt.V.str("n79|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str(("a" + "/b"))]))]));
    print(rt.showArgs([rt.V.str("n80|"), rt.isType(p, "NodePath")]));
    print(rt.showArgs([rt.V.str("n81|"), rt.strBuiltin([rt.variantConvert(p, TYPE_STRING, true)])]));
    print(rt.showArgs([rt.V.str("n82|"), rt.typeOf(rt.variantConvert(p, TYPE_STRING, true))]));
    print(rt.showArgs([rt.V.str("n83|"), rt.typeOf(rt.variantConvert(p, TYPE_NODE_PATH, true))]));
    print(rt.showArgs([rt.V.str("n84|"), rt.ops.eq(rt.variantConvert(p, TYPE_NODE_PATH, true), p)]));
    print(rt.showArgs([rt.V.str("n85|"), rt.strBuiltin([rt.variantConvert(rt.V.str("a/b"), TYPE_NODE_PATH, true)])]));
    print(rt.showArgs([rt.V.str("n86|"), rt.typeOf(rt.variantConvert(rt.V.str("a/b"), TYPE_NODE_PATH, true))]));
    print(rt.showArgs([rt.V.str("n87|"), rt.typeOf(rt.variantConvert(rt.V.int(5), TYPE_NODE_PATH, false))]));
    print(rt.showArgs([rt.V.str("n88|"), rt.strBuiltin([rt.variantConvert(rt.V.int(5), TYPE_NODE_PATH, false)])]));
    print(rt.showArgs([rt.V.str("n89|"), rt.typeOf(rt.variantConvert(p, TYPE_STRING_NAME, true))]));
    print(rt.showArgs([rt.V.str("n90|"), rt.strBuiltin([rt.variantConvert(p, TYPE_STRING_NAME, true)])]));
    print(rt.showArgs([rt.V.str("n91|"), rt.stringCtor([p])]));
    print(rt.showArgs([rt.V.str("n92|"), rt.typeOf(rt.stringCtor([p]))]));
    print(rt.showArgs([rt.V.str("n93|"), rt.ops.eq(rt.stringCtor([rt.nodePathCtor([rt.V.str("a:b")])]), rt.V.str("a:b"))]));
    print(rt.showArgs([rt.V.str("n94|"), rt.strBuiltin([rt.asType(p, "NodePath")])]));
    print(rt.showArgs([rt.V.str("n95|"), rt.typeOf(rt.asType(p, "NodePath"))]));
    print(rt.showArgs([rt.V.str("n96|"), rt.formatOf(rt.V.str("%6s|"), p)]));
    print(rt.showArgs([rt.V.str("n97|"), rt.ops.add(rt.ops.add(rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str("a")]), "get_name", [rt.V.int(0)])]), rt.V.str("|")), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str(":a")]), "get_subname", [rt.V.int(0)])]))]));
    print(rt.showArgs([rt.V.str("n98|"), rt.method(rt.nodePathCtor([rt.V.str(":a")]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n99|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str(":a")])])]));
    print(rt.showArgs([rt.V.str("n100|"), rt.ops.eq(rt.method(rt.nodePathCtor([rt.V.str("a/b")]), "get_as_property_path", []), rt.nodePathCtor([rt.V.str(":a/b")]))]));
    print(rt.showArgs([rt.V.str("n101|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))])]))]));
    print(rt.showArgs([rt.V.str("n102|"), rt.V.str(rt.varToStr(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))])))]));
    print(rt.showArgs([rt.V.str("n103|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_subname", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("n104|"), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_name", [rt.V.int(0)])])]));
    print(rt.showArgs([rt.V.str("n105|"), rt.method(rt.nodePathCtor([rt.V.str((("a" + "\\") + ":b"))]), "get_as_property_path", [])]));
    print(rt.showArgs([rt.V.str("n106|"), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str(((("a" + "\\") + "\\") + ":b"))])]))]));
    print(rt.showArgs([rt.V.str("n107|"), rt.nodePathCtor([rt.V.str(("x" + "\\"))])]));
    print(rt.showArgs([rt.V.str("n108|"), rt.nodePathCtor([rt.V.str(((("x" + "\\") + "/y") + "\\"))])]));
    print(rt.showArgs([rt.V.str("n109|"), rt.method(rt.nodePathCtor([rt.V.str(((("x" + "\\") + "/y") + "\\"))]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n110|"), rt.strBuiltin([rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + ":b") + ":c"))]), "get_subname", [rt.V.int(1)])])]));
    print(rt.showArgs([rt.V.str("n111|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + ":b") + ":c"))]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("n112|"), rt.method(rt.nodePathCtor([rt.V.str(((("a" + "\\") + ":b") + ":c"))]), "get_subname_count", [])]));
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
