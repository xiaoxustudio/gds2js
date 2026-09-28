# gds2js

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。管线：tree-sitter CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。

## 环境

- Node **>= 24**（`package.json` engines）。
- 需要本机 Godot 4.x 作为裁判引擎生成/校验 golden，路径用 `GODOT_BIN` 覆盖（默认 `F:/godot/...`）。

## 构建

```bash
pnpm gen:ws     # 用 tree-sitter-cli 生成 gdscript.wasm（语法）
pnpm build      # 产出 dist/cli.mjs + dist/runtime.mjs + dist/host.mjs + dist/standalone.cjs（自包含运行时包）
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

常用选项：`-o/--out`、`-w/--watch`、`--sourcemap`、`--runtime <spec>`、`--host <spec>` / `--no-host`、`--runtime-mode`；`export` 另有 `--pack` / `--node` / `--keep-bundle`。

> `check-project` / `build-project` / `run-project` / `export` 是**工程级**命令：它们把 resRoot 下的 `.gd` **递归全收**进同一次编译，`res://` 按那个根解析。所以入口所在目录得是真正的工程根（有 `project.godot`）。若向上找不到、而该目录下又嵌着别的工程，命令会在编译**前**点名那个嵌套工程并给出出路（改指它的脚本 / `--res-root` / 单文件请用 `build`·`run`）；显式给了 `--res-root` 就按你说的办，不插手。

## 产物的运行时打包模式（`--runtime-mode`）

编译产物默认 `import "gds2js/runtime"` / `"gds2js/host"`。三种模式决定产物运行时**如何拿到 gds2js 运行时**：

| 模式 | 产物怎么拿运行时 | 需要 node_modules？ | `build` | `build-project` |
| --- | --- | --- | --- | --- |
| `import`（默认） | `import "gds2js/runtime"`，靠包解析 | 需要（已安装 gds2js） | ✓ | ✓ |
| `local` | 旁挂一份自包含 `gds2js-standalone.cjs`，产物 `createRequire` 载入 | 不需要 | ✓ | ✓ |
| `single` | 把运行时**内联进产物文件**，零 import | 不需要 | ✓ | ✓（整app bundle） |

```bash
gds2js build x.gd --runtime-mode single -o x.mts            # 单文件自包含
gds2js build-project main.gd --runtime-mode single -o dist   # 全工程 bundle 成一个 .mjs
gds2js build-project main.gd --runtime-mode local            # 整个工程 + 一份旁挂 standalone
```

- `build` 的 single：把 `standalone.cjs` 用 IIFE 内联进产物 `.mts`（快，进程内）。
- `build-project` 的 single：先按 import 模式把各模块编到临时目录（运行时/宿主用 dist 的 `file://` 绝对 URL），再交 **tsdown/rolldown** bundle 成一个**零 import 的 `.mjs`**——作用域提升 / 跨文件类 / 名字冲突都交给真 bundler（自造拼接会静默出错）。产物是纯 JS，`node` 直接跑（不需要类型擦除）。需先 `pnpm build` 出 dist。

## 打成 Windows 独立可执行文件（`gds2js export`）

只有 **Windows** 产物（Linux 暂不纳入）。两支打包器：

```bash
pnpm build                                                       # export 复用 single bundle，要先有 dist
gds2js export main.gd -o app.exe                                 # 默认 --pack node（官方 SEA，要 Node>=25.7）
gds2js export main.gd -o app.exe --node E:/node/26.7.0/node.exe  # CLI 跑在旧 node 上：让 SEA 用够新的那个
gds2js export main.gd -o app.exe --pack perry                    # 换 perry（原生编译，产物不带 Node）
./app.exe
```

| `--pack` | 走法 | 本机实测 |
| --- | --- | --- |
| `node`（默认） | 写 `sea-config.json`（`mainFormat: "module"`）交 `<node> --build-sea=cfg` 一步生成 | **通**：98.7 MB exe，跑 `examples/multi` 输出**逐字节一致**、stderr 干净；运行期抛错的工程**退 1 且报错可见** |
| `perry` | `perry compile <bundle> -o <exe>`（SWC + LLVM） | 语言面吃得下（`perry check` 对整份 163KB 产物全过），但撞两道工程墙：默认 GC 崩、缺 `perry_runtime.lib` 链接不过 |

