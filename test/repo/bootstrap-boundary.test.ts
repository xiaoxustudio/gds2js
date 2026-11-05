import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { ROOT, listCases, listSingleCases } from "../../tools/lib.mjs";

const SLICE_ROOT = join(ROOT, "test", "fixtures", "bootstrap", "slices");
const GATE_ROOT = join(ROOT, "test", "e2e", "bootstrap");
const sliceIds = existsSync(SLICE_ROOT)
  ? readdirSync(SLICE_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

describe("自举夹具边界（自举线阶段零）", () => {
  it("① 切片一支都不进语义账", () => {
    const corpus = new Set(listCases(""));
    const singles = new Set(listSingleCases(""));
    const leaks = sliceIds.filter((id) => corpus.has(id) || singles.has(id));
    if (leaks.length === 0) ok(`切片 ${sliceIds.length} 支全部在语料清单之外`);
    else bad(`自举夹具漏进了 corpus 语义账：${leaks.join(", ")}`);
  });

  it("② 夹具根不许落在 corpus 里", () => {
    if (!SLICE_ROOT.startsWith(join(ROOT, "corpus"))) ok(`夹具根 ${SLICE_ROOT.replace(ROOT, ".")} 不在 corpus 树下`);
    else bad(`自举夹具落在了 corpus 树里：${SLICE_ROOT.replace(ROOT, ".")} —— 语义账会被它多算`);
    const strays = readdirSync(join(ROOT, "corpus", "cases")).filter((n) => n.includes("bootstrap") || n.includes("slice-"));
    if (strays.length === 0) ok("corpus/cases 里没有 bootstrap / slice- 命名的目录");
    else bad(`corpus/cases 里混进了自举夹具：${strays.join(", ")}`);
  });

  it("③ 每支切片只许有 main.gd、godot.txt 与 wall.txt，产物一律落 tmp", () => {
    if (sliceIds.length === 0) bad("一支切片都没有：阶段零那把门无从红");
    const ALLOWED = new Set(["main.gd", "godot.txt", "wall.txt"]);
    for (const id of sliceIds) {
      const files = readdirSync(join(SLICE_ROOT, id)).sort();
      const extra = files.filter((f) => !ALLOWED.has(f));
      if (files.includes("main.gd") && files.includes("godot.txt") && extra.length === 0) ok(`${id}：${files.join(" + ")}`);
      else bad(`${id}：夹具格里有 ${files.join(", ")} —— 产物（${extra.join(", ") || "缺 main.gd / godot.txt"}）不该落在夹具目录`);
    }
  });

  it("④ 移植树与它的 Godot 参照同格在场", () => {
    const tree = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc");
    const ref = join(tree, "gdsrc.txt");
    if (!existsSync(tree)) bad("test/fixtures/bootstrap/gdsrc 不在盘面：阶段五那片长不出来的移植树没地方放");
    else {
      const gd = readdirSync(tree).filter((f) => f.endsWith(".gd"));
      if (gd.length > 0 && existsSync(join(tree, "project.godot")) && existsSync(ref)) ok(`移植树 ${gd.length} 支 .gd + project.godot + gdsrc.txt`);
      else bad(`移植树缺件：.gd ${String(gd.length)} 支，project.godot ${String(existsSync(join(tree, "project.godot")))}，gdsrc.txt ${String(existsSync(ref))}`);
    }
    if (existsSync(ref) && readFileSync(ref, "utf8").split("\n").length < 10) bad("gdsrc.txt 短得不像话：参照没取到读数");
  });

  it("④ 收敛门挂在 e2e project 的 include glob 上", () => {
    const gates = existsSync(GATE_ROOT) ? readdirSync(GATE_ROOT).filter((f) => f.endsWith(".test.ts")) : [];
    if (gates.length > 0) ok(`test/e2e/bootstrap/ 有 ${gates.length} 支门：${gates.join(", ")}`);
    else bad("test/e2e/bootstrap/ 里没有 .test.ts —— --project e2e bootstrap 抓不到东西，门等于没立");
  });

  it("⑤ 取数器只认钉住的裁判版本", () => {
    const tool = join(ROOT, "tools", "bootstrap.mjs");
    if (!existsSync(tool)) bad("tools/bootstrap.mjs 不在盘面：切片的 golden 就没有实测出处");
    else {
      const text = readFileSync(tool, "utf8");
      if (text.includes("requireGodotPin()") && !/\b4\.\d+\.\d+\b/.test(text)) ok("tools/bootstrap.mjs 落盘前走 requireGodotPin()，且没有第二个版本字面量");
      else bad("tools/bootstrap.mjs 没走 requireGodotPin() 或自带版本字面量：红线①");
    }
    const stale = sliceIds.filter((id) => !existsSync(join(SLICE_ROOT, id, "godot.txt")) && statSync(join(SLICE_ROOT, id)).isDirectory());
    if (stale.length === 0) ok("每支切片都已有 golden");
    else bad(`切片缺 golden（先跑 pnpm regen:bootstrap-golden）：${stale.join(", ")}`);
  });
});
