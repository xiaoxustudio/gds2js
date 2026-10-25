
export type FlagSpec = {
  key: string;
  long: string;
  short?: string;
  metavar?: string;
  defaultTo?: string;
  help: string;
};

export type CommandSpec = {
  name: string;
  args: string[];
  description: string;
  flags: FlagSpec[];
  run: (positionals: string[], opts: Record<string, unknown>) => void;
};

export type CliSpec = {
  name: string;
  description: string;
  version?: string;
  commands: CommandSpec[];
};

const RUNTIME_MODE = "运行时打包模式：import(默认) | local(旁挂 standalone) | single(内联自包含)";
const RES_ROOT = { key: "resRoot", long: "--res-root", metavar: "dir", help: "res:// 工程根（默认向上找 project.godot）" };
const RES_ROOT_CLOSURE = { key: "resRoot", long: "--res-root", metavar: "dir", help: "读依赖时的 res:// 根（默认取入口所在目录；父脚本挂在入口之上时用这一旗点名真正的根）" };

export function commonFlags(): FlagSpec[] {
  return [
    { key: "runtime", long: "--runtime", metavar: "spec", help: "运行时的 import 说明符（默认 gds2js/runtime；自带家目录的 exe 默认指家目录里那份 product.mjs）" },
    { key: "host", long: "--host", metavar: "spec", help: "宿主的 import 说明符（默认 gds2js/host；自带家目录的 exe 同上）" },
    { key: "host", long: "--no-host", help: "不引入宿主，发射成不继承任何基类的纯类" },
    { key: "watch", short: "-w", long: "--watch", help: "跑一次后监听 .gd 变更自动重跑（错误不中断，Ctrl+C 退出）" },
  ];
}

export function withCommon(extra: FlagSpec[]): FlagSpec[] {
  const out: FlagSpec[] = [];
  for (const f of commonFlags()) out.push(f);
  for (const f of extra) out.push(f);
  return out;
}

export const FLAGS = {
  resRoot: RES_ROOT,
  resRootClosure: RES_ROOT_CLOSURE,
  runtimeMode: { key: "runtimeMode", long: "--runtime-mode", metavar: "mode", help: RUNTIME_MODE },
  out: (help: string): FlagSpec => ({ key: "out", short: "-o", long: "--out", metavar: "path", help }),
  noRun: { key: "run", long: "--no-run", help: "不在产物末尾驱动生命周期（出库/被 import 时用；默认会 run）" },
  sourcemap: { key: "sourcemap", long: "--sourcemap", help: "额外生成行粒度 .map（默认关，关掉时产物字节完全不变）" },
  keep: { key: "keep", long: "--keep", help: "留下临时产物（看生成的代码用），默认执行完删掉" },
};

const MIN_WIDTH_TO_WRAP = 40;
const ITEM_INDENT = 2;
const SPACER = 2;
const HELP_TERM = "-h, --help";
const HELP_TEXT = "display help for command";
const SUGGEST_MAX = 3;

function optionText(f: FlagSpec): string {
  const head = f.short === undefined ? f.long : `${f.short}, ${f.long}`;
  return f.metavar === undefined ? head : `${head} <${f.metavar}>`;
}

/** 说明末尾那对括号：只有带值的选项显缺省值，与 commander 同式。 */
function optionHelp(f: FlagSpec): string {
  return f.defaultTo === undefined ? f.help : `${f.help} (default: ${JSON.stringify(f.defaultTo)})`;
}

/** 无颜色时 commander 就用 `.length`（`stripVTControlCharacters` 对纯文本是恒等）。 */
function displayWidth(s: string): number {
  return s.length;
}

function boxWrap(str: string, width: number): string {
  if (width < MIN_WIDTH_TO_WRAP) return str;
  const lines: string[] = [];
  for (const line of str.split(/\r\n|\n/)) {
    const chunks = line.match(/[\s]*[^\s]+/g);
    if (chunks === null) {
      lines.push("");
      continue;
    }
    let sum: string[] = [chunks[0] as string];
    let sumWidth = displayWidth(chunks[0] as string);
    for (let k = 1; k < chunks.length; k++) {
      const chunk = chunks[k] as string;
      const visible = displayWidth(chunk);
      if (sumWidth + visible <= width) {
        sum.push(chunk);
        sumWidth += visible;
        continue;
      }
      lines.push(sum.join(""));
      const next = chunk.replace(/^\s+/, "");
      sum = [next];
      sumWidth = displayWidth(next);
    }
    lines.push(sum.join(""));
  }
  return lines.join("\n");
}

type Row = { term: string; desc: string };
type Page = { usage: string; description: string; options: Row[]; commands: Row[] };

function itemLine(term: string, desc: string, termWidth: number, helpWidth: number): string {
  const indent = " ".repeat(ITEM_INDENT);
  if (desc === "") return indent + term;
  const padded = term.padEnd(termWidth + term.length - displayWidth(term));
  const remaining = helpWidth - termWidth - SPACER - ITEM_INDENT;
  if (remaining < MIN_WIDTH_TO_WRAP) return `${indent}${padded}${" ".repeat(SPACER)}${desc}`;
  const body = boxWrap(desc, remaining).replace(/\n/g, `\n${" ".repeat(termWidth + SPACER)}`);
  return `${indent}${padded}${" ".repeat(SPACER)}${body}`.replace(/\n/g, `\n${indent}`);
}

