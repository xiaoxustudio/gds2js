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
      print(rt.showArgs([rt.V.str("START")]));
      rt.frameLine(5);
      printRich([rt.V.str("[b]B[/b]")]);
      rt.frameLine(6);
      printRich([rt.V.str("[i]I[/i]")]);
      rt.frameLine(7);
      printRich([rt.V.str("[u]U[/u]")]);
      rt.frameLine(8);
      printRich([rt.V.str("[s]S[/s]")]);
      rt.frameLine(9);
      printRich([rt.V.str("[indent]IN[/indent]")]);
      rt.frameLine(10);
      printRich([rt.V.str("[code]C[/code]")]);
      rt.frameLine(11);
      printRich([rt.V.str("[url]L[/url]")]);
      rt.frameLine(12);
      printRich([rt.V.str("[center]M[/center]")]);
      rt.frameLine(13);
      printRich([rt.V.str("[right]R[/right]")]);
      rt.frameLine(14);
      printRich([rt.V.str("[/indent]")]);
      rt.frameLine(15);
      printRich([rt.V.str("[/center]")]);
      rt.frameLine(16);
      printRich([rt.V.str("[/right]")]);
      rt.frameLine(17);
      printRich([rt.V.str("[/url]")]);
      rt.frameLine(18);
      printRich([rt.V.str("[b][i]both[/i][/b]")]);
      rt.frameLine(19);
      printRich([rt.V.str("[b]a[i]b[/i]c[/b]")]);
      rt.frameLine(20);
      printRich([rt.V.str("[i][b]ab[/b][/i]")]);
      rt.frameLine(21);
      printRich([rt.V.str("[color=black]t[/color]")]);
      rt.frameLine(22);
      printRich([rt.V.str("[color=red]t[/color]")]);
      rt.frameLine(23);
      printRich([rt.V.str("[color=green]t[/color]")]);
      rt.frameLine(24);
      printRich([rt.V.str("[color=lime]t[/color]")]);
      rt.frameLine(25);
      printRich([rt.V.str("[color=yellow]t[/color]")]);
      rt.frameLine(26);
      printRich([rt.V.str("[color=blue]t[/color]")]);
      rt.frameLine(27);
      printRich([rt.V.str("[color=magenta]t[/color]")]);
      rt.frameLine(28);
      printRich([rt.V.str("[color=pink]t[/color]")]);
      rt.frameLine(29);
      printRich([rt.V.str("[color=purple]t[/color]")]);
      rt.frameLine(30);
      printRich([rt.V.str("[color=cyan]t[/color]")]);
      rt.frameLine(31);
      printRich([rt.V.str("[color=white]t[/color]")]);
      rt.frameLine(32);
      printRich([rt.V.str("[color=orange]t[/color]")]);
      rt.frameLine(33);
      printRich([rt.V.str("[color=gray]t[/color]")]);
      rt.frameLine(34);
      printRich([rt.V.str("[bgcolor=black]t[/bgcolor]")]);
      rt.frameLine(35);
      printRich([rt.V.str("[bgcolor=red]t[/bgcolor]")]);
      rt.frameLine(36);
      printRich([rt.V.str("[bgcolor=green]t[/bgcolor]")]);
      rt.frameLine(37);
      printRich([rt.V.str("[bgcolor=lime]t[/bgcolor]")]);
      rt.frameLine(38);
      printRich([rt.V.str("[bgcolor=yellow]t[/bgcolor]")]);
      rt.frameLine(39);
      printRich([rt.V.str("[bgcolor=blue]t[/bgcolor]")]);
      rt.frameLine(40);
      printRich([rt.V.str("[bgcolor=magenta]t[/bgcolor]")]);
      rt.frameLine(41);
      printRich([rt.V.str("[bgcolor=pink]t[/bgcolor]")]);
      rt.frameLine(42);
      printRich([rt.V.str("[bgcolor=purple]t[/bgcolor]")]);
      rt.frameLine(43);
      printRich([rt.V.str("[bgcolor=cyan]t[/bgcolor]")]);
      rt.frameLine(44);
      printRich([rt.V.str("[bgcolor=white]t[/bgcolor]")]);
      rt.frameLine(45);
      printRich([rt.V.str("[bgcolor=orange]t[/bgcolor]")]);
      rt.frameLine(46);
      printRich([rt.V.str("[bgcolor=gray]t[/bgcolor]")]);
      rt.frameLine(47);
      printRich([rt.V.str("[fgcolor=black]t[/fgcolor]")]);
      rt.frameLine(48);
      printRich([rt.V.str("[fgcolor=red]t[/fgcolor]")]);
      rt.frameLine(49);
      printRich([rt.V.str("[fgcolor=green]t[/fgcolor]")]);
      rt.frameLine(50);
      printRich([rt.V.str("[fgcolor=lime]t[/fgcolor]")]);
      rt.frameLine(51);
      printRich([rt.V.str("[fgcolor=yellow]t[/fgcolor]")]);
      rt.frameLine(52);
      printRich([rt.V.str("[fgcolor=blue]t[/fgcolor]")]);
      rt.frameLine(53);
      printRich([rt.V.str("[fgcolor=magenta]t[/fgcolor]")]);
      rt.frameLine(54);
      printRich([rt.V.str("[fgcolor=pink]t[/fgcolor]")]);
      rt.frameLine(55);
      printRich([rt.V.str("[fgcolor=purple]t[/fgcolor]")]);
      rt.frameLine(56);
      printRich([rt.V.str("[fgcolor=cyan]t[/fgcolor]")]);
      rt.frameLine(57);
      printRich([rt.V.str("[fgcolor=white]t[/fgcolor]")]);
      rt.frameLine(58);
      printRich([rt.V.str("[fgcolor=orange]t[/fgcolor]")]);
      rt.frameLine(59);
      printRich([rt.V.str("[fgcolor=gray]t[/fgcolor]")]);
      rt.frameLine(60);
      printRich([rt.V.str("[/color]")]);
      rt.frameLine(61);
      printRich([rt.V.str("[/bgcolor]")]);
      rt.frameLine(62);
      printRich([rt.V.str("[/fgcolor]")]);
      rt.frameLine(63);
      printRich([rt.V.str("[color=#ff0000]hex[/color]")]);
      rt.frameLine(64);
      printRich([rt.V.str("[color=bogus]x[/color]")]);
      rt.frameLine(65);
      printRich([rt.V.str("[color=red]")]);
      rt.frameLine(66);
      printRich([rt.V.str("plain[bgcolor=gray]")]);
      rt.frameLine(67);
      printRich([rt.V.str("[color=red][bgcolor=blue][fgcolor=pink]all[/fgcolor][/bgcolor][/color]")]);
      rt.frameLine(68);
      printRich([rt.V.str("[noise]x[/noise]")]);
      rt.frameLine(69);
      printRich([rt.V.str("[font_size=20]x[/font_size]")]);
      rt.frameLine(70);
      printRich([rt.V.str("[url=https://godot.dev]link[/url]")]);
      rt.frameLine(71);
      printRich([rt.V.str("[b]")]);
      rt.frameLine(72);
      printRich([rt.V.str("[/b]")]);
      rt.frameLine(73);
      printRich([rt.V.str("[B]upper[/B]")]);
      rt.frameLine(74);
      printRich([rt.V.str("[")]);
      rt.frameLine(75);
      printRich([rt.V.str("]")]);
      rt.frameLine(76);
      printRich([rt.V.str("[]")]);
      rt.frameLine(77);
      printRich([rt.V.str("")]);
      rt.frameLine(78);
      printRich([rt.V.str("no tag at all")]);
      rt.frameLine(79);
      printRich([rt.V.str("[b]bold[/b][color=red]red[/color][center]mid[/center]")]);
      rt.frameLine(80);
      printRich([rt.V.str("[color=#ff0000]x[/color]")]);
      rt.frameLine(81);
      printRich([rt.V.str("[color=ff0000]x[/color]")]);
      rt.frameLine(82);
      printRich([rt.V.str("[color=#f00]x[/color]")]);
      rt.frameLine(83);
      printRich([rt.V.str("[color=#010203]x[/color]")]);
      rt.frameLine(84);
      printRich([rt.V.str("[color=#808080]x[/color]")]);
      rt.frameLine(85);
      printRich([rt.V.str("[color=#7f7f7f]x[/color]")]);
      rt.frameLine(86);
      printRich([rt.V.str("[color=#aaaaaa]x[/color]")]);
      rt.frameLine(87);
      printRich([rt.V.str("[color=#555555]x[/color]")]);
      rt.frameLine(88);
      printRich([rt.V.str("[color=#050a14]x[/color]")]);
      rt.frameLine(89);
      printRich([rt.V.str("[color=#abcdef]x[/color]")]);
      rt.frameLine(90);
      printRich([rt.V.str("[color=#fefffd]x[/color]")]);
      rt.frameLine(91);
      printRich([rt.V.str("[color=#ff000080]x[/color]")]);
      rt.frameLine(92);
      printRich([rt.V.str("[color=#gg0000]x[/color]")]);
      rt.frameLine(93);
      printRich([rt.V.str("[color=]x[/color]")]);
      rt.frameLine(94);
      printRich([rt.V.str("[color= red]x[/color]")]);
      rt.frameLine(95);
      printRich([rt.V.str("[color=RED]x[/color]")]);
      rt.frameLine(96);
      printRich([rt.V.str("[color=grey]x[/color]")]);
      rt.frameLine(97);
      printRich([rt.V.str("[color=medium_spring_green]x[/color]")]);
      rt.frameLine(98);
      printRich([rt.V.str("[bgcolor=#ff0000]x[/bgcolor]")]);
      rt.frameLine(99);
      printRich([rt.V.str("[bgcolor=bogus]x[/bgcolor]")]);
      rt.frameLine(100);
      printRich([rt.V.str("[fgcolor=#ff0000]x[/fgcolor]")]);
      rt.frameLine(101);
      printRich([rt.V.str("[fgcolor=bogus]x[/fgcolor]")]);
      rt.frameLine(102);
      printRich([rt.V.str("[/color]")]);
      rt.frameLine(103);
      printRich([rt.V.str("[/bgcolor]")]);
      rt.frameLine(104);
      printRich([rt.V.str("[/fgcolor]")]);
      rt.frameLine(105);
      printRich([rt.V.str("x[/color]")]);
      rt.frameLine(106);
      printRich([rt.V.str("[color=red][color=#ff0000]x[/color]")]);
      rt.frameLine(107);
      printRich([rt.V.str("[b][color=bogus][/b][/color]")]);
      rt.frameLine(108);
      printRich([rt.V.str("[color=#ff0000][bgcolor=#00ff00]x[/bgcolor][/color]")]);
      rt.frameLine(109);
      printRich([rt.V.str("[color=#ff0000")]);
      rt.frameLine(110);
      printRich([rt.V.str("[color=")]);
      rt.frameLine(111);
      printRich([rt.V.str("[color=a]b]x[/color]")]);
      rt.frameLine(112);
      printRich([rt.V.str("[color=#ff0000]a[color=blue]b[/color]")]);
      rt.frameLine(113);
      printRich([rt.V.str("[color=#ff0000]no close")]);
      rt.frameLine(114);
      printRich([]);
      rt.frameLine(115);
      print(rt.showArgs([rt.V.str("TWO"), rt.V.str("ARGS"), rt.V.bool(true)]));
      rt.frameLine(116);
      printRich([rt.V.nil()]);
      rt.frameLine(117);
      printRich([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(118);
      printRich([rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
      rt.frameLine(119);
      printRich([rt.V.stringName("sn")]);
      rt.frameLine(120);
      printRich([rt.V.str("a"), rt.V.int(1), rt.V.bool(true)]);
      rt.frameLine(121);
      printRaw([rt.V.str("q1")]);
      rt.frameLine(122);
      printRich([rt.V.str("[b]q2[/b]")]);
      rt.frameLine(123);
      print(rt.showArgs([rt.V.str("q3")]));
      rt.frameLine(124);
      printRich([rt.V.str("[color=#ff0000]q4[/color]")]);
      rt.frameLine(125);
      printRaw([rt.V.str("q5")]);
      rt.frameLine(126);
      printRich([rt.V.str("q6")]);
      rt.frameLine(127);
      print(rt.showArgs([rt.V.str("q7")]));
      rt.frameLine(128);
      printRich([rt.V.str("[center]q8[/center]")]);
      rt.frameLine(129);
      printRaw([rt.V.str("q9")]);
      rt.frameLine(130);
      printRich([rt.V.str("[color=gray]q10[/color][b]q11[/b]")]);
      rt.frameLine(131);
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
