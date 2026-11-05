import { UnsupportedError } from "./errors";

/**
 * 宿主侧的进程能力表：命令行原始实参与环境变量。
 * 与 `HostIo` 同一口径 —— 没注册的那一轨用到就抛 `proc-host-missing`，绝不静默降级。
 */
export type HostProc = {
  argv(): string[];
  env(name: string): string | null;
  setEnv?(name: string, value: string): void;
  osName?(): string;
};

let TABLE: HostProc | null = null;

export function registerHostProc(table: HostProc): void {
  TABLE = table;
}

export function hostProc(): HostProc | null {
  return TABLE;
}

export function procHostMissing(): never {
  throw new UnsupportedError("proc-host-missing", "这一份宿主没有进程能力表：OS 的命令行与环境变量那一族没注册宿主表");
}
