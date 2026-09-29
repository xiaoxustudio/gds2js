# gds2js

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。管线：tree-sitter CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。

## 环境

- Node **>= 25**（`package.json` engines）。
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

> `check-project` / `build-project` / `run-project` 是**工程级**命令：它们把 resRoot 下的 `.gd` **递归全收**进同一次编译，`res://` 按那个根解析。所以入口所在目录得是真正的工程根（有 `project.godot`）。若向上找不到、而该目录下又嵌着别的工程，命令会在编译**前**点名那个嵌套工程并给出出路（改指它的脚本 / `--res-root` / 单文件请用 `build`·`run`）；显式给了 `--res-root` 就按你说的办，不插手。
>
> `export` **两边都管**：入口确实在某个工程里（或你给了 `--res-root`）就整工程打 exe；否则退化成**单文件**，边界与 `build` / `run` 一致（不解析 `res://`、不收兄弟脚本）。所以散装脚本也能直接 `gds2js export 单文件.gd -o app.exe --pack perry`。

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
pnpm build                                                       # export 吃 dist/product.mjs（打平的自带运行时），要先有 dist
gds2js export main.gd -o app.exe                                 # 默认 --pack node（官方 SEA，要 Node>=25.7）
gds2js export main.gd -o app.exe --node E:/node/26.7.0/node.exe  # CLI 跑在旧 node 上：让 SEA 用够新的那个
gds2js export 单文件.gd -o app.exe --pack perry                    # 不在工程里的散装脚本也照样打（与 build/run 同一条边界）
gds2js export main.gd -o app.exe --pack perry                    # 换 perry（原生编译，产物不带 Node）
./app.exe
```

| `--pack` | 走法 | 本机实测 |
| --- | --- | --- |
| `node`（默认） | 编译成**模块树** → `sea-config.json`（`mainFormat: "module"` + `useVfs` + 全部模块作 assets）→ `<node> --build-sea=cfg` | **通**：产物 ~100 MB，跑 `examples/multi` 输出**逐字节一致**、stderr 干净；运行期抛错的工程**退 1 且报错可见**。不经过 bundler |
| `perry` | `perry compile <入口.mts> -o <exe>`（SWC + LLVM，同一棵模块树，perry 自己顺相对 import 收集） | **通**。产物 17~22 MB，`examples/multi` 输出与 node 那份逐字节相同；语料代表集 26 例（int64/float32/正则/容器/跨文件类/await + 静态与运行期两类报错用例）见 `pnpm test:perry` |

- **两支都不在导出时跑 bundler**，输入都是「编译出的模块树 + 一份零 import 的 `dist/product.mjs`」：
  - `useVfs` 是关键（实测）：不开时 SEA 内嵌 main 的 `.mts` **不做类型擦除**（`SyntaxError: Unexpected token ':'`），且外部 ESM `import()` 一律 `ERR_UNKNOWN_BUILTIN_MODULE`；开了之后相对 import 在虚拟文件系统里正常解析、`.mts` 标注照样擦掉 —— 产物就是一整棵模块树入包，不需要先打成零 import 的单文件。
  - perry 自己会做模块收集（实测 `Found 2 module(s): 2 native`）。
  - 运行时**必须打平成单文件**：给它喂 dist 那套「`runtime.mjs` + 3 个内容哈希 chunk」时，perry 能出货但跑起来 `rt.V` 是 `undefined`（跨 chunk 的别名重导出丢了绑定）。打平后逐字节对得上 golden，顺带让语料单例从 2m38s 掉到 ~10s（运行时那份进了 perry 的模块缓存）。
- **`--pack node` 要 Node ≥ 25.7**：SEA 的一步式 `--build-sea` 从这版起才有（实测 25.21 没这个 flag，且那边的 SEA **静默忽略 `mainFormat`** —— 带顶层 await 的产物会加载失败）。够新的 node 用 `--node <path>` / `GDS2JS_NODE_BIN` 指定，否则取当前 node；版本不够（或压根没有 node）时 CLI 响亮拒绝并**把你该重跑的那条命令印出来**。
- 外部二进制定位：`PERRY_BIN` 优先 → 自包含 exe 内嵌那份 → **本地 node_modules** 的 `@perryts/perry-win32-x64/bin/perry.exe`（它是分平台的 npm 包；实测装在 PATH 别处没用，官方那个 shim 只在自己的 node_modules 树里翻）→ PATH 上的 `perry`。
- **`--pack perry` 默认传 `PERRY_RS4GC=0`，并且会说出来**：perry 自己的默认那支（RS4GC）在 Windows 上拒绝任何含 `try/catch` 的模块 —— 它自己说 LLVM 的 `rewrite-statepoints-for-gc` 不支持 MSVC funclet EH，"会访问违例而不是报错"（上游 #7354）。我们的运行时浑身是 try/catch，实测不加处理就是 `0xC0000005` 崩，而且是**白烧 6~7 分钟 codegen 之后**才崩、崩了不给任何原因文字。那一档对我们永远出不了货，所以不再要求你每次显式选：

  ```bash
  gds2js export main.gd -o app.exe --pack perry     # CLI 注入 PERRY_RS4GC=0，并在日志里写明这是它给的默认
  ```

  依据是 `pnpm test:perry` 逐字节对过 Godot golden（代表集 26 例，钉住了 `PERRY_RS4GC=0` 这一档）。**你显式设过就照你的值原样传**（含 `PERRY_RS4GC=1`，那会看到 perry 的原始行为）：日志会写明这次用的是「本 CLI 的默认」还是「你显式设的」。
- **perry 的运行时库不用你操心**：`@perryts/perry-win32-x64` 其实**带了** `lib/perry_runtime.lib.zst`（7.7 MB），但 perry 不会自己解 zst —— 没有 `PERRY_RUNTIME_DIR` 时它一律报 "Could not find perry_runtime.lib"，看起来就像"npm 包没带运行时"（我们被骗过一轮）。CLI 现在首次用到时解压到临时目录并指过去，实测 hello 出 5.7 MB、我们的产物出 20.5 MB。要自己指就用 `PERRY_RUNTIME_DIR`。
- **perry.exe 旁边必须有 `LLVM-C.dll`**（实测：缺它连 `--version` 都是 `0xC0000135`；`LTO.dll`/`libclang.dll` 等都不需要）。好消息是 perry 把 LLVM 吃进进程、也自己找 MSVC 的 `link.exe` —— 实测把 PATH 削到只剩 `System32` 照样出货，所以**装 perry 的那台机器不需要装 LLVM**。
- **scriptc 已按实测移除**（`--pack scriptc` 会被取值闸门直接拒掉）：它硬缺三样 —— `Math.fround` 无 lowering（float32 语义）、`bigint` 完全不能编（int64 家族）、**覆写 async 基类方法不支持**（那正是 `class Main extends SceneTree { async _initialize() }` 这个宿主契约本身）；真产物 `scriptc coverage` 实测静态 69%、`--dynamic` 下仍剩 129 处「执行到就抛围栏」，且它明说装箱 class 实例不许跨越静态↔动态边界。细节记在 ROADMAP 5.8，将来上游补齐再谈接回。
- 中间件默认清干净（`<res-root>/.gds2js-export/`；单文件入口则摆在脚本旁边 `<dir>/.gds2js-export/`，都已进 `.gitignore`），`--keep-bundle` 才留；失败时会把中间件目录印出来方便你直接拿它重试外部编译器。
- **`--pack perry` 的 `-o` 路径必须是 ASCII**（实测）：路径里有中文时 perry 要么报 `Linking failed`，要么把一个**乱码文件名**的 exe 写到同目录（`我的程序.exe` → `鎴戠殑绋嬪簭.exe`），而且**退出码可能是 0**。CLI 认这个形状并直接说清原因与出路；`.gd` 与工程目录里带中文不受影响。
- 回归：`pnpm test:export` 把每格分类成 `ok / refused / no-lib / crash / FAIL`，**只有 FAIL 红灯**（上游状态不该把本地套件打挂）。`pnpm test:perry` 是**语义门**：真打 exe、真跑、逐字节对 Godot golden；没设 `PERRY_RS4GC` 时验的就是 CLI 的默认那条路，显式设过就照你的值验（这一条门量的是「哪一种 GC 下产物与 golden 逐字节一致」）。默认跑风险面代表集 26 例，`--all` 是全量，位置参数按名字筛（`node tools/perry-check.ts 077`）。计时看冷热：运行时那份进了 perry 的模块缓存后单例 ~3–10 s，冷启动第一例会到 2 min 量级。

## 把 CLI 自己打成 exe（`pnpm build:self`）

产出一个 Windows `.exe`（Node SEA），要求**装它的那台机器上没有 gds2js、也没有 perry**，但 `export` 两支照样能用。

这条**是仓库的构建工具**（`tools/self-pack.ts`），不是 CLI 的子命令：分发的 exe 不该背着「再打一个 exe」的能力，它只需要背着「打用户的 exe」要用的真文件。要 Node ≥ 25.7 的是**打这个包的机器**，不是目标机器。

```bash
pnpm build && pnpm build:self                       # 默认写到 <仓库根>/gds2js.exe
pnpm build:self -o gds2js.exe --node "<Node>=25.7/node.exe"   # 构建机上的 node 不够新时指一份够新的
gds2js.exe export main.gd -o app.exe --pack perry             # perry 是打进 exe 的那一支
gds2js.exe export main.gd -o app.exe --pack perry
gds2js.exe export main.gd -o app.exe --pack node              # 用**外部** node 做 --build-sea
```

打进去的「家」（首次运行时解到 `%TEMP%\gds2js-home-<node版本>-<资产指纹>\`，之后按指纹复用）：

| 进包 | 为什么 |
| --- | --- |
| `gdscript.wasm` + `node_modules/web-tree-sitter/web-tree-sitter.wasm` | 解析器按真实文件读 wasm；后者被内联进 CLI bundle 后按 `import.meta.url` 找自己（在 exe 里就是 exe 同目录，必输） |
| `dist/product.mjs` + `dist/standalone.cjs` | export 两支吃的打平运行时，以及 local/single 那两条旁挂/内联路 |
| `perry/bin/perry.exe` + `perry/bin/LLVM-C.dll` + `perry/lib/perry_runtime.lib.zst` | 内嵌 perry，目标机器不用装 perry/LLVM（照 npm 包的 `bin/`+`lib/` 形状铺，DLL 与 zst 的定位逻辑因此不用写第二套） |

home 里**没有 bundler**（实测 exe 里跑 rolldown 站不住：内联代码的懒 require 找不到包）—— export 两支都不需要它；因此 exe 里 `build-project --runtime-mode single` 会**响亮拒绝**并给出路（用 npm 安装态，或直接用 `export`）。

**不进包的是 node**（实测 SEA exe 不吃 node 旗标，为 `--build-sea` 内嵌一份要付 34 MB 压缩资产）：`--pack node` 在 exe 里从 `--node` / `GDS2JS_NODE_BIN` / PATH 找一份够新的 node，找不到就响亮拒绝并给出三条出路。

- 实测体积：产物约 **148.5 MB**（SEA 底座是 node 本体 + 7 份资产；资产全部 deflate-9 入包 —— perry.exe 34.1→14.1、LLVM-C.dll 68.6→25.2、运行时 zst 7.7→7.6 MB）。
- 为什么 exe 里不跑 bundler：CLI bundle 把 tsdown/rolldown 内联后，它们内部那些静态分析抓不到的懒 `require`（`picomatch` / `oxc-resolver` / `@rolldown/binding-*`）在 SEA 里发出方成了 exe 自己，实测 `Cannot find module 'picomatch'`；把包铺进 home 再兜一层解析，反而演变成「拿 picomatch 的源码当文件名去 open」这种更玄的错（`Module.globalPaths.push` 在 SEA 里也实测无效）。所以 export 两支都改成不需要 bundler。
- 已知限制：exe 里 `run` / `run-project` 不能用 —— 它们靠**进程内** `await import(产物)`，而 SEA 里对外部文件的 ESM `import()` 一律 `ERR_UNKNOWN_BUILTIN_MODULE`（实测）。请用 npm 安装态，或 `export` 出 exe 再跑。


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
pnpm test:export     # export 的回归：node(SEA+VFS) / perry 两支各真打一个 exe（stdout 逐字节 + 抛错须非 0 退出 + 门禁该响的响 + 中间件清干净）；要先前 pnpm build
pnpm test:perry      # perry 产物的语义门：真打 exe 真跑，逐字节对 Godot golden（默认验 CLI 的 GC 默认；显式 PERRY_RS4GC=… 就照你的值验）
pnpm bench           # D2 性能内核基准
```

> `test:diff` 只覆盖 import 模式产物；`local` / `single` 由 `test:pkgmodes` 补齐（它逐用例用真 node 跑产物比对 golden）。
