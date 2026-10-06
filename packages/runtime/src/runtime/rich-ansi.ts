import { asColor, colorFromText } from "./color";

/**
 * `print_rich` 的 bbcode → ANSI。底子是从 4.3 树 `core/string/print_string.cpp:88-169` 那 61 条 `String::replace`
 * 按原顺序搬过来的，末尾再补一个复位序列；表外的标签（`[font_size=12]`、`[noise]`、没闭合的 `*color=`）原样出。
 * 4.6.3 只在 `*color=` 那一族换了规矩 —— 名字表之外的一律解析成 Color 发 24 位、4.3 那三道 `contains` 闸门也没了，
 * 所以下面三段无条件跑，`rgbOf` / `applyColorFallback` 写的就是那几条新规矩。116 格逐字节对过（`tmp/probe-rich/rich.log`）。
 */

type Rule = readonly [tag: string, code: string];

const ESC = "\u001b";
const RESET = ESC + "[0m";

/** 那 18 条与三道闸门无关，顺序照源码（`[indent]` 给四个空格、`[center]` 给换行加三个制表符这些）。 */
const BASE: readonly Rule[] = [
  ["[b]", ESC + "[1m"],
  ["[/b]", ESC + "[22m"],
  ["[i]", ESC + "[3m"],
  ["[/i]", ESC + "[23m"],
  ["[u]", ESC + "[4m"],
  ["[/u]", ESC + "[24m"],
  ["[s]", ESC + "[9m"],
  ["[/s]", ESC + "[29m"],
  ["[indent]", "    "],
  ["[/indent]", ""],
  ["[code]", ESC + "[2m"],
  ["[/code]", ESC + "[22m"],
  ["[url]", ""],
  ["[/url]", ""],
  ["[center]", "\n\t\t\t"],
  ["[/center]", ""],
  ["[right]", "\n\t\t\t\t\t\t"],
  ["[/right]", ""],
];

const COLOR: readonly Rule[] = [
  ["[color=black]", ESC + "[30m"],
  ["[color=red]", ESC + "[91m"],
  ["[color=green]", ESC + "[92m"],
  ["[color=lime]", ESC + "[92m"],
  ["[color=yellow]", ESC + "[93m"],
  ["[color=blue]", ESC + "[94m"],
  ["[color=magenta]", ESC + "[95m"],
  ["[color=pink]", ESC + "[38;5;218m"],
  ["[color=purple]", ESC + "[38;5;98m"],
  ["[color=cyan]", ESC + "[96m"],
  ["[color=white]", ESC + "[97m"],
  ["[color=orange]", ESC + "[38;5;208m"],
  ["[color=gray]", ESC + "[90m"],
  ["[/color]", ESC + "[39m"],
];

const BGCOLOR: readonly Rule[] = [
  ["[bgcolor=black]", ESC + "[40m"],
  ["[bgcolor=red]", ESC + "[101m"],
  ["[bgcolor=green]", ESC + "[102m"],
  ["[bgcolor=lime]", ESC + "[102m"],
  ["[bgcolor=yellow]", ESC + "[103m"],
  ["[bgcolor=blue]", ESC + "[104m"],
  ["[bgcolor=magenta]", ESC + "[105m"],
  ["[bgcolor=pink]", ESC + "[48;5;218m"],
  ["[bgcolor=purple]", ESC + "[48;5;98m"],
  ["[bgcolor=cyan]", ESC + "[106m"],
  ["[bgcolor=white]", ESC + "[107m"],
  ["[bgcolor=orange]", ESC + "[48;5;208m"],
  ["[bgcolor=gray]", ESC + "[100m"],
  ["[/bgcolor]", ESC + "[49m"],
];

