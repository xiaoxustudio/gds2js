// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let vall012 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)]))]));
    rt.method(vall012, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let oall012 = rt.V.str("");
    for (let q of rt.iter(vall012)) {
      oall012 = rt.ops.add(oall012, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("all012 ")), rt.show(oall012));
    let vall016 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
    rt.method(vall016, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let oall016 = rt.V.str("");
    for (let q of rt.iter(vall016)) {
      oall016 = rt.ops.add(oall016, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("all016 ")), rt.show(oall016));
    let valt212 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
    rt.method(valt212, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let oalt212 = rt.V.str("");
    for (let q of rt.iter(valt212)) {
      oalt212 = rt.ops.add(oalt212, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("alt212 ")), rt.show(oalt212));
    let valt216 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(15)]))]));
    rt.method(valt216, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let oalt216 = rt.V.str("");
    for (let q of rt.iter(valt216)) {
      oalt216 = rt.ops.add(oalt216, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("alt216 ")), rt.show(oalt216));
    let vcyc312 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(11)]))]));
    rt.method(vcyc312, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let ocyc312 = rt.V.str("");
    for (let q of rt.iter(vcyc312)) {
      ocyc312 = rt.ops.add(ocyc312, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("cyc312 ")), rt.show(ocyc312));
    let vcyc316 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
    rt.method(vcyc316, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let ocyc316 = rt.V.str("");
    for (let q of rt.iter(vcyc316)) {
      ocyc316 = rt.ops.add(ocyc316, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("cyc316 ")), rt.show(ocyc316));
    let vlead212 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)]))]));
    rt.method(vlead212, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let olead212 = rt.V.str("");
    for (let q of rt.iter(vlead212)) {
      olead212 = rt.ops.add(olead212, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("lead212 ")), rt.show(olead212));
    let vlead216 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
    rt.method(vlead216, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let olead216 = rt.V.str("");
    for (let q of rt.iter(vlead216)) {
      olead216 = rt.ops.add(olead216, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("lead216 ")), rt.show(olead216));
    let vmul5r312 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
    rt.method(vmul5r312, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let omul5r312 = rt.V.str("");
    for (let q of rt.iter(vmul5r312)) {
      omul5r312 = rt.ops.add(omul5r312, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("mul5r312 ")), rt.show(omul5r312));
    let vmul5r316 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
    rt.method(vmul5r316, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let omul5r316 = rt.V.str("");
    for (let q of rt.iter(vmul5r316)) {
      omul5r316 = rt.ops.add(omul5r316, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("mul5r316 ")), rt.show(omul5r316));
    let vdesc12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(12), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
    rt.method(vdesc12, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let odesc12 = rt.V.str("");
    for (let q of rt.iter(vdesc12)) {
      odesc12 = rt.ops.add(odesc12, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("desc12 ")), rt.show(odesc12));
    let vdesc16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(16), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(15), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(14), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(13), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(12), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(15)]))]));
    rt.method(vdesc16, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let odesc16 = rt.V.str("");
    for (let q of rt.iter(vdesc16)) {
      odesc16 = rt.ops.add(odesc16, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("desc16 ")), rt.show(odesc16));
    let vtwoHalf12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)]))]));
    rt.method(vtwoHalf12, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let otwoHalf12 = rt.V.str("");
    for (let q of rt.iter(vtwoHalf12)) {
      otwoHalf12 = rt.ops.add(otwoHalf12, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("twoHalf12 ")), rt.show(otwoHalf12));
    let vtwoHalf16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
    rt.method(vtwoHalf16, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let otwoHalf16 = rt.V.str("");
    for (let q of rt.iter(vtwoHalf16)) {
      otwoHalf16 = rt.ops.add(otwoHalf16, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("twoHalf16 ")), rt.show(otwoHalf16));
    let vhalfDup12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(11)]))]));
    rt.method(vhalfDup12, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let ohalfDup12 = rt.V.str("");
    for (let q of rt.iter(vhalfDup12)) {
      ohalfDup12 = rt.ops.add(ohalfDup12, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("halfDup12 ")), rt.show(ohalfDup12));
    let vhalfDup16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(15)]))]));
    rt.method(vhalfDup16, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let ohalfDup16 = rt.V.str("");
    for (let q of rt.iter(vhalfDup16)) {
      ohalfDup16 = rt.ops.add(ohalfDup16, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("halfDup16 ")), rt.show(ohalfDup16));
    let vzigzag12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
    rt.method(vzigzag12, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let ozigzag12 = rt.V.str("");
    for (let q of rt.iter(vzigzag12)) {
      ozigzag12 = rt.ops.add(ozigzag12, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("zigzag12 ")), rt.show(ozigzag12));
    let vzigzag16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(15)]))]));
    rt.method(vzigzag16, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let ozigzag16 = rt.V.str("");
    for (let q of rt.iter(vzigzag16)) {
      ozigzag16 = rt.ops.add(ozigzag16, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("zigzag16 ")), rt.show(ozigzag16));
    let vdistinct12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(11)]))]));
    rt.method(vdistinct12, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let odistinct12 = rt.V.str("");
    for (let q of rt.iter(vdistinct12)) {
      odistinct12 = rt.ops.add(odistinct12, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("distinct12 ")), rt.show(odistinct12));
    let vdistinct16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(12), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(13), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(14), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(15), rt.V.int(15)]))]));
    rt.method(vdistinct16, "sort_custom", [rt.callable((x, y) => {
      return rt.ops.lt(rt.index(x, rt.V.int(0)), rt.index(y, rt.V.int(0)));
    })]);
    let odistinct16 = rt.V.str("");
    for (let q of rt.iter(vdistinct16)) {
      odistinct16 = rt.ops.add(odistinct16, rt.ops.add(rt.strOf(rt.index(q, rt.V.int(1))), rt.V.str(",")));
    }
    print(rt.show(rt.V.str("distinct16 ")), rt.show(odistinct16));
    this.quit();
  }
  
}

await new Main().run();
