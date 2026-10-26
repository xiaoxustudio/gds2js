import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bad as tkBad } from "@gds2js/testkit";
import { build } from "tsdown";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModuleWithMap } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { hasStandalone, missing } from "../support/env";
import { ROOT } from "../support/lib-bridge";

const TMP = join(ROOT, "pkg-check");
const STANDALONE_CJS = join(ROOT, "packages/gds2js/dist/standalone.cjs");

let failures = 0;
function bad(msg: string): void {
  failures++;
  tkBad(msg);
}

let STANDALONE_SRC = "";

const SKIP_WHY = hasStandalone ? "" : `（跳过：${missing("packages/gds2js/dist/standalone.cjs，先跑 pnpm build")}）`;

function runNode(cwd: string, file: string): { out: string; code: number | null } {
  const r = spawnSync(process.execPath, [file], { cwd, encoding: "utf8", timeout: 15000 });
  return { out: (r.stdout || "") + (r.stderr || ""), code: r.status };
}

const CASES = [
  "011-add-operator-types",
  "020-match-array-pattern",
  "023-await-return-value",
  "024-await-signal-args",
  "042-enum",
  "046-int-div-mod",
  "049-array-unbox",
  "050-dict-unbox",
];
const MODE_CELLS = (["single", "local"] as const).flatMap((mode) => CASES.map((c) => ({ mode, c })));