const FGCOLOR: readonly Rule[] = [
  ["[fgcolor=black]", ESC + "[30;40m"],
  ["[fgcolor=red]", ESC + "[91;101m"],
  ["[fgcolor=green]", ESC + "[92;102m"],
  ["[fgcolor=lime]", ESC + "[92;102m"],
  ["[fgcolor=yellow]", ESC + "[93;103m"],
  ["[fgcolor=blue]", ESC + "[94;104m"],
  ["[fgcolor=magenta]", ESC + "[95;105m"],
  ["[fgcolor=pink]", ESC + "[38;5;218;48;5;218m"],
  ["[fgcolor=purple]", ESC + "[38;5;98;48;5;98m"],
  ["[fgcolor=cyan]", ESC + "[96;106m"],
  ["[fgcolor=white]", ESC + "[97;107m"],
  ["[fgcolor=orange]", ESC + "[38;5;208;48;5;208m"],
  ["[fgcolor=gray]", ESC + "[90;100m"],
  ["[/fgcolor]", ESC + "[39;49m"],
];

/** 全局替换，扫的是**原文**、匹配一处就跳过整个 needle —— 与 `String::replace` 同一条式子。 */
function replaceAll(text: string, needle: string, value: string): string {
  if (needle === "") return text;
  let out = "";
  let from = 0;
  let at = text.indexOf(needle);
  while (at >= 0) {
    out += text.slice(from, at) + value;
    from = at + needle.length;
    at = text.indexOf(needle, from);
  }
  return out + text.slice(from);
}

function applyAll(text: string, rules: readonly Rule[]): string {
  let s = text;
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i] as Rule;
    s = replaceAll(s, r[0] as string, r[1] as string);
  }
  return s;
}

/** 名字表那 13 色走各自码；其余 `[color=X]` 一律按 Color 解析再发 24 位（4.6.3 实测 `#ff0000`、`ff0000`、`#f00` 都是 `255;0;0`，
 *  解析不中的（`bogus` / `grey` / 空串）发 `0;0;0`，带 alpha 的只看 r/g/b）。字节取法是 C 那句 `(uint8)(ch*255.0)` —— 截断，不是四舍五入；
 *  解析复用 S241 的 `colorFromText`，同一个 `/255` 除法配反向的 `*255`，八格刁串十六进制才逐字对得上。 */
function rgbOf(value: string): string {
  const c = asColor(colorFromText(value));
  const ch = (n: number): string => String(Math.floor(n * 255));
  const r = c === null ? 0 : c.r;
  const g = c === null ? 0 : c.g;
  const b = c === null ? 0 : c.b;
  return ch(r) + ";" + ch(g) + ";" + ch(b);
}

/** 名字表之外那几支 `*color=` 的一趟：值取到下一个 `]`，`kind` 决定发前景、背景还是两者。 */
function applyColorFallback(text: string, kind: string): string {
  const needle = kind === "bg" ? "[bgcolor=" : kind === "fg" ? "[fgcolor=" : "[color=";
  let out = "";
  let from = 0;
  let at = text.indexOf(needle, from);
  while (at >= 0) {
    const end = text.indexOf("]", at + needle.length);
    if (end < 0) break;
    const rgb = rgbOf(text.slice(at + needle.length, end));
    if (kind === "bg") out += text.slice(from, at) + ESC + "[48;2;" + rgb + "m";
    else if (kind === "fg") out += text.slice(from, at) + ESC + "[38;2;" + rgb + ";48;2;" + rgb + "m";
    else out += text.slice(from, at) + ESC + "[38;2;" + rgb + "m";
    from = end + 1;
    at = text.indexOf(needle, from);
  }
  return out + text.slice(from);
}

/** 4.3 源码那三道 `contains("[color")` 闸门在 4.6.3 实测已经不在了（光一个 `[/color]` 也转成 `39`），所以三段无条件跑。 */
export function richAnsi(text: string): string {
  let s = applyAll(text, BASE);
  s = applyAll(s, COLOR);
  s = applyAll(s, BGCOLOR);
  s = applyAll(s, FGCOLOR);
  s = applyColorFallback(s, "color");
  s = applyColorFallback(s, "bg");
  s = applyColorFallback(s, "fg");
  return s + RESET;
}
