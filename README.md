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
```

常用选项：`-o/--out`、`-w/--watch`、`--sourcemap`、`--runtime <spec>`、`--host <spec>` / `--no-host`、`--runtime-mode`。

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
pnpm bench           # D2 性能内核基准
```

> `test:diff` 只覆盖 import 模式产物；`local` / `single` 由 `test:pkgmodes` 补齐（它逐用例用真 node 跑产物比对 golden）。