describe.skipIf(!hasStandalone)(`pkg-modes · 产物运行时打包模式${SKIP_WHY}`, () => {
  beforeAll(() => {
    rmSync(TMP, { recursive: true, force: true });
    mkdirSync(TMP, { recursive: true });
    STANDALONE_SRC = readFileSync(STANDALONE_CJS, "utf8");
  });

  afterAll(() => {
    console.log(`\n失败 ${failures} 项`);
    rmSync(TMP, { recursive: true, force: true });
  });

  it.each(MODE_CELLS)("① $mode $c 逐字节匹配 golden", async ({ mode, c }) => {
    const src = readFileSync(join(ROOT, "corpus/cases", c, "main.gd"), "utf8");
    const ir = lower(await parseSource(src));
    const diags = analyze(ir);
    if (diags.length > 0) {
      bad(`${mode} ${c}: 不该被 sema 拦（${diags[0]!.code}）`);
      expect(diags.length, `${mode} ${c} 不该被 sema 拦`).toBe(0);
      return;
    }
    const dir = join(TMP, `${mode}_${c}`);
    mkdirSync(dir, { recursive: true });
    copyFileSync(STANDALONE_CJS, join(dir, "gds2js-standalone.cjs"));
    const { code } = emitModuleWithMap(ir, {
      autoRun: true,
      runtimeImport: "../../../packages/runtime/src/runtime/index",
      hostImport: "../../../tools/harness/scene-tree",
      runtimeMode: mode,
      ...(mode === "single"
        ? { standaloneInline: STANDALONE_SRC }
        : { standaloneRequirePath: "./gds2js-standalone.cjs" }),
    });
    const file = join(dir, "m.mts");
    writeFileSync(file, code, "utf8");
    const { out } = runNode(dir, "m.mts");
    const golden = readFileSync(join(ROOT, "corpus/cases", c, "godot.txt"), "utf8");
    if (out !== golden) {
      bad(
        `${mode} ${c}: 输出与 golden 不符\n    got=${JSON.stringify(out.slice(0, 120))}\n    exp=${JSON.stringify(golden.slice(0, 120))}`,
      );
    }
    expect(out, `${mode} ${c} 输出与 golden 不符`).toBe(golden);
  });

  const nested: { subCode: string; out: string; code: number | null; diags: string } = {
    subCode: "",
    out: "",
    code: null,
    diags: "",
  };

  beforeAll(async () => {
    const proj = join(TMP, "nested_src");
    mkdirSync(join(proj, "sub"), { recursive: true });
    writeFileSync(join(proj, "project.godot"), '[application]\nconfig/name="nested"\n', "utf8");
    writeFileSync(
      join(proj, "main.gd"),
      "extends SceneTree\n\nfunc _initialize():\n\tvar t = Thing.new()\n\tprint(t.greet())\n\tquit()\n",
      "utf8",
    );
    writeFileSync(
      join(proj, "sub/thing.gd"),
      'class_name Thing\n\nfunc greet():\n\treturn "hi from sub"\n',
      "utf8",
    );

    const outDir = join(TMP, "nested_out");
    mkdirSync(outDir, { recursive: true });
    const standaloneFile = join(outDir, "gds2js-standalone.cjs");
    copyFileSync(STANDALONE_CJS, standaloneFile);

    const result = await compileProject({
      entries: [join(proj, "main.gd")],
      resRoot: proj,
      outDir,
      runtimeImport: "gds2js/runtime",
      hostImport: "gds2js/host",
      runtimeMode: "local",
      standaloneFile,
    });
    if (result.diags.length > 0) nested.diags = result.diags[0]!.diagnostic.message;
    const byRes = new Map(result.modules.map((m) => [m.resPath, m]));
    const sub = byRes.get("res://sub/thing.gd");
    if (sub !== undefined) {
      nested.subCode = sub.code;
      mkdirSync(dirname(sub.jsPath), { recursive: true });
    }
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    if (byRes.get("res://main.gd") !== undefined) {
      const r = runNode(outDir, "main.mts");
      nested.out = r.out;
      nested.code = r.code;
    } else {
      nested.out = "(未产出入口 main)";
    }
  });

  it("② nested 编译无诊断", () => {
    if (nested.diags !== "") bad(`nested 编译有诊断：${nested.diags}`);
    expect(nested.diags, "nested 编译有诊断").toBe("");
  });

  it("② 子模块 requirePath 用 ../ 命中上级旁挂包", () => {
    if (!nested.subCode.includes("../gds2js-standalone.cjs")) {
      bad(
        `子模块 requirePath 未走 ../：\n    ${nested.subCode.split("\n").find((l) => l.includes("standalone")) ?? "(无 standalone 行)"}`,
      );
    }
    expect(nested.subCode).toContain("../gds2js-standalone.cjs");
  });

  it("② nested local 入口跑通，输出正确", () => {
    if (nested.code !== 0 || nested.out !== "hi from sub\n") {
      bad(`nested local 运行异常 code=${nested.code} out=${JSON.stringify(nested.out.slice(0, 200))}`);
    }
    expect(nested.code, `nested local 退出码异常，out=${JSON.stringify(nested.out.slice(0, 200))}`).toBe(0);
    expect(nested.out).toBe("hi from sub\n");
  });

  /** base64-VLQ 解 mappings：genLine 被内联头顶大、srcLine 仍指回 .gd 小行号。 */
  function decodeMappingsField(str: string): Array<{ genLine: number; srcLine: number; srcCol: number }> {
    const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const val = (ch: string): number => {
      const i = B64.indexOf(ch);
      if (i < 0) throw new Error(`bad base64 char ${JSON.stringify(ch)}`);
      return i;
    };
    const out: Array<{ genLine: number; srcLine: number; srcCol: number }> = [];
    let sIdx = 0;
    let sLine = 0;
    let sCol = 0;
    str.split(";").forEach((grp, genLine) => {
      if (!grp) return;
      for (const seg of grp.split(",")) {
        let pos = 0;
        const field = (): number => {
          let shift = 0;
          let result = 0;
          let cont: number;
          do {
            const d = val(seg[pos++]!);
            cont = d & 32;
            result += (d & 31) * Math.pow(2, shift);
            shift += 5;
          } while (cont);
          return result & 1 ? -(result >> 1) : result >> 1;
        };
        field();
        sIdx += field();
        sLine += field();
        sCol += field();
        void sIdx;
        out.push({ genLine, srcLine: sLine, srcCol: sCol });
      }
    });
    return out;
  }

  const smap: {
    maxGen: number;
    totalGenLines: number;
    decoded: number;
    badSrc: Array<{ genLine: number; srcLine: number; srcCol: number }>;
    gdLineCount: number;
    out: string;
    golden: string;
    hasMap: boolean;
  } = { maxGen: 0, totalGenLines: 0, decoded: 0, badSrc: [], gdLineCount: 0, out: "", golden: "", hasMap: false };

  beforeAll(async () => {
    const src = readFileSync(join(ROOT, "corpus/cases/042-enum/main.gd"), "utf8");
    smap.gdLineCount = src.split("\n").length;
    smap.golden = readFileSync(join(ROOT, "corpus/cases/042-enum/godot.txt"), "utf8");
    const ir = lower(await parseSource(src));
    const dir = join(TMP, "smap");
    mkdirSync(dir, { recursive: true });
    const { code, map } = emitModuleWithMap(ir, {
      autoRun: true,
      sourcemap: true,
      runtimeImport: "../../../packages/runtime/src/runtime/index",
      hostImport: "../../../tools/harness/scene-tree",
      runtimeMode: "single",
      standaloneInline: STANDALONE_SRC,
      sourceFile: "main.gd",
      jsFile: "m.mts",
    });
    smap.totalGenLines = code.split("\n").length;
    smap.hasMap = map !== undefined && map !== null;
    if (smap.hasMap) {
      const m = decodeMappingsField(map!.mappings);
      smap.decoded = m.length;
      smap.maxGen = m.length === 0 ? 0 : Math.max(...m.map((x) => x.genLine));
      smap.badSrc = m.filter((x) => x.srcLine < 0 || x.srcLine >= smap.gdLineCount);
    }
    writeFileSync(join(dir, "m.mts"), code, "utf8");
    if (map !== undefined && map !== null) writeFileSync(join(dir, "m.mts.map"), JSON.stringify(map), "utf8");
    smap.out = runNode(dir, "m.mts").out;
  });

  it("③ 映射落在内联头之后（genLine 被顶大）", () => {
    if (!smap.hasMap) bad("single+sourcemap 未产出 map");
    else if (smap.decoded === 0) bad("mappings 解码为空");
    else if (smap.maxGen <= 1000) bad(`genLine 未体现内联头偏移（max=${smap.maxGen}）`);
    expect(smap.hasMap, "single+sourcemap 未产出 map").toBe(true);
    expect(smap.decoded, "mappings 解码为空").toBeGreaterThan(0);
    expect(smap.maxGen, `genLine 未体现内联头偏移（总生成行=${smap.totalGenLines}）`).toBeGreaterThan(1000);
  });

  it("③ 全部 srcLine 都在 .gd 行数范围内", () => {
    if (smap.badSrc.length > 0) {
      bad(`${smap.badSrc.length} 条 srcLine 越界，例：${JSON.stringify(smap.badSrc.slice(0, 3))}`);
    }
    expect(smap.badSrc, `srcLine 越界，例：${JSON.stringify(smap.badSrc.slice(0, 3))}`).toEqual([]);
  });

  it("③ 带 map 的 single 产物仍逐字节匹配 golden", () => {
    if (smap.out !== smap.golden) bad(`带 map single 输出不符：${JSON.stringify(smap.out.slice(0, 120))}`);
    expect(smap.out, `带 map single 输出不符：${JSON.stringify(smap.out.slice(0, 120))}`).toBe(smap.golden);
  });

  const wa: { imports: string[]; out: string; code: number | null; diags: string } = {
    imports: [],
    out: "",
    code: null,
    diags: "",
  };

  beforeAll(async () => {
    const req = createRequire(import.meta.url);
    const rt = pathToFileURL(req.resolve("gds2js/runtime")).href;
    const host = pathToFileURL(req.resolve("gds2js/host")).href;
    const emit = join(TMP, "wa_emit");
    const out = join(TMP, "wa_out");
    mkdirSync(emit, { recursive: true });
    const res = await compileProject({
      entries: [join(ROOT, "examples/multi/main.gd")],
      resRoot: join(ROOT, "examples/multi"),
      outDir: emit,
      runtimeImport: rt,
      hostImport: host,
    });
    if (res.diags.length > 0) {
      wa.diags = res.diags[0]!.diagnostic.message;
      return;
    }
    for (const m of res.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    const entry = res.modules.find((m) => m.resPath === "res://main.gd");
    if (entry === undefined) {
      wa.diags = "whole-app 无入口模块";
      return;
    }
    await build({
      entry: entry.jsPath,
      outDir: out,
      format: "esm",
      target: "node22",
      dts: false,
      clean: true,
      config: false,
      silent: true,
    } as unknown as Parameters<typeof build>[0]);
    const bundleFile = join(out, "main.mjs");
    const b = readFileSync(bundleFile, "utf8");
    wa.imports = b.split("\n").filter((l) => /^\s*import[\s{*.]/.test(l));
    const iso = mkdtempSync(join(tmpdir(), "gds-iso-"));
    try {
      copyFileSync(bundleFile, join(iso, "app.mjs"));
      const r = runNode(iso, "app.mjs");
      wa.out = r.out;
      wa.code = r.code;
    } finally {
      rmSync(iso, { recursive: true, force: true });
    }
  });

  it("④ whole-app 编译无诊断", () => {
    if (wa.diags !== "") bad(`whole-app：${wa.diags}`);
    expect(wa.diags, "whole-app 编译有问题").toBe("");
  });

  it("④ bundle 零 top-level import（运行时/宿主/跨文件全内联）", () => {
    if (wa.imports.length > 0) bad(`bundle 仍有 top-level import：${JSON.stringify(wa.imports.slice(0, 3))}`);
    expect(wa.imports, `bundle 仍有 top-level import：${JSON.stringify(wa.imports.slice(0, 3))}`).toEqual([]);
  });

  it("④ 仓库外 node 跑单文件 bundle，输出正确", () => {
    const want = "7\ntrue\nshape-7\nhi bob\ntrue\nhi zed\n";
    if (wa.code !== 0 || wa.out !== want) {
      bad(`仓库外运行异常 code=${wa.code} out=${JSON.stringify(wa.out.slice(0, 160))}`);
    }
    expect(wa.code, `仓库外退出码异常 out=${JSON.stringify(wa.out.slice(0, 160))}`).toBe(0);
    expect(wa.out).toBe(want);
  });
});
