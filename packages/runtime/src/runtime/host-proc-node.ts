import { registerHostProc } from "./host-proc";
import { cpus, freemem, release, tmpdir, totalmem } from "node:os";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readSync, readdirSync } from "node:fs";
import { threadId } from "node:worker_threads";
import { rootCertificates } from "node:tls";
import { hostProjectName } from "./host-io";

const children = new Map<number, number>();

function ps(command: string): string {
  const r = spawnSync("powershell", ["-NoProfile", "-Command", command], { encoding: "utf8" });
  return r.status === 0 && r.stdout !== null ? r.stdout.trim() : "";
}

function winPath(p: string): string {
  return p.split("\\").join("/");
}

const OVERRIDES = new Map<string, string>();

registerHostProc({
  argv: () => process.argv.slice(2),
  env: (name: string): string | null => (OVERRIDES.has(name) ? (OVERRIDES.get(name) as string) : (process.env[name] ?? null)),
  setEnv: (name: string, value: string): void => {
    OVERRIDES.set(name, value);
    process.env[name] = value;
  },
  osName: (): string => (process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux"),
  os: {
    version: () => release(),
    versionAlias: () => {
      const build = Number(release().split(".").pop() ?? "0");
      if (process.platform !== "win32") return release();
      return `${build >= 22000 ? 11 : 10} (build ${String(build)})`;
    },
    modelName: () => (process.platform === "win32" ? ps("(Get-CimInstance Win32_ComputerSystem).Model") : ""),
    uniqueId: () => {
      if (process.platform === "win32") {
        const r = spawnSync("reg", ["query", String.raw`HKLM\SOFTWARE\Microsoft\Cryptography`, "/v", "MachineGuid"], { encoding: "utf8" });
        const m = r.stdout?.match(/MachineGuid\s+REG_SZ\s+([0-9a-f-]+)/i);
        if (m !== null && m !== undefined) return m[1] as string;
      }
      return "";
    },
    locale: () => Intl.DateTimeFormat().resolvedOptions().locale.split("-").join("_"),
    processorName: () => cpus()[0]?.model ?? "",
    processorCount: () => cpus().length,
    memory: () => ({ physical: totalmem(), free: freemem(), available: freemem(), stack: 8388608 }),
    tempDir: () => winPath(tmpdir()),
    cacheDir: () => winPath(process.env.LOCALAPPDATA ?? tmpdir()),
    configDir: () => winPath(process.env.APPDATA ?? tmpdir()),
    dataDir: () => winPath(process.env.APPDATA ?? tmpdir()),
    userDataDir: () => {
      const name = hostProjectName();
      return winPath(`${process.env.APPDATA ?? tmpdir()}/Godot/app_userdata/${name === "" ? "Godot" : name}`);
    },
    systemDir: (dir) => {
      if (process.platform !== "win32") return "";
      const folders = ["Desktop", "MyDocuments", "MyDocuments", "MyDocuments", "MyVideos", "MyMusic", "MyPictures", "MyMusic"];
      const folder = folders[dir] ?? "Desktop";
      if (dir === 3) return winPath(ps("(New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path"));
      return winPath(ps(`[Environment]::GetFolderPath('${folder}')`));
    },
    fonts: () => {
      try {
        return readdirSync(process.platform === "win32" ? "C:/Windows/Fonts" : "/usr/share/fonts");
      } catch {
        return [];
      }
    },
    fontPath: (name) => {
      const root = process.platform === "win32" ? "C:/Windows/Fonts" : "/usr/share/fonts";
      try {
        const hit = readdirSync(root).find((f) => f.toLowerCase().startsWith(name.toLowerCase()));
        return hit === undefined ? "" : `${root}/${hit}`;
      } catch {
        return "";
      }
    },
    caCertificates: () => rootCertificates.join("\n"),
    entropy: (size) => [...randomBytes(size)],
    delay: (usec) => {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, usec / 1000));
    },
    execute: (path, args, readStderr) => {
      const r = spawnSync(path, args, { encoding: "utf8" });
      const text = `${r.stdout ?? ""}${readStderr ? (r.stderr ?? "") : ""}`;
      const output = text === "" ? [] : text.split(/(?<=\n)/);
      return { code: r.status ?? 1, output };
    },
    createProcess: (path, args) => {
      const child = spawn(path, args, { detached: true, stdio: "ignore" });
      child.on("exit", (code) => children.set(child.pid ?? 0, code ?? 0));
      child.unref();
      return child.pid ?? 0;
    },
    kill: (pid) => {
      try {
        process.kill(pid);
        return 0;
      } catch {
        return 1;
      }
    },
    isProcessRunning: (pid) => {
      if (children.has(pid)) return false;
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        return false;
      }
    },
    processExitCode: (pid) => children.get(pid) ?? -1,
    shellOpen: (uri) => spawnSync("cmd", ["/c", "start", "", uri]).status ?? 1,
    shellShow: (path, openFolder) => {
      spawn("explorer", openFolder ? [path] : ["/select,", path], { detached: true, stdio: "ignore" }).unref();
      return 0;
    },
    moveToTrash: (path) => {
      const r = spawnSync("powershell", ["-NoProfile", "-Command", `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('${path.replace(/'/g, "''")}', 'OnlyErrorDialogs', 'SendToRecycleBin')`]);
      return r.status === 0 ? 0 : 1;
    },
    alert: (text, title) => {
      spawnSync("powershell", ["-NoProfile", "-Command", `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${text.replace(/'/g, "''")}', '${title.replace(/'/g, "''")}')`]);
    },
    crash: (message) => {
      process.stderr.write(message + "\n");
      process.abort();
    },
    openWithProgram: (program, paths) => spawnSync(program, paths).status ?? 1,
    stdinType: () => (process.stdin.isTTY ? 1 : 4),
    stdoutType: () => (process.stdout.isTTY ? 1 : 3),
    stderrType: () => (process.stderr.isTTY ? 1 : 3),
    readStdin: (size) => {
      const buf = Buffer.alloc(size);
      try {
        const n = readSync(0, buf, 0, size, null);
        return [...buf.subarray(0, n)];
      } catch {
        return [];
      }
    },
    unsetEnv: (name) => {
      OVERRIDES.delete(name);
      delete process.env[name];
    },
  },
});
