import { registerHostProc } from "./host-proc";

const OVERRIDES = new Map<string, string>();

registerHostProc({
  argv: () => process.argv.slice(2),
  env: (name: string): string | null => (OVERRIDES.has(name) ? (OVERRIDES.get(name) as string) : (process.env[name] ?? null)),
  setEnv: (name: string, value: string): void => {
    OVERRIDES.set(name, value);
    process.env[name] = value;
  },
  osName: (): string => (process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux"),
});
