import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../lib.mjs";

const ROSTER = join(ROOT, "packages", "runtime", "test", "tier3-refusal-roster.test.ts");

function statementEnd(text, start) {
  let depth = 0;
  let quote = "";
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (quote !== "") {
      if (ch === "\\") {
        i += 1;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return text.length - 1;
}

export function parseRoster() {
  const text = readFileSync(ROSTER, "utf8");
  const cells = [];
  for (const m of text.matchAll(/eq\(\s*"(t[34])"\s*,\s*"([^"]*)"/g)) {
    const start = m.index ?? 0;
    const end = statementEnd(text, start);
    const stmt = text.slice(start, end + 1);
    if (!stmt.includes("say(")) continue;
    const quotes = [...stmt.matchAll(/"([^"]*)"/g)].map((q) => q[1]);
    const code = quotes[quotes.length - 1] ?? "";
    if (code === "" || code === "没抛" || code.startsWith("没抛|") || code === m[2]) continue;
    cells.push({ tier: m[1], label: m[2], code });
  }
  return cells;
}

export function rosterCodes() {
  return [...new Set(parseRoster().map((c) => c.code))].sort();
}
