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
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("t1|"), rt.method(rt.nativeClass("Time"), "get_datetime_dict_from_unix_time", [rt.V.int(0)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("t2|"), rt.method(rt.nativeClass("Time"), "get_datetime_dict_from_unix_time", [rt.V.int(1700000000)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("t3|"), rt.method(rt.nativeClass("Time"), "get_date_dict_from_unix_time", [rt.V.int(1700000000)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("t4|"), rt.method(rt.nativeClass("Time"), "get_time_dict_from_unix_time", [rt.V.int(1700000000)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("t5|"), rt.method(rt.nativeClass("Time"), "get_datetime_string_from_unix_time", [rt.V.int(1700000000), rt.V.bool(false)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("t6|"), rt.method(rt.nativeClass("Time"), "get_datetime_string_from_unix_time", [rt.V.int(1700000000), rt.V.bool(true)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("t7|"), rt.method(rt.nativeClass("Time"), "get_date_string_from_unix_time", [rt.V.int(1700000000)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("t8|"), rt.method(rt.nativeClass("Time"), "get_time_string_from_unix_time", [rt.V.int(1700000000)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t9|"), rt.method(rt.nativeClass("Time"), "get_datetime_dict_from_datetime_string", [rt.V.str("2024-02-29T12:34:56"), rt.V.bool(true)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("t10|"), rt.method(rt.nativeClass("Time"), "get_datetime_dict_from_datetime_string", [rt.V.str("2024-02-29 12:34:56"), rt.V.bool(false)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("t11|"), rt.method(rt.nativeClass("Time"), "get_datetime_string_from_datetime_dict", [rt.dictOf([[rt.V.str("year"), rt.V.int(2024)], [rt.V.str("month"), rt.V.int(2)], [rt.V.str("day"), rt.V.int(29)], [rt.V.str("hour"), rt.V.int(12)], [rt.V.str("minute"), rt.V.int(34)], [rt.V.str("second"), rt.V.int(56)]]), rt.V.bool(false)])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t12|"), rt.method(rt.nativeClass("Time"), "get_unix_time_from_datetime_dict", [rt.dictOf([[rt.V.str("year"), rt.V.int(2024)], [rt.V.str("month"), rt.V.int(2)], [rt.V.str("day"), rt.V.int(29)], [rt.V.str("hour"), rt.V.int(12)], [rt.V.str("minute"), rt.V.int(34)], [rt.V.str("second"), rt.V.int(56)]])])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("t13|"), rt.method(rt.nativeClass("Time"), "get_unix_time_from_datetime_string", [rt.V.str("2024-02-29T12:34:56")])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("t14|"), rt.method(rt.nativeClass("Time"), "get_unix_time_from_datetime_string", [rt.V.str("2024-02-29 12:34:56")])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("t15|"), rt.method(rt.nativeClass("Time"), "get_offset_string_from_offset_minutes", [rt.V.int(330)]), rt.V.str("|"), rt.method(rt.nativeClass("Time"), "get_offset_string_from_offset_minutes", [rt.V.int((-300))]), rt.V.str("|"), rt.method(rt.nativeClass("Time"), "get_offset_string_from_offset_minutes", [rt.V.int(0)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("t16|"), rt.wrapValue(rt.attribute(rt.nativeClass("Time"), "MONTH_JANUARY")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Time"), "WEEKDAY_SUNDAY")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.nativeClass("Time"), "WEEKDAY_SATURDAY"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t17|"), rt.method(rt.nativeClass("Time"), "get_datetime_dict_from_unix_time", [rt.V.int((-1))])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t18|"), rt.method(rt.nativeClass("Time"), "get_datetime_string_from_unix_time", [rt.V.int((-86400))])]));
      rt.frameLine(22);
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
