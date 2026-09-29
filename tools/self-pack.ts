#!/usr/bin/env node
/**
 * 把 **gds2js CLI 自己**打成一个 Windows 独立可执行文件（Node SEA）。
 *
 *   pnpm build                                   # 必须先有 dist（打进包的就是那几份产物）
 *   pnpm build:self [-o gds2js.exe] [--node <path>] [--keep-bundle]
 *
 * 这是**仓库的构建工具**，不是分发的 CLI 的子命令：exe 不该背着「再打一个 exe」的能力，
 * 它只需要背着「打用户的 exe」要用的真文件（见下面 home 清单）。
 *
 * 难点不在打包，而在「exe 里的 export 还要能用」。几件实测的事决定了这里的形状：
 *  1. SEA exe **不吃 node 旗标**（`x.exe -p …` 会把旗标当 argv 交给内嵌 main）。想靠内嵌一份 node
 *     让 exe 里再跑 `--build-sea`，代价是 34 MB 压缩资产，用户决定不干 —— `--pack node` 只认
 *     **外部** node（`--node` / `GDS2JS_NODE_BIN` / PATH）。
 *  2. 换进去的是 **perry**：`perry.exe` 旁边必须有 `LLVM-C.dll`（实测缺它连 `--version` 都是
 *     0xC0000135，而 LTO/libclang/libomp 都不必），运行时 `perry_runtime.lib` 在包里是 zst 且
 *     perry 不会自己解。好消息是 perry 把 LLVM 吃进进程、也自己找 MSVC 的 link.exe —— 实测把
 *     PATH 削到只剩 System32 照样出货，所以目标机器**不需要装 LLVM**。
 *  3. `--build-sea` 的 assets 是**原样 1:1 入包**（塞 20 MB 资产 exe 就 +20 MB），而实测 deflate-9
 *     能把 perry.exe 压到 41%、LLVM-C.dll 压到 37%、wasm 压到 15% —— 所以每个资产先压一份，
 *     由 `src/home.ts` 在首次运行时解回真实文件。
 *  4. 原生 `.node` 只能从**真实文件系统** dlopen（Node 文档写明，VFS 救不了）。不过 home 里现在
 *     已经没有 bundler 了：exe 里跑 rolldown 实测站不住，export 两支都不需要它。
 */
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
  /** 在 home 里的相对路径（`/` 分隔），也是资产 key 的尾段。 */
  rel: string;
  /** 从哪读。 */
  src: string;
}

/**
 * perry 工具链：从本地 `@perryts/perry-win32-x64` 取，**照 npm 包的 `bin/` `lib/` 形状铺进 home**。
 * 这样「exe 同目录找 DLL」和 `src/perry.ts` 里「bin 往上两级找 lib」在解出来的家目录里原样成立，
 * 不需要第二套定位逻辑。
 *
 * `perry_stdlib.lib.zst` / `perry_ui_windows.lib.zst` 不进包：实测我们的产物只走
 * `Linking (runtime-only)`，只给 runtime 就出货（20 MB 级的 exe，输出逐字节对过 node 与 golden）。
 * perry 哪天要另一颗 lib，它自己的原话会被 CLI 报出来，那时再往这里加。
 */
function perryHome(): Source[] {
  const pkgJson = createRequire(join(ROOT, "noop.js")).resolve("@perryts/perry-win32-x64/package.json");
  const pkg = dirname(pkgJson);
  return [
    { rel: "perry/bin/perry.exe", src: join(pkg, "bin", "perry.exe") },
    { rel: "perry/bin/LLVM-C.dll", src: join(pkg, "bin", "LLVM-C.dll") },
    { rel: "perry/lib/perry_runtime.lib.zst", src: join(pkg, "lib", "perry_runtime.lib.zst") },
  ];
}

/** web-tree-sitter 的运行时 wasm：走它自己的 exports 子路径，不猜目录形状。 */
function wasmGlue(): string {
  return createRequire(join(ROOT, "noop.js")).resolve("web-tree-sitter/web-tree-sitter.wasm");
}

/**
 * home 清单。缺件直接报错 —— 打出一个残废 exe 比不打更糟。
 *
 * `web-tree-sitter.wasm` 很容易被漏：self bundle 把它内联了，而它按
 * `new URL("web-tree-sitter.wasm", import.meta.url)` 找自己那颗运行时 wasm，在 exe 里那就是
 * 「exe 同目录」，实测直接 ENOENT + abort。由 `src/parse/parser.ts` 的 locateFile 指过去。
 */
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

/** 问一份 node 的版本；起不来、或回话不像版本号就返回 null（SEA exe 会把旗标当 argv，绝不回版本号）。 */
function nodeVersionOf(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  if (r.error || r.status !== 0) return null;
  const out = (r.stdout || "").trim();
  return /^\d+\.\d+\.\d+/.test(out) ? out : null;
}

/**
 * 打成 CLI 的单文件 bundle。
 * **`inlineDynamicImports` 是必需的**：默认会把 `await import("tsdown")`（`--runtime-mode single` 那条路）
 * 拆成兄弟 chunk（实测碎成 8 个文件），而注入 SEA 的 main 里 `import.meta.url` 指向 exe 自己，
 * 相对 chunk 路径解析不到。
 */
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

/** 解析 argv：只认 `-o/--out`、`--node`、`--keep-bundle`，别的一律响亮拒绝（拼错的旗标不该被静默吃掉）。 */
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
  // 打这个包必须借一份真 node 跑 --build-sea（≥25.7）；它只是构建机上的工具，不进产物
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
