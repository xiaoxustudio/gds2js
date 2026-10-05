import { readdirSync, statSync } from "node:fs";
import type { Dirent } from "node:fs";
import { dirname, join } from "node:path";
import { hhmmss, type CmdName, type Ctx, type Runner } from "./ctx";

/** `--watch` 的轮询间隔：静态目标上没有 `fs.watch` 的 lowering，只能靠摘要轮询。 */
export const WATCH_POLL_MS = 250;

/** 工程模式下不往下走的目录名：里面的 .gd 不是用户正在写的代码。 */
export const WATCH_SKIP = /^(\.git|\.godot|node_modules)$/;

/** 范围内每个 .gd 的「路径:修改时间:大小」摘要，排序后拼成一个串（拿不到 watcher 的 filename，只能自己比对）。 */
export function gdSignature(dir: string, deep: boolean): string {
  const parts: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const d = stack.pop() as string;
    let entries: Dirent[] = [];
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (deep && !WATCH_SKIP.test(e.name)) stack.push(p);
      } else if (/\.gd$/i.test(e.name)) {
        try {
          const st = statSync(p);
          parts.push(p + ":" + String(Math.round(st.mtimeMs)) + ":" + String(st.size));
        } catch {
          parts.push(p + ":gone");
        }
      }
    }
  }
  return parts.sort().join("|");
}

/** `--watch`：轮询 `gdSignature`，摘要变了就重跑一次命令（错误不中断）。 */
export function startWatch(ctx: Ctx, runners: Record<CmdName, Runner>): void {
  const isProject = ctx.cmd === "check-project" || ctx.cmd === "build-project";
  const watchDir = isProject ? ctx.resRoot : dirname(ctx.input);
  console.error(`\n👀 监听 ${watchDir}（改 .gd 自动重跑，Ctrl+C 退出）`);

  try {
    if (!statSync(watchDir).isDirectory()) {
      console.error(`监听失败：${watchDir} 不是目录。`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`监听失败：${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  let timer: NodeJS.Timeout | null = null;
  const onChange = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      console.error(`\n—— 重新运行 ${hhmmss(new Date())} ——`);
      void runners[ctx.cmd](ctx);
    }, 80);
  };

  let primed = false;
  let last = "";
  const poll = (): void => {
    const sig = gdSignature(watchDir, isProject);
    // 空摘要既可能是「目录里没有 .gd」也可能是「这一刻读不到目录」，不能拿来当「第一次采样」的记号 ——
    // 用记号的话，首拍读空就永远不再比对，改文件也不会重跑。
    if (primed && sig !== last) onChange();
    last = sig;
    primed = true;
  };
  poll();
  setInterval(poll, WATCH_POLL_MS);
}
