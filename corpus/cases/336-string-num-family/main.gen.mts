// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("C|String.num(3.14159)||"), rt.stringStatic("num", [rt.V.float(3.14159)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255)||"), rt.stringStatic("num_int64", [rt.V.int(255)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64((1 << 62) + (1 << 62), 16, true)||"), rt.stringStatic("num_uint64", [rt.ops.add(rt.ops.shl(rt.V.int(1), rt.V.int(62)), rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 2)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 2, true)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 8)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 8, true)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 10)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 10, true)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 16)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 16, true)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 36)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 36, true)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 2)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 2, true)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 8)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 8, true)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 10)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 10, true)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 16)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 16, true)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 36)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(0, 36, true)||"), rt.stringStatic("num_int64", [rt.V.int(0), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 2)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 2, true)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 8)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 8, true)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 10)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 10, true)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 16)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 16, true)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 36)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-255, 36, true)||"), rt.stringStatic("num_int64", [rt.V.int((-255)), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 2)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 2, true)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 8)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 8, true)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 10)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 10, true)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 16)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 16, true)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 36)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1, 36, true)||"), rt.stringStatic("num_int64", [rt.V.int(1), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 2)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 2, true)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 8)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 8, true)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 10)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 10, true)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 16)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 16, true)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 36)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(1 << 63, 36, true)||"), rt.stringStatic("num_int64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 2)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 2, true)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 8)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 8, true)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 10)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 10, true)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 16)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 16, true)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 36)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(-(1 << 62), 36, true)||"), rt.stringStatic("num_int64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(62))), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 2)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 2, true)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 8)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(8)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 8, true)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(8), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 10)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 10, true)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 16)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 16, true)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 36)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(9007199254740993, 36, true)||"), rt.stringStatic("num_int64", [rt.V.int(9007199254740993n), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 2)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 2, true)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 10)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 10, true)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 16)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 16, true)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 36)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-1, 36, true)||"), rt.stringStatic("num_uint64", [rt.V.int((-1)), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 2)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 2, true)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 10)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 10, true)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 16)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 16, true)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 36)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(0, 36, true)||"), rt.stringStatic("num_uint64", [rt.V.int(0), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 2)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 2, true)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 10)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 10, true)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 16)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 16, true)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 36)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 36, true)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 2)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 2, true)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 10)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 10, true)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 16)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 16, true)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 36)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(1 << 63, 36, true)||"), rt.stringStatic("num_uint64", [rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 2)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 2, true)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(2), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 10)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 10, true)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(10), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 16)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(16)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 16, true)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(16), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 36)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(-(1 << 63), 36, true)||"), rt.stringStatic("num_uint64", [rt.ops.neg(rt.ops.shl(rt.V.int(1), rt.V.int(63))), rt.V.int(36), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 36)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_int64(255, 2)||"), rt.stringStatic("num_int64", [rt.V.int(255), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 36)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(36)])]));
    print(rt.showArgs([rt.V.str("C|String.num_uint64(255, 2)||"), rt.stringStatic("num_uint64", [rt.V.int(255), rt.V.int(2)])]));
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
