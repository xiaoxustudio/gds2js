import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { zstdDecompressSync } from "node:zlib";

const LIB = "perry_runtime.lib";

export function perryRuntimeDir(perryBinPath: string): string | null {
  try {
    const pkgDir = dirname(dirname(perryBinPath));
    const zst = join(pkgDir, "lib", `${LIB}.zst`);
    if (!existsSync(zst)) return null;
    const dir = join(tmpdir(), `gds2js-perry-rt-${statSync(zst).size}`);
    const lib = join(dir, LIB);
    if (!existsSync(lib)) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${lib}.tmp`, zstdDecompressSync(readFileSync(zst)));
      try {
        renameSync(`${lib}.tmp`, lib);
      } catch {
        if (!existsSync(lib)) return null;
      }
    }
    return existsSync(lib) ? dir : null;
  } catch {
    return null;
  }
}
