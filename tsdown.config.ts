import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    runtime: 'src/runtime/index.ts',
    host: 'src/host.ts',
  },
  dts: true,
  // exports/bin 在 package.json 里手工维护，不交给生成器
  exports: false,
})
