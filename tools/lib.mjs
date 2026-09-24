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

/**
 * 跑一次 Godot。注意：不要用 shell 的 timeout，Git Bash 下会解析到 Windows 的
 * timeout.exe（是个延时命令，直接吃掉参数）。超时交给 spawnSync 自己管。
 */
export function runGodot(gdPath, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  let r;
  try {
    r = spawnSync(GODOT_BIN, ["--headless", "--script", gdPath], {
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
  // 走哪种取决于它有没有在往上找到 project.godot，本机两种都出现过，必须都抹掉，
  // 否则 golden 会随工程位置漂移。
  out = out.replace(/res:\/\/[^\s)"]*main\.gd/g, "<case>/main.gd");
  const lines = out.split(/\r?\n/);
  const kept = [];
  for (const line of lines) {
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
