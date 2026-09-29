#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { CORPUS, caseDir, caseIsProject } from "./lib.mjs";

export default async function runCase(id) {
  if (caseIsProject(id)) return runProjectCase(id);

  const gen = join(CORPUS, id, "main.gen.mts");
  const hand = join(CORPUS, id, "main.mts");
  const driver = existsSync(gen) ? gen : existsSync(hand) ? hand : null;
  if (!driver) return null;

  try {
    const harness = await import("../tools/harness/scene-tree");
    harness.reset?.();
  } catch {
  }

  const chunks = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    await import(pathToFileURL(driver).href);
  } finally {
    process.stdout.write = original;
  }
  return chunks.join("");
}

async function runProjectCase(id) {
  const root = caseDir(id);
  const outDir = join(root, ".gen");
  const { compileProject } = await import("../src/compile/project.ts");
  const result = await compileProject({
    entries: [join(root, "main.gd")],
    resRoot: root,
    outDir,
    runtimeImport: "gds2js/runtime",
    hostImport: "gds2js/host",
  });
  if (result.diags.length > 0) {
    throw new Error(`静态检查拦下：${result.diags[0].resPath} ${result.diags[0].diagnostic.message}`);
  }
  const entry = result.modules.find((m) => m.resPath === "res://main.gd");
  if (!entry) throw new Error("工程用例未产出入口 main.mts");

  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }

  try {
    const harness = await import("../src/host.ts");
    harness.resetOut?.();
  } catch {
  }

  const chunks = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    await import(pathToFileURL(entry.jsPath).href);
  } finally {
    process.stdout.write = original;
  }
  return chunks.join("");
}
