import { useEffect, useMemo, useState } from "react";
import { loadIndex, loadModule, loadSearch } from "./data";
import type { CompatIndex, ModuleChunk, Row, SearchRow, Status } from "./types";
import {
  CoverageBar,
  EvidenceList,
  KIND_GROUP_LABEL,
  KindTag,
  Pager,
  STATUS_DESC,
  STATUS_LABEL,
  STATUS_ORDER,
  StatusBadge,
  flagsText,
  kindGroup,
} from "./components";

interface UrlState {
  module: string;
  cls: string;
  q: string;
  status: string;
  kind: string;
  page: number;
  row: string;
}

const PAGE_SIZE = 200;

function readUrl(): UrlState {
  const p = new URLSearchParams(window.location.search);
  return {
    module: p.get("module") ?? "",
    cls: p.get("class") ?? "",
    q: p.get("q") ?? "",
    status: p.get("status") ?? "",
    kind: p.get("kind") ?? "",
    page: Math.max(1, Number(p.get("page") ?? "1") || 1),
    row: p.get("row") ?? "",
  };
}

function writeUrl(s: UrlState): void {
  const p = new URLSearchParams();
  if (s.module !== "") p.set("module", s.module);
  if (s.cls !== "") p.set("class", s.cls);
  if (s.q !== "") p.set("q", s.q);
  if (s.status !== "") p.set("status", s.status);
  if (s.kind !== "") p.set("kind", s.kind);
  if (s.page > 1) p.set("page", String(s.page));
  if (s.row !== "") p.set("row", s.row);
  const qs = p.toString();
  history.replaceState(null, "", qs === "" ? window.location.pathname : `?${qs}`);
}

const FAMILY_LABEL: Record<string, string> = {
  global: "全局",
  builtin: "内建类型",
  host: "宿主 API",
  node: "节点与对象",
  engine: "引擎类族",
};

function statusOrNull(value: string): Status | null {
  return STATUS_ORDER.includes(value as Status) ? (value as Status) : null;
}

