/** `vendor/gds2js-zstd`(岛侧运行)的口。宿主(`src/host-scriptc.ts`)按它接线;打包时随树铺到 `node_modules/`。 */
declare module "gds2js-zstd" {
  export function ready(): boolean;
  export function initError(): string;
  export function compress(b: Uint8Array): any;
  export function decompress(b: Uint8Array): any;
}
