# gds2js

> 为什么选 `js` 作为目标 `AOT` 语言？
> 因为 `js` 的语法很松散，你可以直接写在一行，也可以换行，不像C++ 那样严格，也不像Python那样需要计算缩进。
> js 可以直接跑在浏览器上，众所周知浏览器跨平台是天生的，这提供了很多优势。
> 而且目前 `js` 已经有工具支持编译为原生二进制IR和程序，所以我选择了它

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。管线：tree-sitter CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。

## 环境

- Node **>= 22.18**（`package.json` engines；CLI 与 tools/ 同一条底线 —— 门脚本 `.mjs` 直接 `import` 包内 `.ts`、`run` 跑 `.mts` 产物，靠的都是 Node 默认开启的类型剥离，那一条从 22.18 起）。
  实测边界：18.20.4 / 20.19.4 上 `check` `check-project` `build` 都过，但 `run` 报 `Unknown file extension ".mts"`、`build-project --runtime-mode single` 报 `Promise.withResolvers is not a function`；
  22.19.0 / 24.8.0 / 26.10.0 全过且 `run` 的输出逐字节相同。
- **只有 `export --pack node`（SEA）那一支另要 Node >= 25.7**，由代码在运行期判并给明确拒（`实测 22.19.0` 这样的原文），不写进 engines。
  `pnpm test:export` / `pnpm test:cli-native` 里那几格跟着本机 node 版本记账：当前这支不够新就是「上游/环境账」（export 给 10 ok / 3 记账），
  另指一份够新的进去就转绿（`GDS2JS_NODE_BIN=<node 26> pnpm test:export` → 18 ok / 0 记账）—— 不是代码坏了。
- 包管理：**pnpm 12.8.1**（根 `packageManager` 已钉；PATH 上是旧 pnpm 时用 `npx pnpm@12.8.1 …`）。
- 需要本机 Godot 4.x 作为裁判引擎生成/校验 golden，路径用 `GODOT_BIN` 覆盖（默认 `F:/godot/...`）。

## 仓库结构（pnpm workspace + Turborepo）

```
packages/runtime    @gds2js/runtime   运行时 + host 系（各包 TS 源码都在包内 src/；`--pack scriptc` 的产物树直接铺它）
packages/compiler   @gds2js/compiler  parse / lower / emit / compile（+ home）
packages/gds2js     gds2js            CLI 与发布面：bin、exports、dist/*.mjs|cjs（tsdown 配置在包根）
根                  门脚本（tools/，见「测试」）、corpus/、examples/、bench/、native/、docs/
```

`turbo` 只编排**包级** `build` / `typecheck`；门入口保持 `pnpm test:*` 不变（以仓库根为 cwd）。

## 构建

```bash
pnpm gen:ws     # 用 tree-sitter-cli 生成 gdscript.wasm（语法）
pnpm build      # turbo run build：产出 packages/gds2js/dist/cli.mjs + runtime.mjs + host.mjs + standalone.cjs + product.mjs（自包含运行时包）
```

发布（形态 A：只发 `gds2js.exe`，scriptc 由用户自备——同目录 `scriptc/`、项目里 `npm i -D scriptc`、或 `SCRIPTC_BIN`）：

```bash
pnpm release    # 版本一致性校验 → pnpm build → 原生 CLI 等价性门 → release/gds2js-<version>-win64.exe（+ .sha256）
```

版本戳：`gds2js --version`（版本字面量在 `packages/gds2js/src/version.ts`，与四处 `package.json` 必须一字一致，`pnpm release` 会校验；原生 exe 里版本是静态编入的）。

## CLI

```bash
gds2js check          <file.gd>     # 解析/lowering/语义静态检查
gds2js build          <file.gd>     # 编译单文件 → 可运行的 .mts
gds2js check-project  <entry.gd>    # 跨文件静态检查（class_name 全局作用域）
gds2js build-project  <entry.gd>    # 跨文件编译整个工程（class_name / extends / is / preload）
gds2js run            <file.gd>     # 编译并直接执行（脚本的 print 就是命令输出）
gds2js run-project    <entry.gd>    # 同上，整个工程编到临时目录后跑入口
gds2js export         <entry.gd>    # 打成 Node 独立可执行文件（SEA）
```

常用选项：`-o/--out`、`-w/--watch`、`--sourcemap`、`--runtime <spec>`、`--host <spec>` / `--no-host`、`--runtime-mode`；`export` 另有 `--pack` / `--node` / `--keep-bundle` / `-v,--verbose`；顶层 `-V/--version` 打出出货版本。

### `run` 的启动延迟：怎么调最划算

同一台机器、同一个示例脚本，`run` 端到端**交替配对 8 轮**的实测（`pnpm latency`，奇数轮反序消位置偏置；括号里是对最快的原生 exe 的配对差与 |t|）：

