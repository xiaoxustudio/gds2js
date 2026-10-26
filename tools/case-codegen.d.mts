export interface CaseTableRow {
  cp: number;
  up: string;
  low: string;
}
export interface CaseTableStats {
  fixUp: Map<string, string>;
  fixLow: Map<string, string>;
  agree: number;
  multi: number;
}
export interface CaseFlagsSets {
  upper: Set<number>;
  lower: Set<number>;
  sep: Set<number>;
  digit: Set<number>;
}

export declare function toRanges(set: Iterable<number>): Array<[number, number]>;

export declare function parseCaseTableRows(goldenTexts: string[]): CaseTableRow[];
export declare function computeCaseTable(rows: CaseTableRow[]): CaseTableStats;
export declare function renderCaseTable(rows: CaseTableRow[], stats: CaseTableStats): string;

export declare function parseCaseFlagsSets(goldenText: string): CaseFlagsSets;
export declare function renderCaseFlags(sets: CaseFlagsSets): string;
