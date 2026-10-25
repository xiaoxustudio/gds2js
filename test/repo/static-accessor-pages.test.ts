import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { ROOT } from "../support/lib-bridge";

const CASES = join(ROOT, "corpus", "cases");

const STATIC_ACCESSOR = /^  static (?:get|set) /m;

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
