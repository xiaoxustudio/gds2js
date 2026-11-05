export type Status = "implemented" | "partial" | "missing" | "unplanned";

export type Kind = "m" | "bm" | "uf" | "p" | "bp" | "s" | "c" | "bc" | "e" | "be" | "ge" | "v" | "bv" | "gv" | "op" | "ct";

export type EvidenceKind = "c" | "t" | "n" | "r";

export type Evidence = [EvidenceKind, string];

export interface Row {
  o: string;
  k: Kind;
  n: string;
  s: string;
  f: number;
  h: number | null;
  t: Status;
  e: Evidence[];
}

export interface ModuleMeta {
  id: string;
  label: string;
  family: string;
  rows: number;
  owners: string[];
  stats: Record<Status, number>;
}

export interface ClassMeta {
  m: string;
  i: string | null;
  sg: boolean;
  ins: boolean;
  rc: boolean;
}

export interface CompatIndex {
  schema: number;
  engine: {
    major: number;
    minor: number;
    patch: number;
    status: string;
    build: string;
    fullName: string;
    precision: string;
  };
  rowCount: number;
  modules: ModuleMeta[];
  classes: Record<string, ClassMeta>;
  singletons: string[];
  stats: Record<Status, number>;
  statsModeled: number;
  search: { rows: number };
  roster: { cells: number; codes: string[] };
  evidence: { cases: number; tests: number };
}

export interface ModuleChunk {
  id: string;
  label: string;
  family: string;
  cols: string[];
  rows: Row[];
}

export type SearchRow = [string, string, Status, number, Kind];
