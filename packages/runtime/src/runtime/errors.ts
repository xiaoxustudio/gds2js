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

/** 报错行的正文：`[code] message`（响亮拒）或 `message`（运行期错）。CLI 与产物共用这一句。 */
export function errOf(e: unknown): string {
  return e instanceof UnsupportedError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : String(e);
}

/**
 * 「这条错外面有人报」的声明通道。走 `process.env` 而不是 globalThis 上的槽：
 * 一个进程里 CLI 与产物吃的常是两份 runtime 实例（模块级状态不同调），而 `process` 才是真单例；
 * 顺带也是 scriptc 收得下的形状（`globalThis` 往 Record 转是 SC0001）。
 */
export const RUN_OWNER_ENV = "GDS2JS_RUN_OWNER";
const RUN_OWNER_IN_PROCESS = "in-process";
const RUN_OWNER_CHILD = "child";

/** 同进程宿主（CLI 的 `run`、corpus 的测试宿主）声明「归我报」，拿回上一位的值。 */
export function claimRunReporting(): string | undefined {
  const prev = process.env[RUN_OWNER_ENV];
  process.env[RUN_OWNER_ENV] = RUN_OWNER_IN_PROCESS;
  return prev;
}

/** 交还「归我报」这个声明。 */
export function releaseRunReporting(prev: string | undefined): void {
  if (prev === undefined) delete process.env[RUN_OWNER_ENV];
  else process.env[RUN_OWNER_ENV] = prev;
}

/** 隔进程宿主（原生 CLI 起的那个 node 子进程）的声明：子进程继承父环境，所以也是同一条通道。 */
export function claimRunReportingInChild(): string | undefined {
  const prev = process.env[RUN_OWNER_ENV];
  process.env[RUN_OWNER_ENV] = RUN_OWNER_CHILD;
  return prev;
}

/**
 * `run` 抛出来时由产物自己收口。同进程声明过 → 原样再抛，照宿主自己的 catch 口径走；
 * 隔进程声明过 → 只把退出码带回非 0。两条都没声明（`node dist/x.mts`、scriptc 出的原生 exe
 * 直接跑）才是这一格要补的兜底：一句 `runtime error` 加非 0 退出码，而不是一条 Uncaught 栈。
 */
export function reportRunFailure(e: unknown): void {
  const owner = process.env[RUN_OWNER_ENV];
  if (owner === RUN_OWNER_IN_PROCESS) throw e;
  process.exitCode = 1;
  if (owner === RUN_OWNER_CHILD) return;
  process.stderr.write(`  runtime error  ${errOf(e)}\n`);
}
