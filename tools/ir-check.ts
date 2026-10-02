import { readFileSync } from "node:fs";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { caseScript, listSingleCases } from "./lib.mjs";

const cases = listSingleCases();
let ok = 0;
const failures: Array<{ id: string; code: string; msg: string }> = [];
const byCode = new Map<string, number>();

for (const id of cases) {
  const src = readFileSync(caseScript(id), "utf8");
  try {
    const tree = await parseSource(src);
    lower(tree);
    ok++;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = e instanceof UnsupportedError ? e.code : "CRASH";
    failures.push({ id, code, msg });
    byCode.set(code, (byCode.get(code) ?? 0) + 1);
  }
}

console.log(`Lowering 成功 ${ok}/${cases.length}`);
if (failures.length > 0) {
  console.log("\n按失败原因聚合：");
  for (const [code, n] of [...byCode].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${code.padEnd(22)} ${n}`);
  }
  console.log("\n明细：");
  for (const f of failures) console.log(`  ${f.id.padEnd(30)} ${f.code}: ${f.msg}`);
  process.exit(1);
}
