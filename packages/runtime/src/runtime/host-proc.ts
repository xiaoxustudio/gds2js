import { UnsupportedError } from "./errors";

/**
 * 宿主侧的进程能力表：命令行原始实参与环境变量。
 * 与 `HostIo` 同一口径 —— 没注册的那一轨用到就抛 `proc-host-missing`，绝不静默降级。
 */
export type OsHost = {
  version(): string;
  versionAlias(): string;
  modelName(): string;
  uniqueId(): string;
  locale(): string;
  processorName(): string;
  processorCount(): number;
  memory(): { physical: number; free: number; available: number; stack: number };
  tempDir(): string;
  cacheDir(): string;
  configDir(): string;
  dataDir(): string;
  userDataDir(): string;
  systemDir(dir: number): string;
  fonts(): string[];
  fontPath(name: string, weight: number, stretch: number, italic: boolean): string;
  caCertificates(): string;
  entropy(size: number): number[];
  delay(usec: number): void;
  execute(path: string, args: string[], readStderr: boolean, openConsole: boolean): { code: number; output: string[] };
  createProcess(path: string, args: string[], openConsole: boolean): number;
  kill(pid: number): number;
  isProcessRunning(pid: number): boolean;
  processExitCode(pid: number): number;
  shellOpen(uri: string): number;
  shellShow(path: string, openFolder: boolean): number;
  moveToTrash(path: string): number;
  alert(text: string, title: string): void;
  crash(message: string): void;
  openWithProgram(program: string, paths: string[]): number;
  stdinType(): number;
  stdoutType(): number;
  stderrType(): number;
  readStdin(size: number): number[];
  unsetEnv(name: string): void;
};

export type HostProc = {
  argv(): string[];
  env(name: string): string | null;
  setEnv?(name: string, value: string): void;
  osName?(): string;
  os?: OsHost;
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
