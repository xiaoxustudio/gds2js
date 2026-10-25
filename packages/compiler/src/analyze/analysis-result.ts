import type { Expr, Loc } from "../lower/ir";

export interface Diagnostic {
  code: string;
  message: string;
  loc: Loc;
}

export interface AnalysisResult {
  readonly owner: string;
  readonly diagnostics: Diagnostic[];
  posReadLabel(e: Expr): string | null;
  boundFace(e: Expr): { face: string; min: number; max: number } | null;
  isDictIntRead(e: Expr): boolean;
  isGlobalValueRead(e: Expr): boolean;
  isNativeClassValueRead(e: Expr): boolean;
  isHostMethodValueRead(e: Expr): boolean;
  lambdaCaptureNames(e: Expr): string[];
}

const NO_LIST: string[] = [];

export const NO_ANALYSIS: AnalysisResult = {
  owner: "",
  diagnostics: [],
  posReadLabel: () => null,
  boundFace: () => null,
  isDictIntRead: () => false,
  isGlobalValueRead: () => false,
  isNativeClassValueRead: () => false,
  isHostMethodValueRead: () => false,
  lambdaCaptureNames: () => NO_LIST,
};
