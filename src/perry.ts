/**
 * perry 的运行时准备。
 *
 * 实测到的坑：`@perryts/perry-win32-x64` **确实**带了运行时，但是 zstd 压缩的
 * （`lib/perry_runtime.lib.zst`，8 MB），而 perry 自己不解 —— 没有 `PERRY_RUNTIME_DIR` 时
 * 它一律报 "Could not find perry_runtime.lib"，看起来就像"npm 包没带运行时"（我们自己就被
 * 误导过一轮）。解出来（38 MB）并指过去，链接就通了：实测 hello 出 5.7 MB 的可执行文件。
 *
 * 只在第一次用到时解，落到按 zst 大小命名的临时目录（同版本内容必然同字节）。
 * 拿不到就返回 null，让 perry 把自己的原话报出来 —— 不拿猜测盖过它的诊断。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { zstdDecompressSync } from "node:zlib";

const LIB = "perry_runtime.lib";

/** 已经备好 perry_runtime.lib 的目录；拿不到返回 null。 */
export function perryRuntimeDir(perryBinPath: string): string | null {
  try {
    const pkgDir = dirname(dirname(perryBinPath)); // <pkg>/bin/perry.exe → <pkg>
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
        // 并发时另一个进程可能抢先放好了；没有就当真失败
        if (!existsSync(lib)) return null;
      }
    }
    return existsSync(lib) ? dir : null;
  } catch {
    return null;
  }
}
