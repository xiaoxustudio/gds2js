import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "vitest";
import { bad, ok } from "@gds2js/testkit";
import { TREE_FACE } from "@gds2js/runtime/tree-face";
import { ROOT } from "../../tools/lib.mjs";

const T = TREE_FACE;
const rtSrc = join(ROOT, T.repo.runtimeSrcRoot);
const rel = (p: string): string => relative(ROOT, p).split("\\").join("/");

describe("tree-face 对账门", () => {
  it("① 清单源在盘面", () => {
    const sources: Array<[string, string]> = [
      ["runtime 目录", join(rtSrc, T.repo.runtimeDir)],
      ["runtime 入口", join(rtSrc, T.repo.runtimeDir, T.repo.runtimeIndex)],
      ["host", join(rtSrc, T.repo.host)],
      ["sharedDouble", join(rtSrc, T.repo.sharedDouble)],
      ["zstdHost", join(rtSrc, T.repo.zstdHost)],
      ["zstdDts", join(rtSrc, T.repo.zstdDts)],
      ["vendor 目录", join(rtSrc, T.repo.vendorDir)],
    ];
    for (const [name, p] of sources) {
      if (existsSync(p)) ok(`${name}：${rel(p)}`);
      else bad(`${name} 不在盘面：${rel(p)}`);
    }
    for (const pkg of T.tree.zstdPackages) {
      const p = join(rtSrc, T.repo.vendorDir, pkg);
      if (existsSync(p)) ok(`vendor 包：${rel(p)}`);
      else bad(`vendor 包不在盘面：${rel(p)}`);
    }
  });

  it("② 镜像不变量（tree = repo 原位；home = srcPrefix + repo）", () => {
    const mirrored: Array<[keyof typeof T.tree, keyof typeof T.repo]> = [
      ["runtimeDir", "runtimeDir"],
      ["host", "host"],
      ["sharedDouble", "sharedDouble"],
      ["zstdHost", "zstdHost"],
      ["zstdDts", "zstdDts"],
    ];
    const treeDrift = mirrored.filter(([t, r]) => T.tree[t] !== T.repo[r]);
    if (treeDrift.length === 0) ok("tree 五项与 repo 同名同构");
    else bad(`tree 与 repo 漂移：${treeDrift.map(([t]) => t).join(", ")}`);

    const homes: Array<[string, string, string]> = [
      ["runtimeDir", T.home.runtimeDir, T.home.srcPrefix + "/" + T.repo.runtimeDir],
      ["host", T.home.host, T.home.srcPrefix + "/" + T.repo.host],
      ["sharedDouble", T.home.sharedDouble, T.home.srcPrefix + "/" + T.repo.sharedDouble],
    ];
    for (const [key, actual, want] of homes) {
      if (actual === want) ok(`home.${key} = srcPrefix + repo.${key}`);
      else bad(`home.${key}（${actual}）≠ srcPrefix + repo.${key}`);
    }
  });

  it("③ 消费者零硬编码（硬编码的树面字符串只许出现在 tree-face.ts）", () => {
    const consumers: Array<{ file: string; mustRef: boolean }> = [
      { file: "packages/gds2js/src/cli.ts", mustRef: false },
      { file: "packages/gds2js/src/cli/export-ts-tree.ts", mustRef: true },
      { file: "test/e2e/scriptc.test.ts", mustRef: true },
      { file: "tools/cli-native.mjs", mustRef: true },
    ];
    const forbidden = [
      ...new Set<string>([
        T.repo.runtimeSrcRoot,
        T.repo.sharedDouble,
        T.tree.sharedDouble,
        T.repo.zstdHost,
        T.tree.zstdHost,
        T.repo.zstdDts,
        T.tree.zstdDts,
        T.home.runtimeDir,
        T.home.host,
        T.home.sharedDouble,
        ...T.tree.zstdPackages,
      ]),
    ];

    for (const { file, mustRef } of consumers) {
      const abs = join(ROOT, file);
      if (!existsSync(abs)) {
        bad(`消费者不在盘面：${file}`);
        continue;
      }
      const text = readFileSync(abs, "utf8");
      let hits = 0;
      for (const lit of forbidden) {
        text.split("\n").forEach((line, i) => {
          if (line.includes("tree-face")) return;
          if (line.includes(lit)) {
            bad(`${file}:${String(i + 1)} 硬编码 ${JSON.stringify(lit)}`);
            hits++;
          }
        });
      }
      if (mustRef && !text.includes("TREE_FACE")) bad(`${file} 没引用 TREE_FACE 清单`);
      else if (hits === 0) ok(`${file}：零硬编码${mustRef ? " + 已引清单" : ""}`);
    }
  });
});
