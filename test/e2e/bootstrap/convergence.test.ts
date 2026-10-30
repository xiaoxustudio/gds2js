import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { NO_ANALYSIS } from "@gds2js/compiler/analyze/analysis-result";
import { emitModule } from "@gds2js/compiler/emit";
import { lower } from "@gds2js/compiler/lower/lower";
import type { Module } from "@gds2js/compiler/lower/ir";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import * as harness from "../../../tools/harness/scene-tree";
import { ROOT, godotOk, normalize } from "../../support/lib-bridge";

const SLICES = join(ROOT, "test", "fixtures", "bootstrap", "slices");
const OUT = join(ROOT, "tmp", "bootstrap-check");
const EMIT_OPTS = {
  runtimeImport: "../../../packages/runtime/src/runtime/index",
  hostImport: "../../../tools/harness/scene-tree",
  resPath: "res://main.gd",
};

const sliceIds = existsSync(SLICES)
  ? readdirSync(SLICES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

/** 一格的三面：产物字节稳定（fixpoint 的必要条件）+ 与 golden 逐字节 + 编译期没撞拒因。 */
interface Verdict {
  stable: boolean;
  parity: boolean;
  refused: string | null;
}

function verdictOf(golden: string | null, js: string | null, first: string | null, second: string | null, refused: string | null): Verdict {
  return { stable: first !== null && second !== null && first === second, parity: golden !== null && js !== null && js === golden, refused };
}

interface Row {
  id: string;
  verdict: Verdict | null;
  note: string;
}

/** `wall.txt` 那一格是「已声明的墙」：切片应当撞上名单里那句拒，撞不到就是它已经通了。 */
function readWall(id: string): string | null {
  const p = join(SLICES, id, "wall.txt");
  return existsSync(p) ? readFileSync(p, "utf8").trim() : null;
}

const rows: Row[] = [];

async function compileTwice(src: string): Promise<{ first: string | null; second: string | null; refused: string | null; diags: string }> {
  let ir: Module;
  try {
    ir = lower(await parseSource(src));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { first: null, second: null, refused: msg, diags: "" };
  }
  const analysis = analyze(ir, undefined, "bootstrap");
  if (analysis.diagnostics.length > 0) {
    return { first: null, second: null, refused: null, diags: `${analysis.diagnostics[0]!.code ?? ""} ${analysis.diagnostics[0]!.message}` };
  }
  try {
    return { first: emitModule(ir, EMIT_OPTS, analysis), second: emitModule(ir, EMIT_OPTS, analysis), refused: null, diags: "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { first: null, second: null, refused: msg, diags: "" };
  }
}

async function runArtifact(id: string, code: string): Promise<string> {
  const dir = join(OUT, id);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "main.gen.mts");
  writeFileSync(file, code, "utf8");
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
    harness.reset?.();
    await import(pathToFileURL(file).href);
  } finally {
    process.stdout.write = original;
    process.stderr.write = originalErr;
  }
  return out.join("") + err.join("");
}

