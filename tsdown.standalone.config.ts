import { defineConfig } from "tsdown";

/**
 * 自包含"运行时 + 宿主"单文件包，给产物的 local / single 模式用。
 * CJS 单文件（format cjs + noExternal 内联），产物 dist/standalone.cjs 只依赖 node 内建。
 * emitter 在 single 模式把它当 `const exports={}` 包进 IIFE、在 local 模式用 createRequire 载入，
 * 都从上面拿 { rt, print, SceneTree }。
 */
export default defineConfig({
	entry: { standalone: "src/standalone.ts" },
	format: "cjs",
	target: "node22",
	platform: "node",
	outDir: "dist",
	clean: false,
	dts: false,
	minify: false,
	deps: {
		alwaysBundle: [/.*/],
	},
});
