import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compileProject } from "@gds2js/compiler/compile/project";
import * as harness from "../../tools/harness/scene-tree";
import { caseDir, caseIsProject, caseScene, CORPUS } from "./lib-bridge";

export default async function runCase(id: string): Promise<string | null> {
  if (caseIsProject(id)) return runProjectCase(id);

  const gen = join(CORPUS, id, "main.gen.mts");
  const hand = join(CORPUS, id, "main.mts");
  const driver = existsSync(gen) ? gen : existsSync(hand) ? hand : null;
  if (driver === null) return null;

  harness.reset?.();
  return captureStdout(() => import(pathToFileURL(driver).href));
}

async function runProjectCase(id: string): Promise<string> {
  const root = caseDir(id);
  const outDir = join(root, ".gen");
  const result = await compileProject({
    entries: [join(root, "main.gd")],
    sceneFile: caseScene(id),
    resRoot: root,
    outDir,
    runtimeImport: "gds2js/runtime",
    hostImport: "gds2js/host",
  });
  if (result.diags.length > 0) {
    throw new Error(`静态检查拦下：${result.diags[0]!.resPath} ${result.diags[0]!.diagnostic.message}`);
  }
  const entry = result.modules.find((m) => m.resPath === "res://main.gd");
  if (entry === undefined) throw new Error("工程用例未产出入口 main.mts");

  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }

  harness.reset?.();
  return captureStdout(() => import(pathToFileURL(entry.jsPath).href));
}

async function captureStdout(fn: () => Promise<unknown>): Promise<string> {
  const out: string[] = [];
  const err: string[] = [];
  const original = process.stdout.write.bind(process.stdout);
  const originalErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = (chunk: unknown) => {
    out.push(String(chunk));
    return true;
  };
  process.stderr.write = (chunk: unknown) => {
    err.push(String(chunk));
    return true;
  };
  try {
    await fn();
  } finally {
    process.stdout.write = original;
    process.stderr.write = originalErr;
  }
  return out.join("") + err.join("");
}
