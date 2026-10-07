// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("START")]));
    printRich([rt.V.str("[b]B[/b]")]);
    printRich([rt.V.str("[i]I[/i]")]);
    printRich([rt.V.str("[u]U[/u]")]);
    printRich([rt.V.str("[s]S[/s]")]);
    printRich([rt.V.str("[indent]IN[/indent]")]);
    printRich([rt.V.str("[code]C[/code]")]);
    printRich([rt.V.str("[url]L[/url]")]);
    printRich([rt.V.str("[center]M[/center]")]);
    printRich([rt.V.str("[right]R[/right]")]);
    printRich([rt.V.str("[/indent]")]);
    printRich([rt.V.str("[/center]")]);
    printRich([rt.V.str("[/right]")]);
    printRich([rt.V.str("[/url]")]);
    printRich([rt.V.str("[b][i]both[/i][/b]")]);
    printRich([rt.V.str("[b]a[i]b[/i]c[/b]")]);
    printRich([rt.V.str("[i][b]ab[/b][/i]")]);
    printRich([rt.V.str("[color=black]t[/color]")]);
    printRich([rt.V.str("[color=red]t[/color]")]);
    printRich([rt.V.str("[color=green]t[/color]")]);
    printRich([rt.V.str("[color=lime]t[/color]")]);
    printRich([rt.V.str("[color=yellow]t[/color]")]);
    printRich([rt.V.str("[color=blue]t[/color]")]);
    printRich([rt.V.str("[color=magenta]t[/color]")]);
    printRich([rt.V.str("[color=pink]t[/color]")]);
    printRich([rt.V.str("[color=purple]t[/color]")]);
    printRich([rt.V.str("[color=cyan]t[/color]")]);
    printRich([rt.V.str("[color=white]t[/color]")]);
    printRich([rt.V.str("[color=orange]t[/color]")]);
    printRich([rt.V.str("[color=gray]t[/color]")]);
    printRich([rt.V.str("[bgcolor=black]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=red]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=green]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=lime]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=yellow]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=blue]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=magenta]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=pink]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=purple]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=cyan]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=white]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=orange]t[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=gray]t[/bgcolor]")]);
    printRich([rt.V.str("[fgcolor=black]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=red]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=green]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=lime]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=yellow]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=blue]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=magenta]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=pink]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=purple]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=cyan]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=white]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=orange]t[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=gray]t[/fgcolor]")]);
    printRich([rt.V.str("[/color]")]);
    printRich([rt.V.str("[/bgcolor]")]);
    printRich([rt.V.str("[/fgcolor]")]);
    printRich([rt.V.str("[color=#ff0000]hex[/color]")]);
    printRich([rt.V.str("[color=bogus]x[/color]")]);
    printRich([rt.V.str("[color=red]")]);
    printRich([rt.V.str("plain[bgcolor=gray]")]);
    printRich([rt.V.str("[color=red][bgcolor=blue][fgcolor=pink]all[/fgcolor][/bgcolor][/color]")]);
    printRich([rt.V.str("[noise]x[/noise]")]);
    printRich([rt.V.str("[font_size=20]x[/font_size]")]);
    printRich([rt.V.str("[url=https://godot.dev]link[/url]")]);
    printRich([rt.V.str("[b]")]);
    printRich([rt.V.str("[/b]")]);
    printRich([rt.V.str("[B]upper[/B]")]);
    printRich([rt.V.str("[")]);
    printRich([rt.V.str("]")]);
    printRich([rt.V.str("[]")]);
    printRich([rt.V.str("")]);
    printRich([rt.V.str("no tag at all")]);
    printRich([rt.V.str("[b]bold[/b][color=red]red[/color][center]mid[/center]")]);
    printRich([rt.V.str("[color=#ff0000]x[/color]")]);
    printRich([rt.V.str("[color=ff0000]x[/color]")]);
    printRich([rt.V.str("[color=#f00]x[/color]")]);
    printRich([rt.V.str("[color=#010203]x[/color]")]);
    printRich([rt.V.str("[color=#808080]x[/color]")]);
    printRich([rt.V.str("[color=#7f7f7f]x[/color]")]);
    printRich([rt.V.str("[color=#aaaaaa]x[/color]")]);
    printRich([rt.V.str("[color=#555555]x[/color]")]);
    printRich([rt.V.str("[color=#050a14]x[/color]")]);
    printRich([rt.V.str("[color=#abcdef]x[/color]")]);
    printRich([rt.V.str("[color=#fefffd]x[/color]")]);
    printRich([rt.V.str("[color=#ff000080]x[/color]")]);
    printRich([rt.V.str("[color=#gg0000]x[/color]")]);
    printRich([rt.V.str("[color=]x[/color]")]);
    printRich([rt.V.str("[color= red]x[/color]")]);
    printRich([rt.V.str("[color=RED]x[/color]")]);
    printRich([rt.V.str("[color=grey]x[/color]")]);
    printRich([rt.V.str("[color=medium_spring_green]x[/color]")]);
    printRich([rt.V.str("[bgcolor=#ff0000]x[/bgcolor]")]);
    printRich([rt.V.str("[bgcolor=bogus]x[/bgcolor]")]);
    printRich([rt.V.str("[fgcolor=#ff0000]x[/fgcolor]")]);
    printRich([rt.V.str("[fgcolor=bogus]x[/fgcolor]")]);
    printRich([rt.V.str("[/color]")]);
    printRich([rt.V.str("[/bgcolor]")]);
    printRich([rt.V.str("[/fgcolor]")]);
    printRich([rt.V.str("x[/color]")]);
    printRich([rt.V.str("[color=red][color=#ff0000]x[/color]")]);
    printRich([rt.V.str("[b][color=bogus][/b][/color]")]);
    printRich([rt.V.str("[color=#ff0000][bgcolor=#00ff00]x[/bgcolor][/color]")]);
    printRich([rt.V.str("[color=#ff0000")]);
    printRich([rt.V.str("[color=")]);
    printRich([rt.V.str("[color=a]b]x[/color]")]);
    printRich([rt.V.str("[color=#ff0000]a[color=blue]b[/color]")]);
    printRich([rt.V.str("[color=#ff0000]no close")]);
    printRich([]);
    print(rt.showArgs([rt.V.str("TWO"), rt.V.str("ARGS"), rt.V.bool(true)]));
    printRich([rt.V.nil()]);
    printRich([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    printRich([rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
    printRich([rt.V.stringName("sn")]);
    printRich([rt.V.str("a"), rt.V.int(1), rt.V.bool(true)]);
    printRaw([rt.V.str("q1")]);
    printRich([rt.V.str("[b]q2[/b]")]);
    print(rt.showArgs([rt.V.str("q3")]));
    printRich([rt.V.str("[color=#ff0000]q4[/color]")]);
    printRaw([rt.V.str("q5")]);
    printRich([rt.V.str("q6")]);
    print(rt.showArgs([rt.V.str("q7")]));
    printRich([rt.V.str("[center]q8[/center]")]);
    printRaw([rt.V.str("q9")]);
    printRich([rt.V.str("[color=gray]q10[/color][b]q11[/b]")]);
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