export function App() {
  const [url, setUrl] = useState<UrlState>(readUrl);
  const [index, setIndex] = useState<CompatIndex | null>(null);
  const [chunk, setChunk] = useState<ModuleChunk | null>(null);
  const [searchRows, setSearchRows] = useState<SearchRow[] | null>(null);
  const [moduleQuery, setModuleQuery] = useState("");
  const [sort, setSort] = useState<"class" | "status" | "name">("class");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => writeUrl(url), [url]);

  useEffect(() => {
    let live = true;
    loadIndex()
      .then((next) => {
        if (live) setIndex(next);
      })
      .catch((e: unknown) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (url.module === "") {
      setChunk(null);
      return;
    }
    let live = true;
    setLoading(true);
    loadModule(url.module)
      .then((next) => {
        if (!live) return;
        setChunk(next);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(String(e));
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [url.module]);

  const needle = url.q.trim().toLowerCase();
  useEffect(() => {
    if (url.module !== "" || needle.length < 2 || searchRows !== null) return;
    let live = true;
    loadSearch()
      .then((rows) => {
        if (live) setSearchRows(rows);
      })
      .catch((e: unknown) => {
        if (live) setError(String(e));
      });
    return () => {
      live = false;
    };
  }, [needle, url.module, searchRows]);

  const status = statusOrNull(url.status);
  const filtered = useMemo(() => {
    if (chunk === null) return [];
    const rows = chunk.rows.filter((r) => {
      if (status !== null && r.t !== status) return false;
      if (url.kind !== "" && kindGroup(r.k) !== url.kind) return false;
      if (url.cls !== "" && r.o !== url.cls) return false;
      if (needle !== "" && !r.o.toLowerCase().includes(needle) && !r.n.toLowerCase().includes(needle) && !r.s.toLowerCase().includes(needle)) return false;
      return true;
    });
    rows.sort((a, b) => {
      if (sort === "name") return a.n.localeCompare(b.n);
      if (sort === "status") return STATUS_ORDER.indexOf(a.t) - STATUS_ORDER.indexOf(b.t) || a.n.localeCompare(b.n);
      return a.o.localeCompare(b.o) || a.k.localeCompare(b.k) || a.n.localeCompare(b.n);
    });
    return rows;
  }, [chunk, status, url.kind, url.cls, needle, sort]);

  const pageRows = filtered.slice((url.page - 1) * PAGE_SIZE, url.page * PAGE_SIZE);
  const openRow = useMemo(() => {
    if (url.row === "" || chunk === null) return null;
    return chunk.rows.find((r) => `${r.o}.${r.n}` === url.row) ?? null;
  }, [url.row, chunk]);

  const globalHits = useMemo(() => {
    if (url.module !== "" || needle.length < 2 || searchRows === null) return null;
    const out: SearchRow[] = [];
    for (const r of searchRows) {
      if (r[0].toLowerCase().includes(needle) || r[1].toLowerCase().includes(needle)) out.push(r);
      if (out.length >= 200) break;
    }
    return out;
  }, [url.module, needle, searchRows]);

  function patch(next: Partial<UrlState>): void {
    setUrl((old) => ({ ...old, ...next, page: next.page ?? 1 }));
  }

  const modulesByFamily = useMemo(() => {
    if (index === null) return [];
    const q = moduleQuery.trim().toLowerCase();
    return Object.keys(FAMILY_LABEL).map((family) => ({
      family,
      label: FAMILY_LABEL[family] as string,
      modules: index.modules
        .filter((m) => m.family === family && (q === "" || m.label.toLowerCase().includes(q)))
        .sort((a, b) => a.label.localeCompare(b.label)),
    }));
  }, [index, moduleQuery]);

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => patch({ module: "", cls: "", row: "", status: "", kind: "" })}>
          <span className="brand-mark">gds2js</span>
          <span className="brand-sub">Godot API 兼容性</span>
        </button>
        {index === null ? null : <span className="engine-pin">{index.engine.fullName}</span>}
        <label className="global-search">
          <span className="sr-only">搜索</span>
          <input
            type="search"
            placeholder="搜索类、方法、属性…"
            value={url.q}
            onChange={(e) => patch({ q: e.target.value, row: "" })}
          />
        </label>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="模块">
          <input
            type="search"
            className="module-search"
            placeholder="过滤模块"
            value={moduleQuery}
            onChange={(e) => setModuleQuery(e.target.value)}
          />
          <button
            type="button"
            className={`module-link ${url.module === "" ? "is-active" : ""}`}
            onClick={() => patch({ module: "", cls: "", row: "" })}
          >
            总览
          </button>
          {modulesByFamily.map((group) =>
            group.modules.length === 0 ? null : (
              <details key={group.family} className="module-group" open={group.family !== "engine"}>
                <summary>
                  {group.label}
                  <span className="count">{group.modules.length}</span>
                </summary>
                {group.modules.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`module-link ${url.module === m.id ? "is-active" : ""}`}
                    onClick={() => patch({ module: m.id, cls: "", row: "", status: "", kind: "" })}
                    title={`${m.label} · ${m.rows.toLocaleString()} 行`}
                  >
                    <span className="module-name">{m.label}</span>
                    <span className="module-stat">{m.stats.implemented.toLocaleString()}/{m.rows.toLocaleString()}</span>
                  </button>
                ))}
              </details>
            ),
          )}
        </aside>

        <main className="content">
          {error !== "" ? <div className="panel error">加载失败：{error}</div> : null}
          {index === null ? (
            <div className="panel loading">正在加载兼容性数据…</div>
          ) : url.module !== "" ? (
            <ModuleView
              index={index}
              chunk={chunk}
              loading={loading}
              url={url}
              status={status}
              filtered={filtered}
              pageRows={pageRows}
              sort={sort}
              onSort={setSort}
              onPatch={patch}
              onOpenRow={(r) => patch({ row: `${r.o}.${r.n}` })}
            />
          ) : globalHits !== null ? (
            <SearchView index={index} hits={globalHits} query={url.q} onOpen={(mod, rowId) => patch({ module: mod, row: rowId, q: "" })} />
          ) : (
            <Overview index={index} onOpenModule={(id) => patch({ module: id })} />
          )}
        </main>
      </div>

      {openRow === null || index === null ? null : (
        <RowModal index={index} row={openRow} onClose={() => patch({ row: "" })} onModule={() => patch({ module: index.classes[openRow.o]?.m ?? url.module, row: "" })} />
      )}
    </div>
  );
}

