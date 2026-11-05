import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CoverageBar, StatusBadge } from "../../site/src/components";

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
});
