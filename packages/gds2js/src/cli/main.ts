import { basename, dirname, join, resolve } from "node:path";
import { runCli, FLAGS, withCommon, type CliSpec } from "../commands";
import { findNestedProjects, findResRoot, hostOf, isProjectCmd, modeOf, packOf, refuseNestedProjects, runtimeOf, strOf, type CmdName, type Ctx } from "./ctx";
import { buildProject, buildSingle } from "./build";
import { checkProject, checkSingle } from "./check";
import { EXPORT_TREE_DIR, exportExecutable, externalSeaNode } from "./export-exec";
import { runProject, runSingle } from "./run";
import { startWatch } from "./watch";
import { VERSION } from "../version";

const RUNNERS: Record<CmdName, (ctx: Ctx) => Promise<boolean>> = {
  check: checkSingle,
  build: buildSingle,
  "check-project": checkProject,
  "build-project": buildProject,
  run: runSingle,
  "run-project": runProject,
  export: exportExecutable,
};

async function dispatch(ctx: Ctx): Promise<void> {
  const ok = await RUNNERS[ctx.cmd](ctx);
  if (!ctx.watch) {
    process.exit(ok ? 0 : 1);
  }
  startWatch(ctx, RUNNERS);
}
const resolveCtx = (
  cmd: CmdName,
  file: string,
  opts: Record<string, unknown>,
): Ctx => {
  const input = resolve(file);
  const givenRoot = typeof opts.resRoot === "string" ? resolve(opts.resRoot) : null;
  const projectCmd = isProjectCmd(cmd);
  const foundRoot = projectCmd || cmd === "export" ? findResRoot(input) : null;
  const exportProject = cmd === "export" && (givenRoot !== null || foundRoot?.inferred === false);
  const isProject = projectCmd || exportProject;
  let resRoot = "";
  if (givenRoot) {
    resRoot = givenRoot;
  } else if (projectCmd && foundRoot) {
    if (foundRoot.inferred) {
      const nested = findNestedProjects(foundRoot.root);
      if (nested.length > 0) refuseNestedProjects(input, foundRoot.root, nested);
    }
    resRoot = foundRoot.root;
  } else if (exportProject && foundRoot) {
    resRoot = foundRoot.root;
  } else if (cmd === "export") {
    resRoot = dirname(input);
  }
  const out = strOf(opts.out);
  return {
    cmd,
    input,
    outPath: resolve(
      out ??
        (cmd === "export"
          ? join(dirname(input), basename(input).replace(/\.gd$/i, "")) + (process.platform === "win32" ? ".exe" : "")
          : input.replace(/\.gd$/i, ".mts")),
    ),
    resRoot,
    project: isProject,
    outDir: isProject
      ? resolve(cmd === "export" ? join(resRoot, EXPORT_TREE_DIR) : (out ?? join(resRoot, ".gds2js")))
      : cmd === "export"
        ? resolve(join(dirname(input), EXPORT_TREE_DIR))
        : "",
    runtimeImport: runtimeOf(opts.runtime),
    hostImport: hostOf(opts.host),
    runtimeMode: modeOf(opts.runtimeMode),
    run: opts.run !== false,
    sourcemap: opts.sourcemap === true,
    watch: opts.watch === true,
    keep: opts.keep === true,
    pack: cmd === "export" ? packOf(opts.pack) : "scriptc",
    seaNode: cmd === "export" ? externalSeaNode(strOf(opts.node)) : process.execPath,
    keepBundle: opts.keepBundle === true,
    verbose: opts.verbose === true,
  };
};

