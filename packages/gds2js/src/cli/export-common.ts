import { readdirSync } from "node:fs";
import { join } from "node:path";

export type ExportTree = { entry: string; files: string[]; dirs: string[]; dynamic?: boolean };

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