function blockLines(title: string, items: Row[], termWidth: number, helpWidth: number): string[] {
  if (items.length === 0) return [];
  const lines: string[] = [title];
  for (const it of items) lines.push(itemLine(it.term, it.desc, termWidth, helpWidth));
  lines.push("");
  return lines;
}

function renderPage(page: Page, helpWidth: number): string {
  let termWidth = 0;
  for (const o of page.options) termWidth = Math.max(termWidth, displayWidth(o.term));
  for (const c of page.commands) termWidth = Math.max(termWidth, displayWidth(c.term));
  const out: string[] = [`Usage: ${page.usage}`, ""];
  if (page.description !== "") out.push(boxWrap(page.description, helpWidth), "");
  for (const line of blockLines("Options:", page.options, termWidth, helpWidth)) out.push(line);
  for (const line of blockLines("Commands:", page.commands, termWidth, helpWidth)) out.push(line);
  return out.join("\n");
}

function helpWidthOf(toError: boolean): number {
  const stream = toError ? process.stderr : process.stdout;
  return (stream.isTTY ? stream.columns : undefined) ?? 80;
}

function showPage(page: Page, toError: boolean, code: number): never {
  const text = renderPage(page, helpWidthOf(toError));
  if (toError) process.stderr.write(text);
  else process.stdout.write(text);
  process.exit(code);
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > SUGGEST_MAX) return Math.max(a.length, b.length);
  const d: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    const row: number[] = [];
    for (let j = 0; j <= b.length; j++) row.push(i === 0 ? j : j === 0 ? i : 0);
    d.push(row);
  }
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const prev = d[i - 1]!;
      const cur = d[i]!;
      let v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, d[i - 2]![j - 2]! + 1);
      }
      cur[j] = v;
    }
  }
  return d[a.length]![b.length]!;
}

function suggestSimilar(word: string, candidates: string[]): string {
  const names: string[] = [];
  for (const c of candidates) if (!names.includes(c)) names.push(c);
  if (names.length === 0) return "";
  const searchingOptions = word.startsWith("--");
  const target = searchingOptions ? word.slice(2) : word;
  const list: string[] = [];
  for (const n of names) list.push(searchingOptions ? n.slice(2) : n);
  let similar: string[] = [];
  let best = SUGGEST_MAX;
  for (const candidate of list) {
    if (candidate.length <= 1) continue;
    const distance = editDistance(target, candidate);
    const length = Math.max(target.length, candidate.length);
    if ((length - distance) / length <= 0.4) continue;
    if (distance < best) {
      best = distance;
      similar = [candidate];
    } else if (distance === best) {
      similar.push(candidate);
    }
  }
  similar.sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
  const heads: string[] = [];
  for (const n of similar) heads.push(searchingOptions ? `--${n}` : n);
  if (heads.length > 1) return `\n(Did you mean one of ${heads.join(", ")}?)`;
  if (heads.length === 1) return `\n(Did you mean ${heads[0]!}?)`;
  return "";
}

function longCandidates(flags: FlagSpec[], hasVersion: boolean): string[] {
  const out: string[] = [];
  for (const f of flags) out.push(f.long);
  out.push("--help");
  if (hasVersion) out.push("--version");
  return out;
}

function unknownOption(flags: FlagSpec[], hasVersion: boolean, flag: string): never {
  return fail(`error: unknown option '${flag}'${suggestSimilar(flag, longCandidates(flags, hasVersion))}`);
}

function missingArgument(f: FlagSpec): never {
  return fail(`error: option '${optionText(f)}' argument missing`);
}

function argsText(c: CommandSpec): string {
  const out: string[] = [];
  for (const a of c.args) out.push(`<${a}>`);
  return out.join(" ");
}

function rootPage(spec: CliSpec): Page {
  const options: Row[] = [];
  if (spec.version !== undefined) options.push({ term: "-V, --version", desc: "output the version number" });
  options.push({ term: HELP_TERM, desc: HELP_TEXT });
  const commands: Row[] = [];
  for (const c of spec.commands) {
    commands.push({ term: `${c.name}${c.flags.length === 0 ? "" : " [options]"} ${argsText(c)}`, desc: c.description });
  }
  commands.push({ term: "help [command]", desc: HELP_TEXT });
  return { usage: `${spec.name} [options] [command]`, description: spec.description, options: options, commands: commands };
}

function verbPage(spec: CliSpec, c: CommandSpec): Page {
  const options: Row[] = [];
  for (const f of c.flags) options.push({ term: optionText(f), desc: optionHelp(f) });
  options.push({ term: HELP_TERM, desc: HELP_TEXT });
  return { usage: `${spec.name} ${c.name} [options] ${argsText(c)}`, description: c.description, options: options, commands: [] };
}

function verbOf(spec: CliSpec, name: string): CommandSpec | null {
  for (const c of spec.commands) if (c.name === name) return c;
  return null;
}

