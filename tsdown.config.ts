import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		cli: "src/cli.ts",
		runtime: "src/runtime/index.ts",
		host: "src/host.ts",
	},
	dts: true,
	// exports/bin 在 package.json 里手工维护，不交给生成器
	exports: false,
	// CLI 里 build-project --runtime-mode single 会动态 import("tsdown") 借 rolldown 打整app bundle。
	// tsdown/rolldown 是 devDependency（非 dependencies），默认会被打进 cli.mjs 却带不上 rolldown 的
	// 原生 .node 绑定 → 运行期 "Cannot find native binding"。显式 external，让它留在 node_modules 解析。
	external: [/^tsdown/, /^rolldown/],
});
