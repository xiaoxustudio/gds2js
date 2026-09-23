/** tools/lib.mjs 的类型声明，让 tools 下的 .ts 也能被 tsc 检查。 */
export declare const ROOT: string;
export declare const CORPUS: string;
export declare const GODOT_BIN: string;
export declare const DEFAULT_TIMEOUT_MS: number;

export declare function listCases(filter?: string): string[];
export declare function caseDir(id: string): string;
export declare function caseScript(id: string): string;
export declare function caseGolden(id: string): string;
export declare function runGodot(
  gdPath: string,
  opts?: { timeoutMs?: number },
): { text: string; timedOut: boolean; exitCode: number | null };
export declare function normalize(text: string, gdPath?: string): string;
export declare function readGolden(id: string): string | null;
export declare function writeGolden(id: string, text: string): void;
export declare function godotOk(golden: string | null): boolean;