| 调用方式 | 中位 | 对原生 exe |
| --- | --- | --- |
| `tmp/cli-native/gds2js.exe run <f.gd>` | ~255 ms | 基线 |
| `node packages/gds2js/dist/cli.mjs run <f.gd>` | ~305 ms | +52 ms（\|t\|=6.5） |
| `node --import tsx packages/gds2js/src/cli.ts run <f.gd>` | ~710 ms | +453 ms（\|t\|=16.1） |
| `pnpm exec gds2js run <f.gd>` | ~1005 ms | +770 ms（\|t\|=33.5） |
| Godot 4.6.3 `--headless --script` | ~1660 ms | +1407 ms（\|t\|=27.5） |

所以嫌慢先换调用姿势：**用原生 `gds2js.exe`，其次 `node packages/gds2js/dist/cli.mjs`**；别用 `pnpm exec` / `npx`（光包装器就 +770 ms），也别用 `tsx` 跑源码（那是仓库内跑门的路径）。整体上我们比 Godot 的冷启动快 **6.5 倍**。`NODE_COMPILE_CACHE` 实测量不出收益（|t|=0.13），不必设。

改文件反复试的小循环用 `gds2js run <f.gd> --watch`：进程不退出，runtime 只装载一次，实测「改文件 → 看到程序的新输出」约 **290 ms**，其中 250 ms 轮询 + 80 ms 去抖是设计上限（`fs.watch` 在静态目标没有 lowering，所以走摘要轮询），编译与执行只占剩下的几十毫秒以内。

大工程的 `check-project` / `build-project` 走 **IR 缓存**（按源码内容 + 编译器内容戳寻址，落在系统临时目录，不进工程目录；改编译器立刻整体失效）。600 模块实测 `check-project` 快 **17%**（|t|=10.7）。`run-project` 不吃这个收益——它的三秒里约三分之二花在 Node 逐份装载产物上（601 份 `.mts` 888 ms vs 打成单文件 95 ms）。**工程 ≥ 100 个模块时 `run-project` 改为先打成单文件产物再装载**（600 模块实测 3473 → 2464 ms（−27.8%），两轮配对 12/12 轮都更快，输出逐字一样；阈值是量出来的：50 模块上打包还亏 170 ms）。开关 `GDS2JS_RUN_BUNDLE=0`；原生 exe 里没带打包器，那支照旧逐文件——`test:cli-native` 的 ⑨c 格要求「打包 / 不打包 / exe」三方输出逐字相等。缓存这边的开关是 `GDS2JS_IR_CACHE=0`（绕过）与 `GDS2JS_IR_CACHE_DIR`（指目录）；静态出货 exe 里缓存默认透传，因为岛上没有 `node:crypto`。

## 产物的运行时打包模式（`--runtime-mode`）

编译产物默认 `import "gds2js/runtime"` / `"gds2js/host"`。三种模式决定产物运行时**如何拿到 gds2js 运行时**：

| 模式             | 产物怎么拿运行时                                                  | 需要 node_modules？   | `build` | `build-project`   |
| ---------------- | ----------------------------------------------------------------- | --------------------- | ------- | ----------------- |
| `import`（默认） | `import "gds2js/runtime"`，靠包解析                               | 需要（已安装 gds2js） | ✓       | ✓                 |
| `local`          | 旁挂一份自包含 `gds2js-standalone.cjs`，产物 `createRequire` 载入 | 不需要                | ✓       | ✓                 |
| `single`         | 把运行时**内联进产物文件**，零 import                             | 不需要                | ✓       | ✓（整app bundle） |

```bash
gds2js build x.gd --runtime-mode single -o x.mts            # 单文件自包含
gds2js build-project main.gd --runtime-mode single -o dist   # 全工程 bundle 成一个 .mjs
gds2js build-project main.gd --runtime-mode local            # 整个工程 + 一份旁挂 standalone
```

## 打成 Windows 独立可执行文件（`gds2js export`）

只有 **Windows** 产物（Linux 暂不纳入）。**默认且首选 `--pack scriptc`**（静态编 runtime 的 TS 源码图，产物里不带 node）；
`--pack node` 是**出路那一支** —— 机器上没有 scriptc、或想用 Node 自带的那份 zlib/zstd 时才走它（scriptc 那支的压缩接线见下表）。

```bash
pnpm build                                                       # export 吃 packages/gds2js/dist/product.mjs（打平的自带运行时），要先有 dist
gds2js export main.gd -o app.exe                                 # 默认即 --pack scriptc：静态编 runtime 源码图，产物 1.6 MB、不带 node
gds2js export 单文件.gd -o app.exe                               # 不在工程里的散装脚本也照样打（与 build/run 同一条边界）
gds2js export main.gd -o app.exe --pack node                     # 出路：官方 SEA，要 Node>=25.7，产物里带 node
gds2js export main.gd -o app.exe --node E:/node/26.7.0/node.exe  # CLI 跑在旧 node 上：让 SEA 用够新的那个
./app.exe
```



