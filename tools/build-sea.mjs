/**
 * Node SEA 单文件打包（在 tsdown 出好 CJS 束之后运行）。
 *
 *   pnpm build:sea   ==   tsdown --config tsdown.sea.config.ts  &&  node tools/build-sea.mjs
 *
 * 步骤（等价于 Node 官方 SEA 文档，跨平台）：
 *   1. 校验 sea/dist/gds2js.cjs（CJS 束）与两个 wasm（core + grammar）都在。
 *   2. 生成 sea/build/sea-config.json：把两个 wasm 作为 asset 内嵌。
 *   3. node --experimental-sea-config 产出 sea-prep.blob。
 *   4. 复制当前 node 可执行文件 → sea/build/gds2js(.exe)。
 *   5. Windows：去掉 node 自带签名（postject 会破坏签名，且带错签名会被系统拦）。
 *   6. postject 把 blob 注入到复制出来的 exe。
 *
 * 前置条件（本脚本不会自动联网安装，缺失即明确报错）：
 *   - postject：pnpm add -D postject
 *   - Windows signtool（去签名用，属 Windows SDK）；没有也能产出 exe，但签名失效。
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(ROOT, "noop.js"));
const isWin = process.platform === "win32";
const EXE_NAME = isWin ? "gds2js.exe" : "gds2js";

const BUNDLE = join(ROOT, "sea/dist/gds2js.cjs");
const BUILD_DIR = join(ROOT, "sea/build");
const CONFIG_JSON = join(BUILD_DIR, "sea-config.json");
const BLOB = join(BUILD_DIR, "sea-prep.blob");
const OUT_EXE = join(BUILD_DIR, EXE_NAME);

function die(msg) {
  console.error(`\n[build-sea] ${msg}\n`);
  process.exit(1);
}
function info(msg) {
  console.log(`[build-sea] ${msg}`);
}

// --- 1. 前置文件校验 -------------------------------------------------------
if (!existsSync(BUNDLE)) {
  die(`找不到 CJS 束 ${BUNDLE}\n  先跑： tsdown --config tsdown.sea.config.ts（或直接 pnpm build:sea）`);
}
const grammarWasm = join(ROOT, "gdscript.wasm");
if (!existsSync(grammarWasm)) {
  die(`找不到语法 wasm ${grammarWasm}\n  先跑： pnpm gen:ws`);
}
let coreWasm;
try {
  // 用包主入口定位（web-tree-sitter 的 exports 没暴露 ./package.json）；core wasm 与主入口同目录。
  const pkgDir = dirname(require.resolve("web-tree-sitter"));
  coreWasm = join(pkgDir, "web-tree-sitter.wasm");
} catch {
  die("解析不到 web-tree-sitter 包目录——它还在依赖里吗？");
}
if (!existsSync(coreWasm)) die(`找不到 core wasm ${coreWasm}`);

mkdirSync(BUILD_DIR, { recursive: true });

// --- 2. 生成 sea-config.json ----------------------------------------------
const config = {
  main: "sea/dist/gds2js.cjs",
  output: "sea/build/sea-prep.blob",
  disableExperimentalSEAWarning: true,
  useSnapshot: false,
  // asset 的 key 必须与 src/parse/parser.ts 里的 GRAMMAR_ASSET / CORE_ASSET 一致。
  assets: {
    "gdscript.wasm": "gdscript.wasm",
    "web-tree-sitter.wasm": coreWasm,
  },
};
writeFileSync(CONFIG_JSON, JSON.stringify(config, null, 2), "utf8");
info(`写出 ${CONFIG_JSON}`);

// --- 3. 生成 blob ----------------------------------------------------------
const sea = spawnSync(process.execPath, ["--experimental-sea-config", CONFIG_JSON], {
  cwd: ROOT,
  stdio: "inherit",
});
if (sea.status !== 0) die("生成 sea-prep.blob 失败");

// --- 4. 复制 node 可执行文件 ------------------------------------------------
rmSync(OUT_EXE, { force: true });
copyFileSync(process.execPath, OUT_EXE);
info(`已复制 node → ${EXE_NAME}（源：${process.execPath}）`);

// --- 5. Windows 去签名（best-effort）---------------------------------------
if (isWin) {
  const sign = spawnSync("signtool", ["remove", "/s", OUT_EXE], { stdio: "ignore" });
  if (sign.error || sign.status !== 0) {
    info("⚠ 未找到 signtool（或去签名失败）——注入后 exe 的 node 签名会失效。");
    info("  本机自用通常没问题；要分发请装 Windows SDK 的 signtool，或之后自行重签名。");
  } else {
    info("已用 signtool 去掉 node 自带签名");
  }
}

// --- 6. postject 注入 blob --------------------------------------------------
const postjectBin = join(ROOT, "node_modules/.bin", isWin ? "postject.cmd" : "postject");
if (!existsSync(postjectBin)) {
  die(
    "未安装 postject，无法把 blob 注入 exe。\n" +
      "  装一次即可： pnpm add -D postject   然后重跑 pnpm build:sea",
  );
}
const fuse = "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2";
const inj = spawnSync(postjectBin, [OUT_EXE, "NODE_SEA_BLOB", BLOB, "--sentinel-fuse", fuse], {
  cwd: ROOT,
  stdio: "inherit",
  shell: isWin,
});
if (inj.status !== 0) die("postject 注入失败");

const sizeMb = (statSync(OUT_EXE).size / (1024 * 1024)).toFixed(1);
info(`\n✅ 完成：${OUT_EXE}  （${sizeMb} MB）`);
info(`   试跑： "${join(BUILD_DIR, EXE_NAME)}" build <某个 .gd> --out <目录>`);
