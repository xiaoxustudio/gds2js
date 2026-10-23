# gds2js

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。管线：tree-sitter CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`）。

## 构建

```bash
pnpm gen:ws     # 用 tree-sitter-cli 生成 gdscript.wasm（语法）
pnpm build      # turbo run build：产出 packages/gds2js/dist/cli.mjs + runtime.mjs + host.mjs + standalone.cjs + product.mjs（自包含运行时包）
```

发布（构建 cli `gds2js.exe`，scriptc 由用户自备——同目录 `scriptc/`、项目里 `npm i -D scriptc`、或 `SCRIPTC_BIN`）：

```bash
pnpm release    # 版本一致性校验 → pnpm build → 原生 CLI 等价性门 → release/gds2js-<version>-win64.exe（+ .sha256）
```

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

## Why？

> 为什么选 `js` 作为目标 `AOT` 语言？
- js 的语法很松散，你可以直接写在一行，也可以换行，不像C++ 那样严格，也不像Python那样需要计算缩进。
- js 可以直接跑在浏览器上，众所周知浏览器跨平台是天生的，这提供了很多优势。
- 目前 `js` 已经有工具支持编译为原生二进制IR和程序
- `nodejs`是目前最符合我们项目定位的对标项目，它帮助`js`帮其脱离浏览器环境，我们则帮`gdscript`脱离`godot`，使得`gds`开发者能够使用gds去开发各自应用脚本，减少为了游戏而去学习其他语言的困难。
- 我后续也不会考虑接入godot引擎，因为项目的初衷就是脱离godot来运行`gdscript`语言

## 测试

测试跑在 **Vitest** 上（根 `vitest.config.ts`，四个 project），分两层。
**快层**零外部依赖、零 build，秒级；**E2E 层**串行跑，缺外部工具时自动 skip 并说出缺什么。
测试文件一律放在 `packages/<pkg>/test/` 或根 `test/`，**绝不放进 `packages/*/src/`** ——
`export --pack scriptc` 的 `copyTreeTs` 会把 `packages/runtime/src/` 下每个 `.ts` 扫进出货产物树。

```bash
# ── 快层：零外部依赖、零 build（实测 ~5s）─────────────────────────────
pnpm test              # testkit + runtime + compiler + repo 四个 project 全跑
pnpm test:unit         # 只 runtime + compiler
pnpm test:ops          # runtime 单测：原 tools/ops-check.ts，1509 条断言拆成 23 个文件
pnpm test:ir           # 语料 229 例 parse+lower 不抛
pnpm test:sema         # 语义分析：恰好在 Godot 报 Parse Error 的那些用例上拒答
pnpm test:guards       # 发射期守卫的 33 格 cell table（原内嵌在 test:compile 里）
pnpm test:treeface     # tree-face 对账：清单 ↔ 盘面 ↔ 三处消费者（改产物树/HOME 布局先跑它）
                       # 另：packages/compiler/test/emit-invariants.test.ts 随 pnpm test 跑，
                       #    验「产物文本口径 === IR usesPackCodec 标志」与「autoRun 尾巴必须自兜底」
                       #    两条互锁不变量（原先内嵌在 test:compile 里，只有记得跑才生效）

# ── E2E 层：串行、缺料自动 skip（分钟级）──────────────────────────────
pnpm test:e2e          # 六支全跑
pnpm test:diff         # Godot golden vs 编译产物，逐字节 + 分桶看板（要 main.gen.mts，即先跑 test:compile）
pnpm test:golden-check # 拿真 Godot 重跑 238 例查 golden 漂移（要 GODOT_BIN；只读不写盘）
pnpm test:codegen      # 查生成源码漂移：case-table.ts / case-flags.ts 是否等于重跑 regen 该产出的
                       #   （探头用例 gitignored，没跑过 regen:* 的机器上整支 skip；比对前归一行尾，
                       #    因为 autocrlf=true 的机器上 git checkout 会把工作树变成 CRLF）
pnpm test:pkgmodes     # single/local 两模式逐用例对齐 golden + 子目录 local + single sourcemap 解码（要 pnpm build）
pnpm test:scriptc      # scriptc 真编 exe 真跑、逐字节对 Godot golden（要 scriptc）
pnpm test:export       # export 的 node(SEA) / scriptc 两支各真打一个 exe（要 Windows + pnpm build；SEA 那几格另要 Node ≥ 25.7）
pnpm test:cli-native   # 原生 gds2js.exe 与 node 侧 CLI 逐字节/逐字等价（要 zig + scriptc + libtree-sitter + pnpm build）

pnpm test:all          # 两层全跑
```

单例重跑靠 Vitest 的 `-t`（用例 id 就在测试名里），例如
`pnpm exec vitest run --project compiler -t 088-vector2-write-error`。

### E2E 层的开关（旧命令行参数改成环境变量）

```bash
GDS2JS_SCRIPTC_ALL=1        # scriptc 全量（≈150 例），并发 4
GDS2JS_SCRIPTC_PROJECT=1    # scriptc 只跑 9 个项目树用例
GDS2JS_SCRIPTC_FILTER=064   # scriptc 按 case-id 子串挑（跑全部匹配，不只代表集）
GDS2JS_SCRIPTC_KEEP=1       # scriptc 收尾不删替身树
GDS2JS_CLI_NATIVE_QUICK=1   # cli-native 跳过 ④⑥ 两格 scriptc/SEA 出货
GDS2JS_CLI_NATIVE_REBUILD=1 # 强制重编原生 exe
GDS2JS_CLI_NATIVE_NO_REBUILD=1  # exe 过期时拒绝验旧货、直接红
GDS2JS_SEMA_VERBOSE=1       # sema 逐例打印诊断码
GODOT_BIN / TS_SRC / ZIG_CC / SCRIPTC_BIN / GDS2JS_NODE_BIN   # 外部工具落点（同旧版）
```

## 关于

作者：[徐然](https://github.com/xiaoxustudio)  

联系方式：[xiaoxustudio@foxmail.com](mailto:xiaoxustudio@foxmail.com)

欢迎提出您宝贵的 **issue**，我们将会处理。

## LICENSE

详情请参阅 [许可协议](LICENSE)