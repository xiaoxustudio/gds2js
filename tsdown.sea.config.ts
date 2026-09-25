import { defineConfig } from "tsdown";

/**
 * SEA 打包用的单文件 CJS 束。与主构建（tsdown.config.ts，多入口 ESM）分开：
 * - Node SEA 只认 CommonJS 主脚本，所以这里 format: "cjs"；
 * - noExternal 把 web-tree-sitter 等全部内联进一个文件（SEA 里没有 node_modules 可解析）；
 * - 产物 sea/dist/gds2js.cjs 交给 tools/build-sea.mjs 生成 blob 并注入到 node.exe 副本。
 */
export default defineConfig({
  entry: { gds2js: "src/cli.ts" },
  format: "cjs",
  target: "node24",
  platform: "node",
  outDir: "sea/dist",
  clean: true,
  dts: false,
  minify: false,
  noExternal: [/.*/],
});
