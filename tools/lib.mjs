import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CORPUS = join(ROOT, "corpus", "cases");

/** 裁判引擎。可用 GODOT_BIN 覆盖，默认本机 4.6.3 console 版。 */
export const GODOT_BIN =
  process.env.GODOT_BIN || "F:/godot/Godot_v4.6.3-stable_win64_console.exe";

export const DEFAULT_TIMEOUT_MS = 15000;

export function listCases(filter = "") {
  if (!existsSync(CORPUS)) return [];
  return readdirSync(CORPUS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => n.includes(filter))
    .sort();
}

export function caseDir(id) {
  return join(CORPUS, id);
}

export function caseScript(id) {
  return join(caseDir(id), "main.gd");
}

export function caseGolden(id) {
  return join(caseDir(id), "godot.txt");
}

/** 多文件工程用例：目录里有 project.godot 就是（class_name 是工程级特性）。 */
export function caseIsProject(id) {
  return existsSync(join(caseDir(id), "project.godot"));
}

/**
 * 单文件工具（compile / ir-check / sema-check）的用例集：排除工程用例。
 * 工程用例的跨文件语义在单文件视角下会把别的文件的 class_name 误判成未声明，
 * 只能整工程编译才有意义 —— 那归 diff 管。
 */
export function listSingleCases(filter = "") {
  return listCases(filter).filter((id) => !caseIsProject(id));
}

/**
 * 跑一次 Godot。注意：不要用 shell 的 timeout，Git Bash 下会解析到 Windows 的
 * timeout.exe（是个延时命令，直接吃掉参数）。超时交给 spawnSync 自己管。
 *
 * 传 projectPath 时以工程模式跑（--path + res:// 脚本），class_name / 跨文件才生效；
 * 否则单文件模式（--script <abs.gd>），沿用种子用例的老写法。
 */
export function runGodot(gdPath, { timeoutMs = DEFAULT_TIMEOUT_MS, projectPath = null } = {}) {
  const scriptArg = projectPath ? "res://" + (gdPath.split(/[\\/]/).pop() || "main.gd") : gdPath;
  const args = ["--headless"];
  if (projectPath) args.push("--path", projectPath);
  args.push("--script", scriptArg);

  // 工程模式必须先跑一次 --import：Godot 的 class_name 全局注册表在导入期才建出来
  // （.godot/global_script_class_cache.cfg）。缺它，headless 直接跑脚本会报
  // "Identifier X not declared"—— 不是我们的代码错，是全局类没注册。best-effort，丢弃输出。
  if (projectPath) {
    try {
      spawnSync(GODOT_BIN, ["--headless", "--path", projectPath, "--import"], {
        encoding: "utf8",
        timeout: timeoutMs,
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
      });
    } catch {
      /* import 失败不阻断；脚本步会把真正的错报出来 */
    }
  }

  let r;
  try {
    r = spawnSync(GODOT_BIN, args, {
      encoding: "utf8",
      timeout: timeoutMs,
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (e) {
    return { text: `<<GDS2JS_SPAWN_ERROR>> ${e.message}`, timedOut: false, exitCode: null };
  }
  const timedOut = !!(r.error && (r.error.code === "ETIMEDOUT" || r.signal === "SIGTERM"));
  // spawn 起不来（比如沙箱拦进程、二进制缺失）必须响亮地失败。
  // 不拦的话输出是空串，godotOk() 会把它判成 OK，golden --check 全线假漂移 —— 实测踩过。
  if (r.error && !timedOut) {
    const code = r.error.code ?? "UNKNOWN";
    return {
      text: `<<GDS2JS_SPAWN_ERROR>> ${code}: ${r.error.message}`,
      timedOut: false,
      exitCode: null,
    };
  }
  let text = (r.stdout || "") + (r.stderr || "");
  if (timedOut) text += "\n<<GDS2JS_TIMEOUT>>";
  return { text, timedOut, exitCode: r.status };
}

/**
 * 归一化：抹掉与被测语义无关的噪音，否则 golden 会随环境漂移。
 * - 版本横幅
 * - 全局 project.godot 的 ConfigFile 报错（本机必出）
 * - 绝对路径
 * - 引擎源码里的行号（4.6.3 与 4.7 不同）
 */
export function normalize(text, gdPath = "") {
  let out = text;
  if (gdPath) {
    const variants = [gdPath.replace(/\\/g, "/"), gdPath.replace(/\//g, "\\")];
    for (const v of variants) out = out.split(v).join("<case>/main.gd");
  }
  // Godot 报错里的脚本路径有两种形态：绝对路径，或 res:// 相对工程根。
  // 单文件 `--script <abs>` 模式下 Godot 以 CWD 为 res:// 根，会打印
  // `res://corpus/cases/NNN/main.gd`；工程模式（--path）则打印 `res://main.gd`。
  // 一律塌缩成 `<case>/<basename>`，既还原种子用例的 `<case>/main.gd`，也让多文件
  // helper 脚本（point.gd 等）归一到 `<case>/point.gd`，不随工程位置漂移。
  out = out.replace(/res:\/\/[^\s)"]*?([\w./-]+\.gd)/g, (_m, p) => `<case>/${p.split("/").pop()}`);
  const lines = out.split(/\r?\n/);
  const kept = [];
  // Godot 的容器方法在越界 / 切片方向不合时走的是引擎侧 ERR_FAIL_*：stderr 打一条 ERROR + 回溯，
  // 然后**什么都不做继续跑**。行为与我们的"静默无操作"完全一致，差的就是那几行日志 —— 而里面的
  // `at: insert (core/variant/array.cpp:335)` 是 Godot 的内部源文件行号，产物不可能复现。
  // 所以整条（含 at: / backtrace / [N] 帧）归一化掉，与上面剥 ConfigFile 噪音、step 29 定下的
  // 「不复现 Godot 的 stderr 警告」是同一条纪律。注意**不碰 `SCRIPT ERROR`**：那是脚本语义，
  // 预期报错用例（013/014/074…）的 golden 就靠它。
  const ENGINE_DIAG = /^ERROR: (The calculated index .* is out of bounds|Slice step )/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (ENGINE_DIAG.test(line)) {
      i++;
      while (i < lines.length && /^\s+(at: |GDScript backtrace|\[\d+\] )/.test(lines[i])) i++;
      i--;
      continue;
    }
    if (/^Godot Engine v/.test(line)) continue;
    if (/^ERROR: ConfigFile parse error/.test(line)) continue;
    if (/^\s*at: _parse \(core\/io\/config_file/.test(line)) continue;
    if (line.trim() === "") continue;
    kept.push(line.replace(/at: load \(modules\/gdscript\/[^)]*\)/, "at: load (modules/gdscript)"));
  }
  return kept.join("\n") + "\n";
}

export function readGolden(id) {
  const p = caseGolden(id);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

export function writeGolden(id, text) {
  writeFileSync(caseGolden(id), text, "utf8");
}

/** 该 case 在 Godot 侧是否编译+运行成功（golden 里没有 SCRIPT ERROR / TIMEOUT）。 */
export function godotOk(golden) {
  if (golden === null) return false;
  return !/SCRIPT ERROR|<<GDS2JS_TIMEOUT>>|<<GDS2JS_SPAWN_ERROR>>/.test(golden);
}