function commandNames(spec: CliSpec): string[] {
  const out: string[] = [];
  for (const c of spec.commands) out.push(c.name);
  out.push("help");
  return out;
}

function longOf(flags: FlagSpec[], name: string): FlagSpec | null {
  for (const f of flags) if (f.long === name) return f;
  return null;
}

function shortOf(flags: FlagSpec[], name: string): FlagSpec | null {
  for (const f of flags) if (f.short === name) return f;
  return null;
}

function parseVerb(spec: CliSpec, c: CommandSpec, argv: string[]): [string[], Record<string, unknown>] {
  const opts: Record<string, unknown> = {};
  for (const f of c.flags) if (f.defaultTo !== undefined) opts[f.key] = f.defaultTo;
  const hasVersion = spec.version !== undefined;
  const operands: string[] = [];
  let afterDash = false;
  let pos = 0;
  while (pos < argv.length) {
    const t = argv[pos] as string;
    if (t === "--" && !afterDash) {
      afterDash = true;
      pos++;
      continue;
    }
    if (afterDash || t === "-" || !t.startsWith("-")) {
      operands.push(t);
      pos++;
      continue;
    }
    if (t === "-h" || t === "--help") showPage(verbPage(spec, c), false, 0);
    if (t.startsWith("--")) {
      const eq = t.indexOf("=");
      const hit = longOf(c.flags, eq < 0 ? t : t.slice(0, eq));
      if (hit !== null) {
        pos++;
        if (hit.metavar === undefined) {
          opts[hit.key] = hit.long.startsWith("--no-") ? false : true;
          continue;
        }
        let value: string | undefined = eq < 0 ? undefined : t.slice(eq + 1);
        if (value === undefined && pos < argv.length) {
          value = argv[pos];
          pos++;
        }
        if (value === undefined) missingArgument(hit);
        opts[hit.key] = value;
      } else {
        unknownOption(c.flags, hasVersion, eq < 0 ? t : t.slice(0, eq));
      }
      continue;
    }
    let body = t.slice(1);
    while (body !== "") {
      const flag = `-${body[0] as string}`;
      const hit = flag === "-h" ? null : shortOf(c.flags, flag);
      if (hit === null) {
        if (flag === "-h") showPage(verbPage(spec, c), false, 0);
        unknownOption(c.flags, hasVersion, flag);
      }
      body = body.slice(1);
      if (hit.metavar === undefined) {
        opts[hit.key] = true;
        continue;
      }
      let value: string | undefined;
      if (body !== "") {
        value = body;
        body = "";
      } else if (pos + 1 < argv.length) {
        value = argv[pos + 1];
        pos++;
      }
      if (value === undefined) missingArgument(hit);
      opts[hit.key] = value;
    }
    pos++;
  }
  if (operands.length < c.args.length) fail(`error: missing required argument '${c.args[operands.length] as string}'`);
  if (operands.length > c.args.length) {
    const expected = c.args.length;
    fail(`error: too many arguments for '${c.name}'. Expected ${expected} argument${expected === 1 ? "" : "s"} but got ${operands.length}: ${operands.join(", ")}.`);
  }
  return [operands, opts];
}

export function runCli(spec: CliSpec, argv: string[] = process.argv.slice(2)): void {
  const page = rootPage(spec);
  if (spec.version !== undefined) {
    for (const t of argv) {
      if (t === "--") break;
      if (t === "-V" || t === "--version") {
        process.stdout.write(`${spec.version}\n`);
        process.exit(0);
      }
    }
  }
  const rootUnknown: string[] = [];
  let operand = -1;
  let dash = -1;
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i] as string;
    if (t === "--") {
      dash = i;
      break;
    }
    if (t === "-h" || t === "--help") {
      if (operand === -1) showPage(page, false, 0);
      break;
    }
    if (t === "-" || !t.startsWith("-")) {
      if (operand === -1) operand = i;
      continue;
    }
    if (operand === -1) rootUnknown.push(t);
  }
  if (operand === -1 && dash !== -1 && dash + 1 < argv.length) operand = dash + 1;
  if (operand === -1) {
    if (argv.length === 0) showPage(page, true, 1);
    for (const t of rootUnknown) {
      if (!t.startsWith("--")) unknownOption([], spec.version !== undefined, t);
      const eq = t.indexOf("=");
      unknownOption([], spec.version !== undefined, eq < 0 ? t : t.slice(0, eq));
    }
    process.exit(0);
  }
  const head = argv[operand] as string;
  if (head === "help") {
    const target = argv[operand + 1];
    if (target === undefined || target === "-h" || target === "--help") showPage(page, false, 0);
    const named = verbOf(spec, target);
    if (named === null) showPage(page, true, 1);
    showPage(verbPage(spec, named), false, 0);
    return;
  }
  const verb = verbOf(spec, head);
  if (verb === null) fail(`error: unknown command '${head}'${suggestSimilar(head, commandNames(spec))}`);
  const parsed = parseVerb(spec, verb, argv.slice(operand + 1).concat(rootUnknown));
  verb.run(parsed[0], parsed[1]);
}
