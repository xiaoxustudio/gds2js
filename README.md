# gds2js

> 为什么选 `js` 作为目标 `AOT` 语言？
> 因为 `js` 的语法很松散，你可以直接写在一行，也可以换行，不像C++ 那样严格，也不像Python那样需要计算缩进。
> js 可以直接跑在浏览器上，众所周知浏览器跨平台是天生的，这提供了很多优势。
> 而且目前 `js` 已经有工具支持编译为原生二进制IR和程序，所以我选择了它

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

常用选项：`-o/--out`、`-w/--watch`、`--sourcemap`、`--runtime <spec>`、`--host <spec>` / `--no-host`、`--runtime-mode`；`export` 另有 `--pack` / `--node` / `--keep-bundle` / `-v,--verbose`。

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

## 打成 Windows 独立可执行文件（`gds2js export`）

只有 **Windows** 产物（Linux 暂不纳入）。两支打包器：

```bash
pnpm build                                                       # export 吃 dist/product.mjs（打平的自带运行时），要先有 dist
gds2js export main.gd -o app.exe                                 # 默认 --pack node（官方 SEA，要 Node>=25.7）
gds2js export main.gd -o app.exe --node E:/node/26.7.0/node.exe  # CLI 跑在旧 node 上：让 SEA 用够新的那个
gds2js export 单文件.gd -o app.exe --pack scriptc                 # 不在工程里的散装脚本也照样打（与 build/run 同一条边界）
gds2js export main.gd -o app.exe --pack scriptc                  # 换 scriptc（静态编 runtime 的 TS 源码图，产物里不带 Node）
./app.exe
```

| `--pack` | 走法 | 本机实测 |
| --- | --- | --- |
| `node`（默认） | 编译成**模块树** → `sea-config.json`（`mainFormat: "module"` + `useVfs` + 全部模块作 assets）→ `<node> --build-sea=cfg` | **通**：产物 ~100 MB，跑 `examples/multi` 输出**逐字节一致**、stderr 干净；运行期抛错的工程**退 1 且报错可见**。不经过 bundler |
| `scriptc` | 产物 + `src/runtime/**`、`src/host.ts` 的 **TS 源码**铺成一棵树（项目树只铺**一份**，每个模块的 import 按自己那一层的深度算，于是只编出一张 runtime 图、一份类身份）→ `scriptc build <入口.mts> -o <exe> --strip`（`SCRIPTC_BIN` 可指路） | **通**：产物 1.5~1.6 MB，`pnpm test:scriptc` 全量 **133 例里 132 逐字节对 Godot golden**（单文件 + 9 个项目树用例走真命令 `export --pack scriptc`）；唯一红的是 `161-pack-compress` —— 静态宿主没有 zlib/zstd，`compress()/decompress()` 的 mode 1/2/3 照口径**响亮拒**（不发近似值），要那一格就用 `--pack node` |


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
pnpm test:export     # export 的回归：node(SEA+VFS) / scriptc 两支各真打一个 exe（stdout 逐字节 + 抛错须非 0 退出 + 门禁该响的响 + 中间件清干净）；要先前 pnpm build
pnpm test:scriptc    # scriptc 产物的语义门：真编 exe 真跑，逐字节对 Godot golden（默认跑代表集；--all 全量、--project 只跑 9 个项目树用例）
pnpm bench           # D2 性能内核基准（gds2js 编译产物跑在 node 上）
pnpm bench:godot     # 同一批 kernel 在本地 Godot 里跑一遍，并与 pnpm bench 的结果并排算倍率
```
