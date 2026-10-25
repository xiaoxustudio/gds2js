import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		cli: "src/cli.ts",
		runtime: "../runtime/src/runtime/index.ts",
		// `gds2js/host` 是 **node 宿主**：除了 print / SceneTree，还给 runtime 的三个 zlib 槽注册编解码器
		// （runtime 自己不能去找 node:zlib —— 那串 `globalThis.process` 的取法是「把 unknown cast 成函数表」，
		// 静态编译目标不可编）。`../runtime/src/host.ts` 是**静态宿主**那一支，`--pack scriptc` 把它的
		// 源码铺进产物目录，里面一格 node 查找都没有。
		host: "../runtime/src/host-node.ts",
	},
	target: "node25",
	dts: true,
	// dts 生成要看整棵入口图：条目散在 packages/*，统一用根 tsconfig 当程序面。
	tsconfig: "../../tsconfig.json",
	// exports/bin 在 package.json 里手工维护，不交给生成器
	exports: false,
	// CLI 里 build-project --runtime-mode single 会动态 import("tsdown") 借 rolldown 打整app bundle。
	// tsdown/rolldown 是 devDependency（非 dependencies），默认会被打进 cli.mjs 却带不上 rolldown 的
	// 原生 .node 绑定 → 运行期 "Cannot find native binding"。显式 external，让它留在 node_modules 解析。
	deps: {
		neverBundle: [/^tsdown/, /^rolldown/],
		alwaysBundle: [/^@gds2js\//],
	},
});
