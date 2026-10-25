import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { selfFile } from "./home";

export const WASM_CANDIDATES = ["../../../../gdscript.wasm", "../../../gdscript.wasm", "../../gdscript.wasm", "../gdscript.wasm", "./gdscript.wasm"];

export function resolveWasm(base: string): string {
  const fromHome = selfFile("gdscript.wasm");
  if (fromHome) return fromHome;
  for (const spec of WASM_CANDIDATES) {
    const p = fileURLToPath(new URL(spec, base));
    if (existsSync(p)) return p;
  }
  throw new Error(`找不到 gdscript.wasm（试过 ${WASM_CANDIDATES.join(" , ")}，基于 ${base}）`);
}
