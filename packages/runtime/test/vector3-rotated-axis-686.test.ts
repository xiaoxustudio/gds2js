// `Vector3.rotated` 轴没归一时宿主推的那一块（S686，#21 结清；尺 `tmp/probe708/axis.mts` 七格 + 语料 `431-vector3-rotated-axis` 六格逐字节）：
// 引擎四行 —— `ERROR: The axis Vector3 (1.0, 1.0, 1.0) must be normalized.` / `   at: set_axis_angle (core/math/basis.cpp:843)` /
// backtrace 表头 / `[0] 帧`，且**先于** print 那一行（stdout 与 stderr 合流的真实次序，`tmp/probe708/r05.gd` 两侧对读）。
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import "@gds2js/runtime/host";
import "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { varToStr } from "@gds2js/runtime/runtime/values";
import { GVector3, vector3Method } from "@gds2js/runtime/runtime/vector3";

const v3 = (x: number, y: number, z: number) => V.object(new GVector3(x, y, z));
const written: string[] = [];
let real: typeof process.stderr.write | null = null;

beforeAll(() => {
  real = process.stderr.write.bind(process.stderr);
  process.stderr.write = ((chunk: string): boolean => {
    written.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
});

afterAll(() => {
  if (real !== null) process.stderr.write = real;
});

describe("host · Vector3.rotated 的轴未归一块", () => {
  it("(1,1,1) 那一格的逐字节块", () => {
    const got = vector3Method(new GVector3(1, 2, 3), "rotated", [v3(1, 1, 1), V.float(2.0)]);
    expect(varToStr(got)).toBe("Vector3(1, 2, 3)");
    const block = written.join("");
    expect(block.split("\n")[0]).toBe("ERROR: The axis Vector3 (1.0, 1.0, 1.0) must be normalized.");
    expect(block.split("\n")[1]).toBe("   at: set_axis_angle (core/math/basis.cpp:843)");
    expect(block.split("\n")[2]).toBe("   GDScript backtrace (most recent call first):");
  });

  it("(2,0,0) 与 1e-8 两档都报、0.999999 与 1.0000001 两档都不报", () => {
    written.length = 0;
    vector3Method(new GVector3(1, 2, 3), "rotated", [v3(2, 0, 0), V.float(1.0)]);
    vector3Method(new GVector3(1, 2, 3), "rotated", [v3(1e-8, 0, 0), V.float(1.0)]);
    vector3Method(new GVector3(1, 2, 3), "rotated", [v3(0.999999, 0, 0), V.float(1.0)]);
    vector3Method(new GVector3(1, 2, 3), "rotated", [v3(1.0000001, 0, 0), V.float(1.0)]);
    const rows = written.join("").split("\n").filter((l) => l.startsWith("ERROR: "));
    expect(rows).toEqual([
      "ERROR: The axis Vector3 (2.0, 0.0, 0.0) must be normalized.",
      "ERROR: The axis Vector3 (0.0, 0.0, 0.0) must be normalized.",
    ]);
  });
});
