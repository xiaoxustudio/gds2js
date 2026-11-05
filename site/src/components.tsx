import type { Evidence, Kind, Status } from "./types";

export const STATUS_ORDER: Status[] = ["implemented", "partial", "missing", "unplanned"];

export const STATUS_LABEL: Record<Status, string> = {
  implemented: "已实现",
  partial: "部分实现",
  missing: "未实现",
  unplanned: "没计划",
};

export const STATUS_DESC: Record<Status, string> = {
  implemented: "在实现面里，且有 golden 语料或 runtime 测试证据",
  partial: "有实现或面表命中，但缺逐条 golden 证据",
  missing: "已建模模块里没量过的成员，按纪律响亮拒",
  unplanned: "明示不在 Tier 范围，集中登记，便于以后翻案",
};

export const KIND_LABEL: Record<Kind, string> = {
  m: "方法",
  bm: "内建方法",
  uf: "全局函数",
  p: "属性",
  bp: "内建成员",
  s: "信号",
  c: "常量",
  bc: "内建常量",
  e: "枚举",
  be: "内建枚举",
  ge: "全局枚举",
  v: "枚举值",
  bv: "内建枚举值",
  gv: "全局枚举值",
  op: "运算符",
  ct: "构造",
};

export const KIND_GROUP: Record<string, string[]> = {
  method: ["m", "bm", "uf"],
  property: ["p", "bp"],
  signal: ["s"],
  constant: ["c", "bc", "gv"],
  enum: ["e", "be", "ge", "v", "bv"],
  operator: ["op"],
  constructor: ["ct"],
};

export const KIND_GROUP_LABEL: Record<string, string> = {
  method: "方法 / 函数",
  property: "属性 / 成员",
  signal: "信号",
  constant: "常量",
  enum: "枚举",
  operator: "运算符",
  constructor: "构造",
};

export function kindGroup(kind: Kind): string {
  for (const [group, kinds] of Object.entries(KIND_GROUP)) {
    if (kinds.includes(kind)) return group;
  }
  return "method";
}

export function StatusBadge({ status, count }: { status: Status; count?: number }) {
  return (
    <span className={`badge badge-${status}`} title={STATUS_DESC[status]}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
      {count === undefined ? null : <span className="badge-count">{count.toLocaleString()}</span>}
    </span>
  );
}

export function KindTag({ kind }: { kind: Kind }) {
  return <span className={`kind kind-${kindGroup(kind)}`}>{KIND_LABEL[kind]}</span>;
}

const REPO = "https://github.com/xiaoxustudio/gds2js/blob/main/";

export function evidencePath(e: Evidence): string | null {
  if (e[0] === "c") return `corpus/cases/${e[1]}/main.gd`;
  if (e[0] === "t") return `packages/runtime/test/${e[1]}.test.ts`;
  return null;
}

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  if (evidence.length === 0) return <span className="muted">暂无证据</span>;
  return (
    <div className="evidence-list">
      {evidence.map((e) => {
        if (e[0] === "n") return <span key={`n:${e[1]}`} className="ev ev-note">{e[1]}</span>;
        if (e[0] === "r") return <span key={`r:${e[1]}`} className="ev ev-refusal">{e[1]}</span>;
        const path = evidencePath(e) ?? "";
        return (
          <a
            key={`${e[0]}:${e[1]}`}
            className={`ev ev-${e[0] === "c" ? "case" : "test"}`}
            href={path === "" ? undefined : `${REPO}${path}`}
            target="_blank"
            rel="noreferrer"
            title={path}
          >
            {e[0] === "c" ? "语料" : "测试"} · {e[1]}
          </a>
        );
      })}
    </div>
  );
}

export function flagsText(flags: number): string {
  const parts: string[] = [];
  if (flags & 1) parts.push("static");
  if (flags & 2) parts.push("vararg");
  if (flags & 4) parts.push("virtual");
  if (flags & 8) parts.push("const");
  if (flags & 16) parts.push("required");
  return parts.join(" ");
}

export function Pager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const from = Math.min(total, (page - 1) * pageSize + 1);
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pager">
      <button type="button" onClick={() => onPage(1)} disabled={page <= 1} aria-label="第一页">«</button>
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1}>上一页</button>
      <span className="pager-info">{from.toLocaleString()}–{to.toLocaleString()} / {total.toLocaleString()}</span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages}>下一页</button>
      <button type="button" onClick={() => onPage(pages)} disabled={page >= pages} aria-label="最后一页">»</button>
    </div>
  );
}

export function CoverageBar({ stats }: { stats: Record<Status, number> }) {
  const modeled = stats.implemented + stats.partial + stats.missing;
  const pct = modeled === 0 ? 0 : (stats.implemented / modeled) * 100;
  return (
    <div className="coverage" role="img" aria-label={`已实现覆盖 ${pct.toFixed(1)}%（不含没计划）`}>
      <div className="coverage-track">
        <div className="coverage-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="coverage-caption">
        <strong>{pct.toFixed(1)}%</strong> 已实现覆盖（分母不含“没计划”）
      </div>
    </div>
  );
}
