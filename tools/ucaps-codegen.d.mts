export interface SweepRow {
  cp: number;
  upper: string;
  lower: string;
}
export interface CapsTables {
  upper: Map<number, number>;
  lower: Map<number, number>;
  multiUpper: Map<number, number[]>;
  multiLower: Map<number, number[]>;
}

export declare function parseSweep(text: string): SweepRow[];
export declare function computeCaps(rows: SweepRow[]): CapsTables;
export declare function parseCommitted(text: string): { upper: Map<number, number>; lower: Map<number, number> };
