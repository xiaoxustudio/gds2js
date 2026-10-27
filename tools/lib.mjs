import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CORPUS = join(ROOT, "corpus", "cases");

/** 裁判引擎。`GODOT_BIN` 指路径；不设则走 PATH 上的 `godot`，缺它三支引擎门自己 skip 并说明缺什么。 */
export const GODOT_BIN =
  process.env.GODOT_BIN || "godot";

/** 单次 Godot 运行的上限，「卡住了没输出」的护栏；用 GDS2JS_GODOT_TIMEOUT_MS 按机器状况放大。 */
export const DEFAULT_TIMEOUT_MS = Number(process.env.GDS2JS_GODOT_TIMEOUT_MS) || 15000;

/** 语义基线钉死的裁判版本；读数、golden 与生成表一律只认这一支。 */
export const GODOT_PIN = "4.6.3";

/** 跑一次 `--version` 拿裁判引擎自报的版本号；起不来给 null。 */
export function godotVersion(timeoutMs = DEFAULT_TIMEOUT_MS) {
  let r;
  try {
    r = spawnSync(GODOT_BIN, ["--version"], { encoding: "utf8", timeout: timeoutMs, windowsHide: true });
  } catch {
    return null;
  }
  const out = (r.stdout ?? "").trim();
  return r.status === 0 && out !== "" ? out : null;
}

/** 落盘任何读数之前先验裁判版本：版本不对就拒写，免得把语义基线静默搬到另一支引擎上。 */
export function requireGodotPin() {
  const v = godotVersion();
  if (v === null) {
    console.error(`裁判引擎起不来（${GODOT_BIN} --version 没回版本号）：GODOT_BIN 指到一个 Godot ${GODOT_PIN} 可执行文件`);
    process.exit(1);
  }
  if (!v.startsWith(GODOT_PIN)) {
    console.error(`语义只认 Godot ${GODOT_PIN} 的实测读数，${GODOT_BIN} 自报 ${v} —— 拒写 golden / 生成表`);
    process.exit(1);
  }
  console.log(`裁判引擎版本: ${v}`);
  return v;
}

/** golden 里带 `<<GDS2JS_TIMEOUT>>` 的那一族是「运行期脚本报错 → 后面的 quit() 永远到不了」：
 *  读数在冷启动那几秒里就打完了，等满整段超时只是白等（17 例每例 15 秒）。预算取 DEFAULT 的三分之一、
 *  下限 4 秒，慢机器用 GDS2JS_GODOT_TIMEOUT_MS 放大时两道一起放大；万一提前杀导致文本对不上，门报「漂移」而不是静默。 */
export function hangBudget(golden) {
  return (golden ?? "").includes("<<GDS2JS_TIMEOUT>>") ? Math.max(4000, Math.ceil(DEFAULT_TIMEOUT_MS / 3)) : DEFAULT_TIMEOUT_MS;
}

/** 探头用例（000-probe-cs-*）是 case-table 的原料，不是语料：除非 filter 点名 000-，否则不进任何门。 */
export function listCases(filter = "") {
  if (!existsSync(CORPUS)) return [];
  const wantProbes = filter.startsWith("000-");
  return readdirSync(CORPUS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => wantProbes || !n.startsWith("000-"))
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

export function caseIsProject(id) {
  return existsSync(join(caseDir(id), "project.godot"));
}

/** 单文件工具的用例集：排除工程用例。吃它的有 tools/compile.ts 与
 *  packages/compiler/test/{ir,sema,emit-invariants}.test.ts。 */
export function listSingleCases(filter = "") {
  return listCases(filter).filter((id) => !caseIsProject(id));
}

export function runGodot(gdPath, { timeoutMs = DEFAULT_TIMEOUT_MS, projectPath = null } = {}) {
  const scriptArg = projectPath ? "res://" + (gdPath.split(/[\\/]/).pop() || "main.gd") : gdPath;
  const args = ["--headless"];
  if (projectPath) args.push("--path", projectPath);
  args.push("--script", scriptArg);

  if (projectPath) {
    try {
      spawnSync(GODOT_BIN, ["--headless", "--path", projectPath, "--import"], {
        encoding: "utf8",
        timeout: timeoutMs,
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
      });
    } catch {
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

export function normalize(text, gdPath = "") {
  let out = text;
  if (gdPath) {
    const variants = [gdPath.replace(/\\/g, "/"), gdPath.replace(/\//g, "\\")];
    for (const v of variants) out = out.split(v).join("<case>/main.gd");
  }
  out = out.replace(/res:\/\/[^\s)"]*?([\w./-]+\.gd)/g, (_m, p) => `<case>/${p.split("/").pop()}`);
  out = out.replace(/<([A-Za-z_]\w*)#-?\d+>/g, "<$1#号>");
  out = out.replace(/@([A-Za-z_]\w*)@-?\d+/g, "@$1@号");
  out = out.replace(/(^|[\s|,(])_([A-Z]\w*)_-?\d+/g, (_m, p, cls) => `${p}_${cls}_号`);
  const lines = out.split(/\r?\n/);
  const kept = [];
  const ENGINE_FRAME = /^\s+at: \S+ \(\.?\/?core\/(variant|math)\//;
  const BLOCK_TAIL = /^(\s+(at: |GDScript backtrace|\[\d+\] )|ERROR: Condition )/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^ERROR: /.test(line)) {
      let j = i + 1;
      while (j < lines.length && BLOCK_TAIL.test(lines[j])) j++;
      if (lines.slice(i, j).some((l) => ENGINE_FRAME.test(l))) {
        i = j - 1;
        continue;
      }
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