export function Overview({ index, onOpenModule }: { index: CompatIndex; onOpenModule: (id: string) => void }) {
  const top = index.modules
    .filter((m) => m.stats.implemented > 0)
    .sort((a, b) => b.stats.implemented - a.stats.implemented)
    .slice(0, 12);
  return (
    <div className="overview">
      <section className="hero panel">
        <div>
          <p className="eyebrow">实测口径 · 只认 Godot {index.engine.major}.{index.engine.minor}.{index.engine.patch} golden</p>
          <h2>{index.rowCount.toLocaleString()} 个 API 条目，逐条标注兼容状态</h2>
          <p className="lede">
            覆盖 {index.modules.length} 个模块、{Object.keys(index.classes).length.toLocaleString()} 个引擎类、
            {index.engine.precision === "single" ? "单精度" : "双精度"}构建；每条“已实现”都指到 corpus golden 或 runtime 测试。
          </p>
        </div>
        <CoverageBar stats={index.stats} />
      </section>

      <section className="stat-grid">
        {STATUS_ORDER.map((s) => (
          <div key={s} className={`stat panel stat-${s}`}>
            <StatusBadge status={s} />
            <strong className="stat-value">{index.stats[s].toLocaleString()}</strong>
            <span className="stat-desc">{STATUS_DESC[s]}</span>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>已实现最多的模块</h3>
          <span className="muted">按已实现条目排序，点击进入矩阵</span>
        </div>
        <div className="table-scroll">
        <table className="mini-table">
          <thead>
            <tr>
              <th>模块</th>
              <th>已实现</th>
              <th>部分</th>
              <th>未实现</th>
              <th>没计划</th>
              <th>覆盖率</th>
            </tr>
          </thead>
          <tbody>
            {top.map((m) => {
              const modeled = m.stats.implemented + m.stats.partial + m.stats.missing;
              const pct = modeled === 0 ? 0 : (m.stats.implemented / modeled) * 100;
              return (
                <tr key={m.id} onClick={() => onOpenModule(m.id)} className="clickable">
                  <td>{m.label}</td>
                  <td>{m.stats.implemented.toLocaleString()}</td>
                  <td>{m.stats.partial.toLocaleString()}</td>
                  <td>{m.stats.missing.toLocaleString()}</td>
                  <td>{m.stats.unplanned.toLocaleString()}</td>
                  <td>{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>

      <section className="stat-grid two">
        <div className="panel">
          <h3>状态口径</h3>
          <ul className="legend">
            {STATUS_ORDER.map((s) => (
              <li key={s}>
                <StatusBadge status={s} />
                <span>{STATUS_DESC[s]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3>证据与拒绝清单</h3>
          <p className="muted">
            语料 {index.evidence.cases} 例、runtime 测试 {index.evidence.tests} 个；Tier 3 定形拒绝清单 {index.roster.cells} 格。
          </p>
          <div className="code-list">
            {index.roster.codes.map((c) => (
              <code key={c}>{c}</code>
            ))}
          </div>
          <p className="muted">
            没量过的形状一律抛 <code>UnsupportedError</code>，不静默降级；所以“未实现”不是猜测，而是明确拒绝。
          </p>
        </div>
      </section>
    </div>
  );
}

interface ModuleViewProps {
  index: CompatIndex;
  chunk: ModuleChunk | null;
  loading: boolean;
  url: UrlState;
  status: Status | null;
  filtered: Row[];
  pageRows: Row[];
  sort: "class" | "status" | "name";
  onSort: (sort: "class" | "status" | "name") => void;
  onPatch: (next: Partial<UrlState>) => void;
  onOpenRow: (row: Row) => void;
}

function ModuleView({ index, chunk, loading, url, status, filtered, pageRows, sort, onSort, onPatch, onOpenRow }: ModuleViewProps) {
  const meta = index.modules.find((m) => m.id === url.module);
  if (meta === undefined) return <div className="panel error">未知模块：{url.module}</div>;
  return (
    <div className="module-view">
      <section className="panel module-head">
        <div>
          <p className="eyebrow">{FAMILY_LABEL[meta.family] ?? meta.family}</p>
          <h2>{meta.label}</h2>
          <p className="muted">
            {meta.rows.toLocaleString()} 行 · {meta.owners.length} 个类
          </p>
        </div>
        <div className="badge-row">
          {STATUS_ORDER.map((s) => (
            <StatusBadge key={s} status={s} count={meta.stats[s]} />
          ))}
        </div>
      </section>

      <section className="panel toolbar" aria-label="筛选">
        <label>
          <span>搜索</span>
          <input type="search" value={url.q} placeholder="类 / 成员 / 签名" onChange={(e) => onPatch({ q: e.target.value, row: "" })} />
        </label>
        <label>
          <span>类</span>
          <select value={url.cls} onChange={(e) => onPatch({ cls: e.target.value, row: "" })}>
            <option value="">全部</option>
            {meta.owners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          <span>状态</span>
          <select value={status ?? ""} onChange={(e) => onPatch({ status: e.target.value, row: "" })}>
            <option value="">全部</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
        <label>
          <span>类别</span>
          <select value={url.kind} onChange={(e) => onPatch({ kind: e.target.value, row: "" })}>
            <option value="">全部</option>
            {Object.entries(KIND_GROUP_LABEL).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>排序</span>
          <select value={sort} onChange={(e) => onSort(e.target.value as "class" | "status" | "name")}>
            <option value="class">按类</option>
            <option value="status">按状态</option>
            <option value="name">按名称</option>
          </select>
        </label>
        <button type="button" className="ghost" onClick={() => onPatch({ cls: "", status: "", kind: "", q: "", row: "" })}>
          清除
        </button>
      </section>

      {loading ? <div className="panel loading">正在加载模块…</div> : null}
      {!loading && chunk !== null && filtered.length === 0 ? <div className="panel empty">没有匹配的条目；试试清除筛选。</div> : null}
      {!loading && chunk !== null && filtered.length > 0 ? (
        <section className="panel table-panel">
          <div className="table-scroll">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>成员</th>
                  <th>类别</th>
                  <th>签名</th>
                  <th>状态</th>
                  <th>证据</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={`${r.o}.${r.n}#${r.k}`} onClick={() => onOpenRow(r)} className="clickable">
                    <td className="member-cell">
                      <span className="owner">{r.o}</span>
                      <span className="dot">.</span>
                      <span className="name">{r.n}</span>
                    </td>
                    <td><KindTag kind={r.k} /></td>
                    <td className="sig" title={r.s}>{r.s}</td>
                    <td><StatusBadge status={r.t} /></td>
                    <td className="ev-count">{r.e.filter((e) => e[0] !== "n").length.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={url.page} pageSize={PAGE_SIZE} total={filtered.length} onPage={(page) => onPatch({ page })} />
        </section>
      ) : null}
    </div>
  );
}

function SearchView({ index, hits, query, onOpen }: { index: CompatIndex; hits: SearchRow[]; query: string; onOpen: (module: string, row: string) => void }) {
  return (
    <div className="panel search-view">
      <h2>全局搜索：{query}</h2>
      <p className="muted">在 {index.search.rows.toLocaleString()} 个条目里找到 {hits.length.toLocaleString()} 条（最多展示 200 条）。</p>
      <div className="table-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>成员</th>
              <th>模块</th>
              <th>类别</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {hits.map((r, i) => {
              const mod = index.modules[r[3]];
              return (
                <tr key={`${r[0]}.${r[1]}#${i}`} className="clickable" onClick={() => mod === undefined ? undefined : onOpen(mod.id, `${r[0]}.${r[1]}`)}>
                  <td className="member-cell"><span className="owner">{r[0]}</span><span className="dot">.</span><span className="name">{r[1]}</span></td>
                  <td>{mod?.label ?? "?"}</td>
                  <td><KindTag kind={r[4]} /></td>
                  <td><StatusBadge status={r[2]} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowModal({ index, row, onClose, onModule }: { index: CompatIndex; row: Row; onClose: () => void; onModule: () => void }) {
  const cls = index.classes[row.o];
  const mod = index.modules.find((m) => m.id === cls?.m);
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={`${row.o}.${row.n}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">{mod?.label ?? "GlobalScope"}</p>
            <h2>
              <span className="owner">{row.o}</span>
              <span className="dot">.</span>
              <span className="name">{row.n}</span>
            </h2>
          </div>
          <button type="button" className="ghost" onClick={onClose} aria-label="关闭">关闭</button>
        </div>
        <div className="badge-row">
          <StatusBadge status={row.t} />
          <KindTag kind={row.k} />
          {cls?.sg === true ? <span className="tag">单例</span> : null}
          {cls?.ins === true ? <span className="tag">可实例化</span> : null}
          {cls?.rc === true ? <span className="tag">RefCounted</span> : null}
        </div>
        <pre className="signature">{row.s}</pre>
        <dl className="meta">
          <div>
            <dt>类型层级</dt>
            <dd>{cls === undefined ? "GlobalScope" : (cls.i === null ? row.o : `${row.o} ← ${cls.i}`)}</dd>
          </div>
          <div>
            <dt>flags</dt>
            <dd>{row.f === 0 ? "—" : flagsText(row.f)}</dd>
          </div>
          <div>
            <dt>hash</dt>
            <dd>{row.h === null ? "—" : String(row.h)}</dd>
          </div>
        </dl>
        <h3>证据</h3>
        <EvidenceList evidence={row.e} />
        <p className="muted">{STATUS_DESC[row.t]}</p>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={onModule}>在模块中查看</button>
        </div>
      </div>
    </div>
  );
}
