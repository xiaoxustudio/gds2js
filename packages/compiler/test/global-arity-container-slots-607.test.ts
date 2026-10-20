/** 元数越界时引擎补的那一条声明位句子（S607）：只认 Array 字面量、只认声明位。读数 `tmp/d6/s608c.gd`（九形）与 `tmp/d6/s607survey.out`（34 形）。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (call: string): Promise<string[]> => {
  const tree = await parseSource(`extends SceneTree\n\nfunc _initialize():\n\tvar v = ${call}\n\tquit()\n`);
  return analyze(lower(tree)).map((d) => d.message);
};
const arity = (fn: string, kind: "few" | "many", want: number, got: number) =>
  kind === "few"
    ? `Too few arguments for "${fn}()" call. Expected at least ${want} but received ${got}.`
    : `Too many arguments for "${fn}()" call. Expected at most ${want} but received ${got}.`;
const slot = (fn: string, pos: number, want: string) =>
  `Invalid argument for "${fn}()" function: argument ${pos} should be "${want}" but is "Array".`;

describe("元数越界 + Array 字面量的声明位补句（S607）", () => {
  it("声明位上的 Array 字面量：元数句在前，补句在后", async () => {
    expect(await diags("sqrt([1], 2)")).toEqual([arity("sqrt", "many", 1, 2), slot("sqrt", 1, "float")]);
    expect(await diags("is_finite([1], 2.0)")).toEqual([arity("is_finite", "many", 1, 2), slot("is_finite", 1, "float")]);
    expect(await diags("db_to_linear([1], 2.0, 3.0)")).toEqual([arity("db_to_linear", "many", 1, 3), slot("db_to_linear", 1, "float")]);
    expect(await diags("remap([1], 2.0, 3.0)")).toEqual([arity("remap", "few", 5, 3), slot("remap", 1, "float")]);
    expect(await diags("wrapf([1], 2.0)")).toEqual([arity("wrapf", "few", 3, 2), slot("wrapf", 1, "float")]);
    expect(await diags("wrapf(1.0, [1])")).toEqual([arity("wrapf", "few", 3, 2), slot("wrapf", 2, "float")]);
    expect(await diags("bezier_derivative(1.0, 2.0, 3.0, [1])")).toEqual([
      arity("bezier_derivative", "few", 5, 4),
      slot("bezier_derivative", 4, "float"),
    ]);
    expect(await diags("pingpong([1], 2.0, 3.0)")).toEqual([arity("pingpong", "many", 2, 3), slot("pingpong", 1, "float")]);
    expect(await diags("pingpong(1.0, [1], 3.0)")).toEqual([arity("pingpong", "many", 2, 3), slot("pingpong", 2, "float")]);
  });
  it("String 源不补、越出声明位也不补", async () => {
    expect(await diags('pingpong("a", 1.0, 2.0)')).toEqual([arity("pingpong", "many", 2, 3)]);
    expect(await diags('wrapi(1, "x")')).toEqual([arity("wrapi", "few", 3, 2)]);
    expect(await diags("wrapf(1.0, 2.0, 3.0, [1])")).toEqual([arity("wrapf", "many", 3, 4)]);
    expect(await diags("move_toward(1.0)")).toEqual([arity("move_toward", "few", 3, 1)]);
  });
  it("元数合式那一形仍走逐位判据（不受这支影响）", async () => {
    expect(await diags('sqrt([1])')).toEqual([slot("sqrt", 1, "float")]);
    expect(await diags('move_toward([1], 2.0, 1.0)')).toEqual([slot("move_toward", 1, "float")]);
    expect(await diags("wrapi(1, [1], 2)")).toEqual([slot("wrapi", 2, "int")]);
  });
});
