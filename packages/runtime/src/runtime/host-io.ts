import { UnsupportedError } from "./errors";

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
  /** 返回引擎那一套 Error 整数：0 成、7 不存在、12 路径不合法、32 已存在、1 失败。 */
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
 * 盘符绝对路径原样通过，`DirAccess.open(".")` 那一族按当前目录解（产物侧就是进程 cwd，
 * 语料的沙箱门把两侧都按到同一格上）；`res://` 与不带 `./` 前缀的裸名都不放行 ——
 * 产物里没有资源根，裸名在引擎那侧还要再过一层 globalize，照规则走就是假绿。
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
    const root = `${roaming}/Godot/app_userdata/${name}`;
    ensureUserRoot(io, root);
    return rel === "" ? root : `${root}/${rel}`;
  }
  if (/^[A-Za-z]:[/\\]/.test(path)) return path;
  if (path === "." || path === ".." || path.startsWith("./") || path.startsWith("../")) return fromCwd(path);
  throw new UnsupportedError("io-path-shape", `路径只量过 user://、带盘符的绝对路径与 ./ 与 .. 那一族（收到 ${path === "" ? "空串" : "另一形"}）：不带 ./ 前缀的裸名两侧不同源`);
}

/** 4.6.3 实测：`DirAccess.open(".")` 与 `("..")` 按当前目录解，产物侧的当前目录就是进程 cwd。 */
function fromCwd(path: string): string {
  const out: string[] = [];
  for (const seg of `${process.cwd().split("\\").join("/")}/${path}`.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

/** 引擎在启动那一步就把 `app_userdata/<工程名>` 建出来（沙箱门里那一层由 prepareSandbox 备好，
 *  原生轨上没人备）；缺的那两级由这里补上，缺中间层照旧按实测回 7。 */
function ensureUserRoot(io: HostIo, root: string): void {
  if (io.exists(root)) return;
  const cut = root.lastIndexOf("/");
  const parent = cut <= 0 ? "" : root.slice(0, cut);
  if (parent !== "" && !io.exists(parent)) ensureUserRoot(io, parent);
  io.makeDir(root);
}
