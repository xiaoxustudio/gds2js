import { UnsupportedError } from "./runtime/errors";

/**
 * 宿主侧文件系统的能力表。三轨共用同一份语义，差异只由「产物 import 哪一份 host」表达：
 * 静态轨没有文件系统那一层时不注册，用到就抛 `io-host-missing`，绝不静默降级。
 */
export type HostIo = {
  exists(path: string): boolean;
  isDir(path: string): boolean;
  read(path: string): Uint8Array | null;
  write(path: string, bytes: Uint8Array): boolean;
  size(path: string): number;
  /** 返回引擎那一套 Error 整数：0 成、7 不存在、12 路径不合法、1 失败。 */
  makeDir(path: string): number;
  remove(path: string): number;
  rename(from: string, to: string): number;
  copy(from: string, to: string): number;
  list(path: string): string[];
};

let TABLE: HostIo | null = null;
let PROJECT_NAME = "";

export function registerHostIo(table: HostIo): void {
  TABLE = table;
}

export function hostIo(): HostIo | null {
  return TABLE;
}

export function hostIoMissing(): never {
  throw new UnsupportedError("io-host-missing", "这一份宿主没有文件系统能力：FileAccess / DirAccess 的那几支在静态产物上没注册宿主表");
}

export function setHostProjectName(name: string): void {
  PROJECT_NAME = name;
}

export function hostProjectName(): string {
  return PROJECT_NAME;
}

/**
 * 4.6.3 实测：`user://` 落在 `%APPDATA%/Godot/app_userdata/<config/name>/`，
 * 盘符绝对路径原样通过；`res://` 与裸相对路径都不放行 —— 产物里没有资源根，
 * 而相对路径两侧的 cwd 不同源，照引擎那条规则走就是假绿。
 */
export function resolveIoPath(path: string): string {
  const io = TABLE;
  if (io === null) hostIoMissing();
  if (path.startsWith("res://")) {
    throw new UnsupportedError("io-res-path", "`res://` 的运行期资源根没建模：产物不带资源目录（Tier 2 甲路线），这一支响亮拒");
  }
  if (path.startsWith("user://")) {
    const roaming = process.env.APPDATA;
    if (roaming === undefined || roaming === "") {
      throw new UnsupportedError("io-user-root", "`user://` 要读 %APPDATA%，那一格没给值：4.6.3 实测根是 %APPDATA%/Godot/app_userdata/<config/name>");
    }
    const name = PROJECT_NAME === "" ? "Godot" : PROJECT_NAME;
    const rel = path.slice("user://".length);
    return `${roaming}/Godot/app_userdata/${name}${rel === "" ? "" : `/${rel}`}`;
  }
  if (/^[A-Za-z]:[/\\]/.test(path)) return path;
  throw new UnsupportedError("io-path-shape", `路径只量过 user:// 与带盘符的绝对路径（收到 ${path === "" ? "空串" : "另一形"}）：裸相对路径两侧 cwd 不同源`);
}
