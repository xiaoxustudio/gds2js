/** CLI 的命令表：每条命令的位置参数与旗标形状（纯数据）。 */
import type { FlagSpec } from "./argv";

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

/** 公共 + 本命令独有（用循环拼，不用展开：静态目标上记录展开有形状要求）。 */
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
