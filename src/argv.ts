/** 自带的 argv 解析：把 `argv` 按命令表解析成位置参数 + 选项表。 */

export type FlagSpec = {
  /** `opts` 里的键（camel 名） */
  key: string;
  /** 长选项，含 `--`；以 `no-` 开头的形是取反：不取值，把 `key` 置 false */
  long: string;
  /** 短选项，含 `-`（可省） */
  short?: string;
  /** 给了就说明这个选项要值（`--x v` 或 `--x=v`） */
  metavar?: string;
  /** 缺省值 */
  defaultTo?: string;
  /** 帮助里那一行的说明 */
  help: string;
};

export type CommandSpec = {
  /** 命令名，如 `build-project` */
  name: string;
  /** 位置参数的名字（帮助与报错用），如 ["entry"] */
  args: string[];
  description: string;
  flags: FlagSpec[];
  /** 第一个位置参数（必填）+ 解析出来的选项表 */
  run: (positionals: string[], opts: Record<string, unknown>) => void;
};

export type CliSpec = {
  name: string;
  description: string;
  commands: CommandSpec[];
};

export type Stop = { help: boolean; text: string };

function camel(long: string): string {
  const bare = long.startsWith("--no-") ? long.slice(5) : long.slice(2);
  // 手写切段而不走 regex 替换：替换回调的捕获参数在静态目标上没有 lowering。
  const parts = bare.split("-");
  let out = parts[0] as string;
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i] as string;
    if (p.length > 0) out += p.charAt(0).toUpperCase() + p.slice(1);
  }
  return out;
}

function flagHelp(flags: FlagSpec[]): string {
  const lines: string[] = [];
  for (const f of flags) {
    const head = f.short === undefined ? f.long : `${f.short}, ${f.long}`;
    const withValue = f.metavar === undefined ? "" : ` <${f.metavar}>`;
    const dflt = f.defaultTo === undefined ? "" : ` (默认 ${JSON.stringify(f.defaultTo)})`;
    lines.push(`  ${head}${withValue}${dflt}  ${f.help}`);
  }
  return lines.join("\n");
}

export function helpText(spec: CliSpec, cmd: CommandSpec | null): string {
  if (cmd === null) {
    const rows: string[] = [];
    for (const c of spec.commands) rows.push(`  ${c.name} ${c.args.map((a) => `<${a}>`).join(" ")}  ${c.description}`);
    return `${spec.name} - ${spec.description}\n\n用法: ${spec.name} <命令> [选项]\n\n命令:\n${rows.join("\n")}\n\n用 ${spec.name} <命令> --help 看单个命令的选项\n`;
  }
  return `${spec.name} ${cmd.name} ${cmd.args.map((a) => `<${a}>`).join(" ")} - ${cmd.description}\n\n用法: ${spec.name} ${cmd.name} ${cmd.args.map((a) => `<${a}>`).join(" ")} [选项]\n\n选项:\n${flagHelp(cmd.flags)}\n`;
}

/** 找 `--x=v` 里的 `=`；没有就返回 -1。用 `charAt` 而不是 `tok[i]`：下标读取的类型带 undefined，静态目标上算运行期可选捕获 */
function eqAt(tok: string): number {
  for (let i = 0; i < tok.length; i++) {
    if (tok.charAt(i) === "=") return i;
  }
  return -1;
}

function pick(flags: FlagSpec[], tok: string): FlagSpec | null {
  for (const f of flags) {
    if (f.long === tok) return f;
    if (f.short !== undefined && f.short === tok) return f;
    const eq = eqAt(tok);
    if (eq > 0) {
      const head = tok.slice(0, eq);
      if (f.long === head || (f.short !== undefined && f.short === head)) return f;
    }
  }
  return null;
}

/** 解析一条命令行的参数部分。返回 `stop` 表示要先印帮助再退出（`--help` / 缺参数）；未知选项与缺位置参数都是报错 + 退出码 1。 */
export function runCli(spec: CliSpec, argv: string[]): Stop | null {
  if (argv.length === 0) return { help: true, text: helpText(spec, null) };
  const want = argv[0];
  if (want === "-h" || want === "--help") return { help: true, text: helpText(spec, null) };
  let cmd: CommandSpec | null = null;
  for (const c of spec.commands) {
    if (c.name === want) cmd = c;
  }
  if (cmd === null) {
    process.stderr.write(`error: unknown command ${JSON.stringify(want)}\n\n${helpText(spec, null)}`);
    process.exit(1);
    return null;
  }
  const flags = cmd.flags;
  const opts: Record<string, unknown> = {};
  for (const f of flags) {
    if (f.defaultTo !== undefined) opts[f.key] = f.defaultTo;
  }
  const positionals: string[] = [];
  let i = 1;
  while (i < argv.length) {
    const tok = argv[i] as string;
    i += 1;
    if (tok === "--") {
      while (i < argv.length) {
        positionals.push(argv[i] as string);
        i += 1;
      }
      break;
    }
    if (tok === "-h" || tok === "--help") return { help: true, text: helpText(spec, cmd) };
    if (tok.startsWith("-")) {
      const f = pick(flags, tok);
      if (f === null) {
        process.stderr.write(`error: unknown option ${JSON.stringify(tok)}\n\n${helpText(spec, cmd)}`);
        process.exit(1);
        return null;
      }
      if (tok.startsWith("--no-") && f.long === tok) {
        opts[f.key] = false;
        continue;
      }
      if (f.metavar === undefined) {
        opts[f.key] = true;
        continue;
      }
      const eq = eqAt(tok);
      if (eq > 0) {
        opts[f.key] = tok.slice(eq + 1);
        continue;
      }
      if (i >= argv.length) {
        process.stderr.write(`error: option ${JSON.stringify(f.long)} 缺参数 <${f.metavar}>\n`);
        process.exit(1);
        return null;
      }
      opts[f.key] = argv[i] as string;
      i += 1;
      continue;
    }
    positionals.push(tok);
  }
  if (positionals.length < cmd.args.length) {
    const missing = cmd.args[positionals.length] as string;
    process.stderr.write(`error: 缺少的必要参数 ${missing}\n\n${helpText(spec, cmd)}`);
    process.exit(1);
    return null;
  }
  cmd.run(positionals, opts);
  return null;
}
