/** CLI 的命令表（纯数据）+ 把它接到 commander 上的那一层。 */
import { Command, type OptionValues } from "commander";

export type FlagSpec = {
  /** `opts` 里的键（camel 名） */
  key: string;
  /** 长选项，含 `--`；以 `no-` 开头的形是取反：不取值，把 `key` 置 false */
  long: string;
  /** 短选项，含 `-`（可省） */
  short?: string;
  /** 给了就说明这个选项要值 */
  metavar?: string;
  /** 缺省值 */
  defaultTo?: string;
  /** 帮助里那一行的说明 */
  help: string;
};

export type CommandSpec = {
  name: string;
  /** 位置参数的名字（每条命令恰好一个，必填） */
  args: string[];
  description: string;
  flags: FlagSpec[];
  /** 位置参数 + 解析出来的选项表 */
  run: (positionals: string[], opts: Record<string, unknown>) => void;
};

export type CliSpec = {
  name: string;
  description: string;
  commands: CommandSpec[];
};

const RUNTIME_MODE = "运行时打包模式：import(默认) | local(旁挂 standalone) | single(内联自包含)";
const RES_ROOT = { key: "resRoot", long: "--res-root", metavar: "dir", help: "res:// 工程根（默认向上找 project.godot）" };

/** 每条命令都带的公共选项。 */
export function commonFlags(): FlagSpec[] {
  return [
    { key: "runtime", long: "--runtime", metavar: "spec", help: "运行时的 import 说明符（默认 gds2js/runtime；自带家目录的 exe 默认指家目录里那份 product.mjs）" },
    { key: "host", long: "--host", metavar: "spec", help: "宿主的 import 说明符（默认 gds2js/host；自带家目录的 exe 同上）" },
    { key: "host", long: "--no-host", help: "不引入宿主，发射成不继承任何基类的纯类" },
    { key: "watch", short: "-w", long: "--watch", help: "跑一次后监听 .gd 变更自动重跑（错误不中断，Ctrl+C 退出）" },
  ];
}

/** 公共 + 本命令独有。 */
export function withCommon(extra: FlagSpec[]): FlagSpec[] {
  const out: FlagSpec[] = [];
  for (const f of commonFlags()) out.push(f);
  for (const f of extra) out.push(f);
  return out;
}

export const FLAGS = {
  resRoot: RES_ROOT,
  runtimeMode: { key: "runtimeMode", long: "--runtime-mode", metavar: "mode", help: RUNTIME_MODE },
  out: (help: string): FlagSpec => ({ key: "out", short: "-o", long: "--out", metavar: "path", help }),
  noRun: { key: "run", long: "--no-run", help: "不在产物末尾驱动生命周期（出库/被 import 时用；默认会 run）" },
  sourcemap: { key: "sourcemap", long: "--sourcemap", help: "额外生成行粒度 .map（默认关，关掉时产物字节完全不变）" },
  keep: { key: "keep", long: "--keep", help: "留下临时产物（看生成的代码用），默认执行完删掉" },
};

/** `FlagSpec` → commander 的那一条选项串。 */
function optionText(f: FlagSpec): string {
  const head = f.short === undefined ? f.long : `${f.short}, ${f.long}`;
  return f.metavar === undefined ? head : `${head} <${f.metavar}>`;
}

/** 把命令表装到 commander 上，返回顶层 program（调用方负责 `parse()`）。 */
export function buildProgram(spec: CliSpec): Command {
  const program = new Command(spec.name);
  program.description(spec.description);
  for (const c of spec.commands) {
    const sub = program.command(`${c.name} <${c.args.join(" <>")}>`).description(c.description);
    for (const f of c.flags) {
      if (f.defaultTo === undefined) sub.option(optionText(f), f.help);
      else sub.option(optionText(f), f.help, f.defaultTo);
    }
    sub.action((file: string, opts: OptionValues) => {
      c.run([file], opts);
    });
  }
  return program;
}
