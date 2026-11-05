import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { GODOT_BIN, GODOT_PIN, ROOT, requireGodotPin } from "../lib.mjs";
import { snapshot } from "./api-snapshot.mjs";

function headerMatches(path) {
  try {
    const api = JSON.parse(readFileSync(path, "utf8"));
    const h = api.header;
    return `${h.version_major}.${h.version_minor}.${h.version_patch}` === GODOT_PIN;
  } catch {
    return false;
  }
}

requireGodotPin();

const cached = [
  join(ROOT, "tmp", "d6", "extension_api.json"),
  join(ROOT, "tmp", "d6", "api", "extension_api.json"),
].find((p) => existsSync(p) && headerMatches(p));

let apiPath = cached;
if (apiPath === undefined) {
  const dir = join(ROOT, "tmp", "compat-api");
  mkdirSync(dir, { recursive: true });
  const r = spawnSync(GODOT_BIN, ["--headless", "--dump-extension-api"], { cwd: dir, encoding: "utf8", timeout: 120_000 });
  const out = join(dir, "extension_api.json");
  if (!existsSync(out) || !headerMatches(out)) {
    process.stderr.write(`无法从 ${GODOT_BIN} 导出 extension_api.json\n${r.stdout ?? ""}${r.stderr ?? ""}\n`);
    process.exit(1);
  }
  apiPath = out;
}

const { index, moduleCount, rowCount } = snapshot(apiPath);
process.stdout.write(`API 快照：${index.engine.fullName} · ${moduleCount} 个模块 · ${rowCount} 行\n`);
