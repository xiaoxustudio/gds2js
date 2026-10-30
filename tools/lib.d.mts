export declare const ROOT: string;
export declare const CORPUS: string;
export declare const GODOT_BIN: string;
export declare const DEFAULT_TIMEOUT_MS: number;
export declare const GODOT_PIN: string;

export declare function godotVersion(timeoutMs?: number): string | null;
export declare function requireGodotPin(): string;

export declare function listCases(filter?: string): string[];
export declare function listSingleCases(filter?: string): string[];
export declare function caseDir(id: string): string;
export declare function caseScript(id: string): string;
export declare function caseGolden(id: string): string;
export declare function caseIsProject(id: string): boolean;
export declare function caseScene(id: string): string | null;
export declare const SANDBOX_ROOT: string;

export interface Sandbox {
  id: string;
  dir: string;
  engine: string;
  appdata: string;
  roaming: string;
  local: string;
  user: string;
}

export declare function caseSandboxed(id: string): boolean;
export declare function projectConfigName(id: string): string;
export declare function sandboxPaths(id: string): Sandbox;
export declare function sandboxEnv(id: string): Record<string, string | undefined>;
export declare function prepareSandbox(id: string): Sandbox;
export declare function dropSandbox(id: string): void;
export declare function runGodot(
  gdPath: string,
  opts?: { timeoutMs?: number; projectPath?: string | null; scene?: boolean; env?: Record<string, string | undefined> | null; cwd?: string | null },
): { text: string; timedOut: boolean; exitCode: number | null };
export declare function normalize(text: string, gdPath?: string, sandboxId?: string | null): string;
export declare function readGolden(id: string): string | null;
export declare function writeGolden(id: string, text: string): void;
export declare function godotOk(golden: string | null): boolean;
export declare function hangBudget(golden: string | null): number;