describe("bootstrap · 切片级两阶段收敛", () => {
  for (const id of sliceIds) {
    it(id, async (ctx) => {
      const gdPath = join(SLICES, id, "main.gd");
      const goldenPath = join(SLICES, id, "godot.txt");
      const src = readFileSync(gdPath, "utf8");
      const golden = existsSync(goldenPath) ? readFileSync(goldenPath, "utf8") : null;
      if (golden === null) {
        rows.push({ id, verdict: null, note: "缺 golden" });
        ctx.skip(true, "切片还没有 golden：先跑 pnpm regen:bootstrap-golden（要 GODOT_BIN）");
        return;
      }
      const compiled = await compileTwice(src);
      let reason: string | null = compiled.refused ?? (compiled.diags !== "" ? `静态检查拦下：${compiled.diags}` : null);
      let js: string | null = null;
      if (reason === null) {
        try {
          js = normalize(await runArtifact(id, compiled.first!), gdPath);
        } catch (e) {
          reason = `产物跑挂：${e instanceof Error ? e.message : String(e)}`;
        }
        if (reason === null && compiled.first !== compiled.second) reason = "产物不稳：同一切片两次发射的 .mts 不逐字节相同";
        if (reason === null && js !== golden) {
          const jsLines = (js ?? "").split("\n");
          const goldenLines = golden.split("\n");
          const at = goldenLines.findIndex((line, idx) => line !== jsLines[idx]);
          const shown = at < 0 ? 0 : at;
          reason = `产物漂移：第 ${String(at < 0 ? goldenLines.length : at + 1)} 行 godot「${goldenLines[shown] ?? "<无>"}」vs js「${jsLines[shown] ?? "<无>"}」`;
        }
      }
      if (process.env.GDS2JS_BOOTSTRAP_DUMP && js !== null) console.log(`--- golden ${id} ---\n${golden}--- js ${id} ---\n${js}`);
      const wall = readWall(id);
      const engineRefused = !godotOk(golden);
      rows.push({ id, verdict: verdictOf(golden, js, compiled.first, compiled.second, reason), note: `${engineRefused ? "同拒 " : ""}${reason ?? ""}` });
      if (engineRefused) {
        const firstLine = golden.split("\n").find((line) => line.startsWith("SCRIPT ERROR")) ?? golden.split("\n")[0]!;
        if (reason === null) expect("产物跑通了", `[假绿] ${id}：引擎自己就拒（${firstLine}），产物却通了 —— 要么改探针形状，要么把产物也改成响亮拒`).toBe(null);
        if (wall !== null) expect(reason, `[墙变了] ${id}：声明的是 ${wall}，实得 ${reason}`).toContain(wall);
      } else if (wall !== null) {
        if (reason === null) expect("切片已经收敛了", `[墙已通] ${id}：wall.txt 还钉着 ${wall} —— 把它划走`).toBe(null);
        else expect(reason, `[墙变了] ${id}：声明的墙是 ${wall}，实得 ${reason}`).toContain(wall);
      } else {
        expect(reason, `[撞墙] ${id}：${reason ?? ""}`).toBe(null);
      }
    });
  }
});

describe("bootstrap · 门自己得能红", () => {
  const golden = "a\n";
  const emit = "emit\n";
  const js = "a\n";
  const clean = verdictOf(golden, js, emit, emit, null);

  it("① 三面全对的干净格", () => {
    expect(clean).toEqual({ stable: true, parity: true, refused: null });
  });

  it("② golden 被改一个字 → parity 红", () => {
    expect(verdictOf("b\n", js, emit, emit, null).parity).toBe(false);
  });

  it("③ 第二次发射漂了 → stable 红", () => {
    expect(verdictOf(golden, js, emit, "emit!\n", null).stable).toBe(false);
  });

  it("④ 产物少跑出一行 → parity 红", () => {
    expect(verdictOf(golden, "a\nb\n", emit, emit, null).parity).toBe(false);
  });

  it("⑤ 没 golden 或产物没跑出来 → parity 红", () => {
    expect(verdictOf(null, js, emit, emit, null).parity).toBe(false);
    expect(verdictOf(golden, null, emit, emit, null).parity).toBe(false);
  });

  it("⑥ 拒因非空 → refused 红", () => {
    expect(verdictOf(golden, js, emit, emit, "pattern-arm-runtime").refused).toBe("pattern-arm-runtime");
  });

  it("⑦ 切片不入 corpus 语义账", () => {
    expect(SLICES.replace(ROOT, "")).not.toContain(join("corpus", "cases"));
    expect(sliceIds.length, "切片目录为空 ⇒ 门无从红").toBeGreaterThan(0);
  });
});

afterAll(() => {
  rmSync(OUT, { recursive: true, force: true });
  const converged = rows.filter((r) => r.verdict !== null && r.verdict.stable && r.verdict.parity && r.verdict.refused === null);
  const walls = rows.filter((r) => r.verdict !== null && r.verdict.refused !== null && !r.note.startsWith("同拒"));
  const twins = rows.filter((r) => r.note.startsWith("同拒"));
  console.log(`自举切片 ${rows.length} 格 · 收敛 ${converged.length} · 真墙 ${walls.length} · 引擎同拒 ${twins.length}`);
  for (const r of [...walls, ...twins]) console.log(`  [${r.note.startsWith("同拒") ? "同拒" : readWall(r.id) === null ? "未声明" : "已钉"}] ${r.id.padEnd(28)} ${r.note.slice(r.note.startsWith("同拒") ? 3 : 0)}`);
});
