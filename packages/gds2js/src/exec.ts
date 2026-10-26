import { pathToFileURL } from "node:url";
import { claimRunReporting, releaseRunReporting } from "@gds2js/runtime/runtime/errors";

export async function runProduct(path: string): Promise<void> {
  const prev = claimRunReporting();
  try {
    await import(pathToFileURL(path).href);
  } finally {
    releaseRunReporting(prev);
  }
}
