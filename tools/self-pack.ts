#!/usr/bin/env node
import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

/** 仓库根：tools/self-pack.ts 往上两级。 */
const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** home 里带的 dist 产物：打平的自带运行时（export 两支都吃它）+ local/single 的旁挂包。 */
const HOME_DIST = ["dist/product.mjs", "dist/standalone.cjs"] as const;

/** `--build-sea` 的一步式入口从哪版起可用（实测 24.21 没这个旗标）。 */
const SEA_MIN_NODE = "25.7.0";

interface Source {
  rel: string;
  src: string;
}

function perryHome(): Source[] {
  const pkgJson = createRequire(join(ROOT, "noop.js")).resolve("@perryts/perry-win32-x64/package.json");
  const pkg = dirname(pkgJson);
  return [
    { rel: "perry/bin/perry.exe", src: join(pkg, "bin", "perry.exe") },
    { rel: "perry/bin/LLVM-C.dll", src: join(pkg, "bin", "LLVM-C.dll") },
    { rel: "perry/lib/perry_runtime.lib.zst", src: join(pkg, "lib", "perry_runtime.lib.zst") },
  ];
}

function wasmGlue(): string {
  return createRequire(join(ROOT, "noop.js")).resolve("web-tree-sitter/web-tree-sitter.wasm");
}

function homeSources(): Source[] {
  const out: Source[] = [
    { rel: "gdscript.wasm", src: join(ROOT, "gdscript.wasm") },
    { rel: "node_modules/web-tree-sitter/web-tree-sitter.wasm", src: wasmGlue() },
    ...HOME_DIST.map((f) => ({ rel: f, src: join(ROOT, f) })),
    ...perryHome(),
  ];
  const missing = out.filter((s) => !existsSync(s.src));
  if (missing.length > 0) {
    throw new Error(
      `缺料：\n  ${missing.map((m) => `${m.rel} ← ${m.src}`).join("\n  ")}` +
        (existsSync(join(ROOT, "dist/product.mjs")) ? "" : "\n  （dist 没构建？先跑 pnpm build）") +
        (missing.some((m) => m.rel.startsWith("perry/"))
          ? "\n  （perry 没装成本地依赖？先 `pnpm add -D @perryts/perry-win32-x64` —— 打进 exe 的就是这一份）"
          : ""),
    );
  }
  return out;
}

function versionAtLeast(v: string, min: string): boolean {
  const a = v.replace(/^v/, "").split(".").map(Number);
  const b = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

function nodeVersionOf(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  if (r.error || r.status !== 0) return null;
  const out = (r.stdout || "").trim();
  return /^\d+\.\d+\.\d+/.test(out) ? out : null;
}

async function bundleCli(stage: string): Promise<string> {
  const { build } = await import("tsdown");
  const outDir = join(stage, "app");
  await build({
    entry: { "cli.self": join(ROOT, "src", "cli.ts") },
    outDir,
    format: "esm",
    target: "node22",
    platform: "node",
    dts: false,
    clean: true,
    config: false,
    silent: true,
    noExternal: [/.*/],
    outputOptions: { inlineDynamicImports: true },
  } as Parameters<typeof build>[0]);
  const bundle = join(outDir, "cli.self.mjs");
  if (!existsSync(bundle)) throw new Error(`没打出 CLI 单文件 bundle（找 ${bundle}）`);
  return bundle;
}

interface Opts {
  out: string;
  seaBin: string;
  stage: string;
  keep: boolean;
}

function parseArgv(argv: string[]): Opts {
  const opts: { out?: string; node?: string; keep?: boolean } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    const val = (): string => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} 需要一个值`);
      return v;
    };
    if (a === "-o" || a === "--out") opts.out = val();
    else if (a === "--node") opts.node = val();
    else if (a === "--keep-bundle") opts.keep = true;
    else if (a === "-h" || a === "--help") {
      console.log("用法：pnpm build:self [-o gds2js.exe] [--node <path>] [--keep-bundle]");
      process.exit(0);
    } else throw new Error(`不认识的参数：${a}（可用：-o/--out、--node、--keep-bundle、-h）`);
  }
  const out = resolve(opts.out ?? join(ROOT, "gds2js.exe"));
  const seaBin = opts.node ?? process.env.GDS2JS_NODE_BIN ?? process.execPath;
  return { out, seaBin, stage: join(ROOT, ".gds2js-self"), keep: opts.keep === true };
}

async function main(): Promise<void> {
  if (process.platform !== "win32") {
    console.error(`build:self:  error  只出 Windows 产物（当前平台 ${process.platform}）。Linux 未纳入。`);
    process.exit(1);
  }
  const o = parseArgv(process.argv.slice(2));
  const v = nodeVersionOf(o.seaBin);
  if (v === null || !versionAtLeast(v, SEA_MIN_NODE)) {
    console.error(`build:self:  error  需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），${o.seaBin} 是 ${v ?? "不可用"}。`);
    console.error(`  换够新的 node 重跑：pnpm build:self --node "<Node >= ${SEA_MIN_NODE}>/node.exe"`);
    process.exit(1);
  }
  const sources = homeSources();
  mkdirSync(o.stage, { recursive: true });
  const assetsDir = join(o.stage, "assets");
  mkdirSync(assetsDir, { recursive: true });
  let made = false;
  try {
    const bundle = await bundleCli(o.stage);
    console.error(`build:self（node ${v}）：CLI 单文件 bundle → 逐个压缩 ${sources.length} 份 home 资产 → --build-sea`);
    const assets: Record<string, string> = {};
    sources.forEach((s, i) => {
      const raw = readFileSync(s.src);
      const packed = deflateSync(raw, { level: 9 });
      const dest = join(assetsDir, `${i}.bin`);
      writeFileSync(dest, packed);
      assets[`gds2js-home/${s.rel}`] = dest;
      console.error(`  ${(packed.length / 1048576).toFixed(1).padStart(6)} MB（原 ${(raw.length / 1048576).toFixed(1).padStart(6).trim()} MB）  ${s.rel}`);
    });
    const cfg = join(o.stage, "sea-config.json");
    writeFileSync(
      cfg,
      JSON.stringify({ main: bundle, mainFormat: "module", output: o.out, assets, disableExperimentalSEAWarning: true }, null, 2),
      "utf8",
    );
    const r = spawnSync(o.seaBin, [`--build-sea=${cfg}`], { encoding: "utf8", windowsHide: true, timeout: 900_000 });
    made = !r.error && r.status === 0 && existsSync(o.out);
    if (!made) {
      const why = r.error?.message ?? (((r.stdout || "") + (r.stderr || "")).trim() || `退出码 ${r.status}`);
      console.error(`build:self:  error  ${why.split(/\r?\n/).slice(0, 20).join("\n")}`);
      process.exit(1);
    }
    console.error(`已打出 CLI 自身 → ${o.out} (${(statSync(o.out).size / 1048576).toFixed(1)} MB)`);
  } finally {
    if (o.keep) console.error(`中间舞台已保留（--keep-bundle）：${o.stage}`);
    else rmSync(o.stage, { recursive: true, force: true });
  }
}

main().catch((e: unknown) => {
  console.error(`build:self:  error  ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
