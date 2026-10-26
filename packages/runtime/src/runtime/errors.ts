export class UnsupportedError extends Error {
  override name = "UnsupportedError";

  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export class GodotRuntimeError extends Error {
  override name = "GodotRuntimeError";

  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * 报错行的正文：`[code] message`（响亮拒）或 `message`（运行期错）。CLI 与产物共用这一句。
 * 认 `name` 不认 `instanceof`：CLI 吃的常是打包好的那一份 runtime、产物吃的是源码那一份，
 * 两个类不同调，`instanceof` 在跨这份分岔时会失效（`UnsupportedError` 自己把 name 钉死了）。
 */
export function errOf(e: unknown): string {
  if (e instanceof Error && e.name === "UnsupportedError") {
    const code = (e as { code?: string }).code;
    return code === undefined ? e.message : `[${code}] ${e.message}`;
  }
  return e instanceof Error ? e.message : String(e);
}

export const RUN_OWNER_ENV = "GDS2JS_RUN_OWNER";
const RUN_OWNER_IN_PROCESS = "in-process";
const RUN_OWNER_CHILD = "child";

export function claimRunReporting(): string | undefined {
  const prev = process.env[RUN_OWNER_ENV];
  process.env[RUN_OWNER_ENV] = RUN_OWNER_IN_PROCESS;
  return prev;
}

export function releaseRunReporting(prev: string | undefined): void {
  if (prev === undefined) delete process.env[RUN_OWNER_ENV];
  else process.env[RUN_OWNER_ENV] = prev;
}

export function claimRunReportingInChild(): string | undefined {
  const prev = process.env[RUN_OWNER_ENV];
  process.env[RUN_OWNER_ENV] = RUN_OWNER_CHILD;
  return prev;
}

export function reportRunFailure(e: unknown): void {
  const owner = process.env[RUN_OWNER_ENV];
  if (owner === RUN_OWNER_IN_PROCESS) throw e;
  process.exitCode = 1;
  process.stderr.write(owner === RUN_OWNER_CHILD ? `${errOf(e)}\n` : `  runtime error  ${errOf(e)}\n`);
}
