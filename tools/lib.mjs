import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const CORPUS = join(ROOT, "corpus", "cases");

/** 裁判引擎。可用 GODOT_BIN 覆盖，默认本机 4.6.3 console 版。 */
export const GODOT_BIN =
  process.env.GODOT_BIN || "F:/godot/Godot_v4.6.3-stable_win64_console.exe";

/** 单次 Godot 运行的上限，「卡住了没输出」的护栏；用 GDS2JS_GODOT_TIMEOUT_MS 按机器状况放大。 */
export const DEFAULT_TIMEOUT_MS = Number(process.env.GDS2JS_GODOT_TIMEOUT_MS) || 15000;

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
  const lines = out.split(/\r?\n/);
  const kept = [];
  const ENGINE_FRAME = /^\s+at: \S+ \(core\/variant\//;
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
