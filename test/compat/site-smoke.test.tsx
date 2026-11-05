import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ROOT } from "../../tools/lib.mjs";
import { CoverageBar, StatusBadge } from "../../site/src/components";
import { Overview } from "../../site/src/App";
import type { CompatIndex } from "../../site/src/types";

const index = JSON.parse(
  readFileSync(join(ROOT, "site", "public", "data", "v1", "index.json"), "utf8"),
) as CompatIndex;

describe("compat · 站点冒烟", () => {
  it("状态徽章与覆盖率可服务端渲染", () => {
    const html = renderToStaticMarkup(
      <>
        <StatusBadge status="implemented" />
        <CoverageBar stats={{ implemented: 1, partial: 1, missing: 2, unplanned: 3 }} />
      </>,
    );
    expect(html).toContain("已实现");
    expect(html).toContain("25.0%");
    expect(html).toContain('aria-label="已实现覆盖 25.0%（不含没计划）"');
  });

  it("概览页能带着真实索引渲染", () => {
    const html = renderToStaticMarkup(<Overview index={index} onOpenModule={() => undefined} />);
    expect(html).toContain(`Godot ${String(index.engine.major)}.${String(index.engine.minor)}.${String(index.engine.patch)} golden`);
    expect(html).toContain(index.rowCount.toLocaleString());
    expect(html).toContain("已实现覆盖");
    expect(html).toContain("Tier 3 定形拒绝清单");
  });
});