- **`--pack node` 要 Node ≥ 25.7**：SEA 的一步式 `--build-sea` 从这版起才有（实测 24.21 没这个 flag，且那边的 SEA **静默忽略 `mainFormat`** —— 带顶层 await 的产物会加载失败）。够新的 node 用 `--node <path>` / `GDS2JS_NODE_BIN` 指定，它同时就是产物内嵌的运行时；版本不够时 CLI 响亮拒绝并**把你该重跑的那条命令印出来**（不会把刚失败的那个 node 当建议推给你）。
- 外部二进制定位：`PERRY_BIN` 优先；perry 还会先在**本地 node_modules** 解析 `@perryts/perry-win32-x64/bin/perry.exe`（它是分平台的 npm 包；实测装在 PATH 别处没用，官方那个 shim 只在自己的 node_modules 树里翻）。
- **perry 墙一（GC 模式）**：默认 RS4GC 在 Windows 上拒绝任何含 `try/catch` 的模块 —— 它自己说 LLVM 的 `rewrite-statepoints-for-gc` 不支持 MSVC funclet EH，"会访问违例而不是报错"（上游 #7354）。我们的运行时浑身是 try/catch，实测不加处理就是 `0xC0000005` 崩。`PERRY_RS4GC=0` 能绕过，但那是换 GC 策略：**产物必须跑一遍全量语料逐字节对 golden 才算可信，所以 CLI 不默认打开。**
- **perry 墙二（运行时库）**：`@perryts/perry-win32-x64` 里没带 `perry_runtime.lib`，任何程序（连 hello-world）都在 `Linking (runtime-only)...` 处死。出路要么等上游打进包，要么自己 checkout perry 源码 `cargo build --release -p perry-runtime-static` 后用 `PERRY_WORKSPACE_ROOT` 指过去。
- **scriptc 已按实测移除**（`--pack scriptc` 会被取值闸门直接拒掉）：它硬缺三样 —— `Math.fround` 无 lowering（float32 语义）、`bigint` 完全不能编（int64 家族）、**覆写 async 基类方法不支持**（那正是 `class Main extends SceneTree { async _initialize() }` 这个宿主契约本身）；真产物 `scriptc coverage` 实测静态 69%、`--dynamic` 下仍剩 129 处「执行到就抛围栏」，且它明说装箱 class 实例不许跨越静态↔动态边界。细节记在 ROADMAP 5.8，将来上游补齐再谈接回。
- 中间件默认清干净（`<res-root>/.gds2js-export/`，已进 `.gitignore`），`--keep-bundle` 才留；失败时会把 bundle 路径印出来方便你直接拿它重试外部编译器。
- 回归：`pnpm test:export` 把每格分类成 `ok / refused / no-lib / crash / FAIL`，**只有 FAIL 红灯**（上游状态不该把本地套件打挂）。

## 运行产物

产物带可擦除的 TypeScript 标注（`: Promise<void>` 等），文件名后缀是 **`.mts`**，用 Node 原生类型擦除直接跑：

```bash
node dist/cli.mjs build x.gd --runtime-mode single -o build/x.mts
node build/x.mts          # Node >= 22.6（默认开启 --experimental-strip-types）
```

- 默认会在产物末尾发 `await new Main().run()`（入口即跑生命周期）。
- 产物要被别的模块 `import`（当库用、别自动跑）时加 **`--no-run`**。

## 测试

```bash
pnpm test:diff       # Godot(裁判) vs 编译产物(被测)，逐字节 + 静默错误分桶（主链路，import 模式）
pnpm test:golden     # 生成/校验 Godot golden（--check 只报漂移不写盘）
pnpm test:compile    # 语料 → main.gen.mts（import 模式产物，0 churn 即无回归）
pnpm test:ir / test:sema / test:ops
pnpm test:multi      # 跨文件冒烟（examples/multi）
pnpm test:pkgmodes   # local/single 两模式的回归：逐用例 node 跑对齐 golden + 子目录 local + single sourcemap 解码
pnpm test:export     # export 的回归：tsdown / node-sea 两支各真打一个 exe（stdout 逐字节 + 抛错须非 0 退出 + 中间件清干净）；要先前 pnpm build
pnpm bench           # D2 性能内核基准
```

> `test:diff` 只覆盖 import 模式产物；`local` / `single` 由 `test:pkgmodes` 补齐（它逐用例用真 node 跑产物比对 golden）。
