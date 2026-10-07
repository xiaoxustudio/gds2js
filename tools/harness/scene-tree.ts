import { claimRunReporting } from "@gds2js/runtime/runtime/errors";

// corpus 的门是「跑完接着跑下一个用例」：产物撞错时要把错误交回 js-runner 归桶（崩溃 / 静默错分开算），
// 不许产物自己印一行、更不许把 process.exitCode 改成非 0。声明「归我报」，产物顶层就只再抛不改口。
claimRunReporting();

export {
  print,
  printJoined,
  printRaw,
  printErr,
  printVerbose,
  printRich,
  printDebug,
  flush,
  captured,
  resetOut as reset,
  SceneTree,
} from "@gds2js/runtime/host-node";
