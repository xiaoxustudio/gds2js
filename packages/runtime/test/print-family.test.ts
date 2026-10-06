// 打印一族的「哪一路、结不结尾」那半截（语料 256 钉了 stdout 可见的 22 行，本门补 normalize 滤掉空行后看不见的：
// 零实参各支不一样、`printraw` 那半行没有结尾换行、`printerr` 只走 stderr）。
// 读数在 `tmp/probe-prints/{prints,zero-arg,err-shape}.log` —— 上一版把空行滤了，「prints() 一行都不出」是误读，
// 这次按原始字节量：`prints()` / `printt()` 仍结尾一行，`printraw()` / `print_verbose()` 什么都不动，`printerr()` 只往 stderr 落一个换行。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { flush, print, printDebug, printErr, printJoined, printRaw, printVerbose, resetOut } from "@gds2js/runtime/host";

const s = (t: string): Variant => V.str(t);

/** 跑一段宿主调用并分别收两路字节：golden 那侧才是 stdout 拼 stderr，这里要看的是每一路自己。 */
function streams(body: () => void): string {
  resetOut();
  const so: string[] = [];
  const se: string[] = [];
  const outOrig = process.stdout.write.bind(process.stdout);
  const errOrig = process.stderr.write.bind(process.stderr);
  process.stdout.write = (c: unknown): boolean => {
    so.push(String(c));
    return true;
  };
  process.stderr.write = (c: unknown): boolean => {
    se.push(String(c));
    return true;
  };
  try {
    body();
    flush();
  } finally {
    process.stdout.write = outOrig;
    process.stderr.write = errOrig;
    resetOut();
  }
  return `out(${JSON.stringify(so.join(""))})|err(${JSON.stringify(se.join(""))})`;
}

describe("host · 打印一族的分流与结尾", () => {
  it("零实参那格五支各不一样", () => {
    eq("256", "prints() 仍结尾一行", streams(() => { printRaw([s("A")]); printJoined(" ", []); print("B"); }), 'out("A\\nB\\n")|err("")');
    eq("256", "printt() 仍结尾一行", streams(() => { printRaw([s("A")]); printJoined("\t", []); print("B"); }), 'out("A\\nB\\n")|err("")');
    eq("256", "printraw() 连那半行都不开", streams(() => { printRaw([s("A")]); printRaw([]); print("B"); }), 'out("AB\\n")|err("")');
    eq("256", "print_verbose() 什么都不动", streams(() => { printRaw([s("A")]); printVerbose([s("z")]); print("B"); }), 'out("AB\\n")|err("")');
    eq("256", "printerr() 只往 stderr 落一个换行", streams(() => { printRaw([s("A")]); printErr([]); print("B"); }), 'out("AB\\n")|err("\\n")');
    eq("256", "prints() 无 pending 时就是空行", streams(() => { printJoined(" ", []); }), 'out("\\n")|err("")');
    eq("256", "print() 零实参也是空行", streams(() => { print(); }), 'out("\\n")|err("")');
  });

  it("分隔符与拼接", () => {
    eq("256", "prints 一个空格", streams(() => { printJoined(" ", [s("a"), s("1")]); }), 'out("a 1\\n")|err("")');
    eq("256", "printt 一个制表符", streams(() => { printJoined("\t", [s("aa"), s("b"), s("3")]); }), 'out("aa\\tb\\t3\\n")|err("")');
    eq("256", "两个空串之间仍有分隔", streams(() => { printJoined(" ", [s(""), s("")]); }), 'out(" \\n")|err("")');
    eq("256", "prints 接在 printraw 那半行上", streams(() => { printRaw([s("A")]); printJoined(" ", [s("s"), s("t")]); print("B"); }), 'out("As t\\nB\\n")|err("")');
    eq("256", "printt 接在 printraw 那半行上", streams(() => { printRaw([s("A")]); printJoined("\t", [s("s"), s("t")]); print("B"); }), 'out("As\\tt\\nB\\n")|err("")');
    eq("256", "printerr 实参之间无分隔", streams(() => { printErr([s("a"), s("b")]); }), 'out("")|err("ab\\n")');
  });

  it("printraw 那半行的三种落点", () => {
    eq("256", "后无 print 时不补结尾换行", streams(() => { printRaw([s("only")]); }), 'out("only")|err("")');
    eq("256", "print 在前时另起一行", streams(() => { print("a"); printRaw([s("b")]); print("c"); }), 'out("a\\nbc\\n")|err("")');
    eq("256", "连发的两段并进同一行", streams(() => { print("m1"); printRaw([s("m2")]); printRaw([s("m3")]); print("m4"); }), 'out("m1\\nm2m3m4\\n")|err("")');
    eq("256", "printerr 不占那半行", streams(() => { printRaw([s("A")]); printErr([s("e")]); print("B"); }), 'out("AB\\n")|err("e\\n")');
  });
});
