/**
 * 静态访问器页数对账门（#41 路线② 的那格回归）。
 *   scriptc 0.4.4 不认 `static get` / `static set`，所以带静态访问器的那几页在 `test/e2e/scriptc.test.ts`
 *   里按工具链能力记成 booked（不是红）。booked 只能盖住「已经登记在册」的页 —— 于是这里按产物面重数一遍：
 *   哪些 `main.gen.mts` 发得出静态访问器，就必须与那份名册一字一样。多出一页就是门红，逼着要么把新页登记、
 *   要么把静态访问器改发成静态槽 + 取/存函数（那条路的爆炸半径写在 ROADMAP #41）。
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { ROOT } from "../support/lib-bridge";

const CASES = join(ROOT, "corpus", "cases");

/** scriptc 编不了的那一种形状：类身上的 `static get` / `static set`。 */
const STATIC_ACCESSOR = /^  static (?:get|set) /m;

/** 已知带静态访问器、因而被 scriptc 门记账的页。加页要连着改 scriptc 门的口径，不许只改这里。 */
const BOOKED_PAGES = ["371-property-delegation"];

function pagesWithStaticAccessors(): string[] {
  const found: string[] = [];
  for (const id of readdirSync(CASES).sort()) {
    const file = join(CASES, id, "main.gen.mts");
    if (!existsSync(file)) continue;
    if (STATIC_ACCESSOR.test(readFileSync(file, "utf8"))) found.push(id);
  }
  return found;
}

it("带静态访问器的产物页与记账名册一字一样", () => {
  const pages = pagesWithStaticAccessors();
  expect(pages.length, "corpus/cases 里一份 main.gen.mts 都没有（先跑 pnpm test:compile）").toBeGreaterThan(0);
  expect(pages.join("\n")).toBe(BOOKED_PAGES.join("\n"));
});
