#!/usr/bin/env node
/** 入口保持薄：各命令实现与装配在 `cli/` 下的模块里（`cli/main.ts` 的 RUNNERS 是唯一注册点）。 */
import { main } from "./cli/main";

main();
