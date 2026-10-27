import { claimRunReporting } from "@gds2js/runtime/runtime/errors";

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
  sceneRun,
} from "@gds2js/runtime/host-node";
