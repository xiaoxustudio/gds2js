/** `export` 两支 pack 共用的形状与小件（拆在这里是为了让 exec 与 ts-tree 两个模块互不引用）。 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

/** `export` 铺出来的中间模块树：两支 pack、单文件与工程都归到这一个形状上。 */
export type ExportTree = { entry: string; files: string[]; dirs: string[]; /** scriptc 真出货：产物里铺了 zstd 驱动（岛），build 时要加 `--dynamic`。 */ dynamic?: boolean };

/** 空的目录清单：刻意用声明过的 `string[]` 常量，而不是裸 `[]` 字面量 —— 静态目标上裸空数组推断成 `number[]`，塞进 `dirs: string[]` 那一格时运行期被联合检查拒。 */
export const NO_DIRS: string[] = [];

export function walkMjs(dir: string): string[] {
  const out: string[] = [];
  const stack = [""];
  while (stack.length > 0) {
    const rel = stack.pop() as string;
    for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
      const p = rel === "" ? e.name : `${rel}/${e.name}`;
      if (e.isDirectory()) stack.push(p);
      else if (/\.m(ts|js)$/.test(e.name)) out.push(p);
    }
  }
  return out.sort();
}

export type ExportVerdict = "refused" | "no-lib" | "crash" | "failed";
export function exportVerdict(v: ExportVerdict, note: string): void {
  console.error(`gds2js-export[${v}] ${note}`);
}
