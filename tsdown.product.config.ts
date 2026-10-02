import { defineConfig } from "tsdown";

/**
 * export 两支共用的「自带运行时」单文件：dist/product.mjs，**零相对 import**。
 *
 * 必须单文件：实测外部原生编译器收「runtime + 3 个内容哈希 chunk」那种跨 chunk 别名重导出会丢绑定
 * （`rt.V` 变 undefined），而打平成 1 个文件后逐字节对得上 golden。node 那一支走 SEA 的 useVfs，
 * 模块树少一个文件就少一份资产，同样是打平更划算。
 *
 * `inlineDynamicImports` 是把多入口的 code-splitting 关掉的那把钥匙（不加就还是切成多个 chunk）。
 */
export default defineConfig({
	entry: { product: "src/product.ts" },
	format: "esm",
	target: "node25",
	platform: "node",
	outDir: "dist",
	clean: false,
	dts: false,
	minify: false,
	deps: {
		alwaysBundle: [/.*/],
	},
	outputOptions: { codeSplitting: true },
});