前置（四样都要）：

| 前置                                                              | 干什么用                                                                              | 怎么给                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `pnpm build`                                                      | `packages/gds2js/dist/*.{mjs,cjs}` 会被**嵌进 exe**（自带家目录），没 dist 就嵌不到东西 | 跑一次即可 |
| [libtree-sitter](https://github.com/tree-sitter/tree-sitter) 源码 | 原生解析器（`lib/src/lib.c` + `lib/include`）                                         | 克隆到 `tmp/libtree-sitter`，或 `TS_SRC=<目录>` 指过去    |
| `tree-sitter-gdscript/`                                           | GDScript 语法（`src/parser.c` + `src/scanner.c`）；带自己的 `.git`，**不入库**        | 仓库根下克隆一份                                          |
| `zig` + `scriptc`                                                 | 编 C（必须 `zig cc -target x86_64-windows-gnu`，与 scriptc 的链接同一套工具链）+ 出货 | `ZIG_CC` / `SCRIPTC_BIN` 可指路                           |

```bash
node tools/cli-native.mjs                  # 出货：岛（--dynamic）是必需的 → tmp/cli-native/gds2js.exe（约 5 MB）
node tools/cli-native.mjs --ts-only --keep # 只改了 TS：沿用上一轮的 .o，省 2 分钟
node tools/cli-native.mjs --coverage       # 只要围栏清单（带 file:line）
pnpm test:cli-native                       # 门：原生 exe 与 node 侧 CLI 逐字节/逐字对齐（--quick 跳慢格）
```



## 运行产物

产物带可擦除的 TypeScript 标注（`: Promise<void>` 等），文件名后缀是 **`.mts`**，用 Node 原生类型擦除直接跑：

```bash
node packages/gds2js/dist/cli.mjs build x.gd --runtime-mode single -o build/x.mts
node build/x.mts          # Node >= 22.18（类型剥离默认开启，与 engines 同一条）
```

- 默认会在产物末尾发 `await new Main().run()`（入口即跑生命周期）。
- 产物要被别的模块 `import`（当库用、别自动跑）时加 **`--no-run`**。

## 测试

```bash
pnpm test:diff       # Godot(裁判) vs 编译产物(被测)，逐字节 + 静默错误分桶（主链路，import 模式）
pnpm test:golden     # 生成/校验 Godot golden（--check 只报漂移不写盘）
pnpm test:treeface   # tree-face 对账：清单 ↔ 盘面 ↔ 三处消费者（改产物树/HOME 布局先跑它）
pnpm test:compile    # 语料 → main.gen.mts（import 模式产物，0 churn 即无回归）
pnpm test:ir / test:sema / test:ops
pnpm test:cli-native # 原生 CLI 等价性：不带 node 的 gds2js.exe 与 node 侧逐字节/逐字对齐（要 zig + libtree-sitter + scriptc）
pnpm test:pkgmodes   # local/single 两模式的回归：逐用例 node 跑对齐 golden + 子目录 local + single sourcemap 解码
pnpm test:export     # export 的回归：node(SEA+VFS) / scriptc 两支各真打一个 exe（stdout 逐字节 + 抛错须非 0 退出 + 门禁该响的响 + 中间件清干净）；要先前 pnpm build
pnpm test:scriptc    # scriptc 产物的语义门：真编 exe 真跑，逐字节对 Godot golden（默认跑代表集；--all 全量、--project 只跑 9 个项目树用例、--jobs=N 控并发）
pnpm regen:case-table # 再生成 runtime 的 case-table.ts（探头 000-probe-cs-* 现搭现弃不入库；只改表请走它）
pnpm bench           # D2 性能内核基准（gds2js 编译产物跑在 node 上；每 kernel 连跑 3 轮取最小，GDS2JS_BENCH_ROUNDS 可调）
pnpm bench:ab        # 交替配对 A/B：pnpm bench:ab --rounds=6 <仓内文件>=<候选文件>，报配对差 ±SE 与 |t|（|t|<2 就是量不出来）
pnpm bench:scriptc   # 同一张 kernel 表编成 scriptc 原生 exe 量每次调用（要 zig + scriptc；小格子受基线噪声限制，见 ROADMAP §1.19）
pnpm latency         # CLI 端到端延迟门：交替配对量各条调用路径的 run 延迟（同上，|t|<2 不算数）
pnpm bench:godot     # 同一批 kernel 在本地 Godot 里跑一遍，并与 pnpm bench 的结果并排算倍率
```
