import { registerHostProc } from "./host-proc";

registerHostProc({
  argv: () => process.argv.slice(2),
  env: (name: string): string | null => process.env[name] ?? null,
});