const CLI: CliSpec = {
  name: "gds2js",
  description: "GDScript 4.x → JavaScript AOT 编译器（Tier 1：纯语言层）",
  version: VERSION,
  commands: [
    {
      name: "check",
      args: ["file"],
      description: "静态检查（解析 / lowering / 语义分析）",
      flags: withCommon([FLAGS.resRootClosure]),
      run: (p, o) => dispatch(resolveCtx("check", p[0] as string, o)),
    },
    {
      name: "build",
      args: ["file"],
      description: "编译单个文件成 ESM 模块",
      flags: withCommon([FLAGS.out("输出文件（默认与源同名 .mts）"), FLAGS.runtimeMode, FLAGS.noRun, FLAGS.sourcemap, FLAGS.resRootClosure]),
      run: (p, o) => dispatch(resolveCtx("build", p[0] as string, o)),
    },
    {
      name: "check-project",
      args: ["entry"],
      description: "跨文件静态检查（编译作用域内全部 .gd）",
      flags: withCommon([FLAGS.resRoot]),
      run: (p, o) => dispatch(resolveCtx("check-project", p[0] as string, o)),
    },
    {
      name: "build-project",
      args: ["entry"],
      description: "跨文件编译整个工程（class_name / extends / is / preload）",
      flags: withCommon([
        FLAGS.resRoot,
        FLAGS.out("输出目录（默认 <res-root>/.gds2js）"),
        FLAGS.runtimeMode,
        FLAGS.noRun,
        { key: "sourcemap", long: "--sourcemap", help: "为每个产物生成行粒度 .map" },
      ]),
      run: (p, o) => dispatch(resolveCtx("build-project", p[0] as string, o)),
    },
    {
      name: "run",
      args: ["file"],
      description: "编译并直接执行单个脚本：脚本的 print 就是本命令的输出（临时产物跑完即删）",
      flags: withCommon([
        {
          key: "runtimeMode",
          long: "--runtime-mode",
          metavar: "mode",
          help: "运行时打包模式：import(默认) | single(内联自包含)；local 会往源目录旁挂文件，run 不支持",
        },
        FLAGS.keep,
        FLAGS.resRootClosure,
      ]),
      run: (p, o) => dispatch(resolveCtx("run", p[0] as string, o)),
    },
    {
      name: "run-project",
      args: ["entry"],
      description: "编译并直接执行整个工程（跑入口产物，临时目录用完即删；只支持 import 模式）",
      flags: withCommon([FLAGS.resRoot, FLAGS.keep]),
      run: (p, o) => dispatch(resolveCtx("run-project", p[0] as string, o)),
    },
    {
      name: "export",
      args: ["entry"],
      description: "把入口（整工程或单个脚本）编译成模块树，再用 scriptc / node SEA 打成 **Windows** 原生可执行文件",
      flags: [
        {
          key: "pack",
          long: "--pack",
          metavar: "name",
          defaultTo: "scriptc",
          help:
            "打包器：scriptc（默认，也是首选：外部原生编译器静态编 runtime 源码图，产物 1.6 MB、不带 node；产物里真的调了 compress/decompress 时自动铺 zstd 驱动并加 --dynamic，见 README）| node（出路：官方 SEA，要 Node>=25.7，自带 zlib/zstd。scriptc 的查找顺序：SCRIPTC_BIN → 同目录 scriptc/ → npm 依赖 → PATH；-v 打出实际用的哪一份）",
        },
        {
          key: "node",
          long: "--node",
          metavar: "path",
          help: "--pack node 时用哪份**外部** node 做 --build-sea（需 ≥25.7）；默认取 GDS2JS_NODE_BIN 否则当前 node，exe 里则从 PATH 找",
        },
        FLAGS.resRoot,
        FLAGS.out("可执行文件输出路径（默认与入口同名，带 .exe）"),
        { key: "keepBundle", long: "--keep-bundle", help: "留下中间产物（排查用），默认删" },
        {
          key: "verbose",
          short: "-v",
          long: "--verbose",
          help: "打出过程细节：外部编译器完整命令行、工作目录、GC 模式的理由；默认只给结论一行",
        },
      ],
      run: (p, o) => dispatch(resolveCtx("export", p[0] as string, o)),
    },
  ],
};

export function main(): void {
  runCli(CLI);
}
