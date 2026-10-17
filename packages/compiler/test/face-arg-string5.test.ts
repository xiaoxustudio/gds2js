/**
 * 五名后加的 String 方法（`remove_char` / `remove_chars` / `replace_char` / `replace_chars` / `to_multibyte_char_buffer`）
 * 的元数上下界与逐位实参型（S478，尺 `tmp/d6/n16.py` 一百八十八格，读数 `tmp/d6/n16.json`：String 面九十四格逐格同句）。
 * 同格里也钉住新接的一条：模块级标注的 `String` 变量作接收者，引擎讲的句子与局部变量、字面量接收者一字不差。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const HEAD = 'extends SceneTree\n\nvar s: String = "abcd"\nvar v: Vector2 = Vector2(1, 2)\n';

async function msgs(expr: string): Promise<string[]> {
  const src = HEAD + "func c():\n\tprint(" + expr + ")\n";
  return analyze(lower(await parseSource(src))).map((d) => d.message).sort();
}

const CELLS: Array<[string, string[]]> = [
  ["s.remove_char(Color(1, 2, 3, 4))", ["Cannot pass a value of type \"Color\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Color\"."]],
  ["s.remove_char(&\"a\")", ["Cannot pass a value of type \"StringName\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"StringName\"."]],
  ["s.remove_char(\"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["s.remove_char(^\"a\")", ["Cannot pass a value of type \"NodePath\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"NodePath\"."]],
  ["s.remove_char(Vector2(1, 2))", ["Cannot pass a value of type \"Vector2\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Vector2\"."]],
  ["s.remove_char(Vector2i(1, 2))", ["Cannot pass a value of type \"Vector2i\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Vector2i\"."]],
  ["s.remove_char(Vector3(1, 2, 3))", ["Cannot pass a value of type \"Vector3\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Vector3\"."]],
  ["s.remove_char(Vector3i(1, 2, 3))", ["Cannot pass a value of type \"Vector3i\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Vector3i\"."]],
  ["s.remove_char(null)", ["Cannot pass a value of type \"null\" as \"int\".", "Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"null\"."]],
  ["s.remove_char([1])", ["Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["s.remove_char({\"a\": 1})", ["Invalid argument for \"remove_char()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["s.remove_char()", ["Too few arguments for \"remove_char()\" call. Expected at least 1 but received 0."]],
  ["s.remove_char(97, 97)", ["Too many arguments for \"remove_char()\" call. Expected at most 1 but received 2."]],
  ["s.remove_chars(Color(1, 2, 3, 4))", ["Cannot pass a value of type \"Color\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Color\"."]],
  ["s.remove_chars(Vector2(1, 2))", ["Cannot pass a value of type \"Vector2\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Vector2\"."]],
  ["s.remove_chars(Vector2i(1, 2))", ["Cannot pass a value of type \"Vector2i\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Vector2i\"."]],
  ["s.remove_chars(Vector3(1, 2, 3))", ["Cannot pass a value of type \"Vector3\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Vector3\"."]],
  ["s.remove_chars(Vector3i(1, 2, 3))", ["Cannot pass a value of type \"Vector3i\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Vector3i\"."]],
  ["s.remove_chars(true)", ["Cannot pass a value of type \"bool\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"bool\"."]],
  ["s.remove_chars(1.5)", ["Cannot pass a value of type \"float\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"float\"."]],
  ["s.remove_chars(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.remove_chars(null)", ["Cannot pass a value of type \"null\" as \"String\".", "Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"null\"."]],
  ["s.remove_chars([1])", ["Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["s.remove_chars({\"a\": 1})", ["Invalid argument for \"remove_chars()\" function: argument 1 should be \"String\" but is \"Dictionary\"."]],
  ["s.remove_chars()", ["Too few arguments for \"remove_chars()\" call. Expected at least 1 but received 0."]],
  ["s.remove_chars(\"a\", 97)", ["Too many arguments for \"remove_chars()\" call. Expected at most 1 but received 2."]],
  ["s.replace_char(Color(1, 2, 3, 4), 97)", ["Cannot pass a value of type \"Color\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Color\"."]],
  ["s.replace_char(&\"a\", 97)", ["Cannot pass a value of type \"StringName\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"StringName\"."]],
  ["s.replace_char(\"a\", 97)", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"String\"."]],
  ["s.replace_char(^\"a\", 97)", ["Cannot pass a value of type \"NodePath\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"NodePath\"."]],
  ["s.replace_char(Vector2(1, 2), 97)", ["Cannot pass a value of type \"Vector2\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Vector2\"."]],
  ["s.replace_char(Vector2i(1, 2), 97)", ["Cannot pass a value of type \"Vector2i\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Vector2i\"."]],
  ["s.replace_char(Vector3(1, 2, 3), 97)", ["Cannot pass a value of type \"Vector3\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Vector3\"."]],
  ["s.replace_char(Vector3i(1, 2, 3), 97)", ["Cannot pass a value of type \"Vector3i\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Vector3i\"."]],
  ["s.replace_char(null, 97)", ["Cannot pass a value of type \"null\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"null\"."]],
  ["s.replace_char([1], 97)", ["Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["s.replace_char({\"a\": 1}, 97)", ["Invalid argument for \"replace_char()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["s.replace_char(97, Color(1, 2, 3, 4))", ["Cannot pass a value of type \"Color\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Color\"."]],
  ["s.replace_char(97, &\"a\")", ["Cannot pass a value of type \"StringName\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"StringName\"."]],
  ["s.replace_char(97, \"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["s.replace_char(97, ^\"a\")", ["Cannot pass a value of type \"NodePath\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"NodePath\"."]],
  ["s.replace_char(97, Vector2(1, 2))", ["Cannot pass a value of type \"Vector2\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Vector2\"."]],
  ["s.replace_char(97, Vector2i(1, 2))", ["Cannot pass a value of type \"Vector2i\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Vector2i\"."]],
  ["s.replace_char(97, Vector3(1, 2, 3))", ["Cannot pass a value of type \"Vector3\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Vector3\"."]],
  ["s.replace_char(97, Vector3i(1, 2, 3))", ["Cannot pass a value of type \"Vector3i\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Vector3i\"."]],
  ["s.replace_char(97, null)", ["Cannot pass a value of type \"null\" as \"int\".", "Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"null\"."]],
  ["s.replace_char(97, [1])", ["Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Array\"."]],
  ["s.replace_char(97, {\"a\": 1})", ["Invalid argument for \"replace_char()\" function: argument 2 should be \"int\" but is \"Dictionary\"."]],
  ["s.replace_char()", ["Too few arguments for \"replace_char()\" call. Expected at least 2 but received 0."]],
  ["s.replace_char(97, 97, 97)", ["Too many arguments for \"replace_char()\" call. Expected at most 2 but received 3."]],
  ["s.replace_chars(Color(1, 2, 3, 4), 97)", ["Cannot pass a value of type \"Color\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Color\"."]],
  ["s.replace_chars(Vector2(1, 2), 97)", ["Cannot pass a value of type \"Vector2\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Vector2\"."]],
  ["s.replace_chars(Vector2i(1, 2), 97)", ["Cannot pass a value of type \"Vector2i\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Vector2i\"."]],
  ["s.replace_chars(Vector3(1, 2, 3), 97)", ["Cannot pass a value of type \"Vector3\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Vector3\"."]],
  ["s.replace_chars(Vector3i(1, 2, 3), 97)", ["Cannot pass a value of type \"Vector3i\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Vector3i\"."]],
  ["s.replace_chars(true, 97)", ["Cannot pass a value of type \"bool\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"bool\"."]],
  ["s.replace_chars(1.5, 97)", ["Cannot pass a value of type \"float\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"float\"."]],
  ["s.replace_chars(1, 97)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.replace_chars(null, 97)", ["Cannot pass a value of type \"null\" as \"String\".", "Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"null\"."]],
  ["s.replace_chars([1], 97)", ["Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["s.replace_chars({\"a\": 1}, 97)", ["Invalid argument for \"replace_chars()\" function: argument 1 should be \"String\" but is \"Dictionary\"."]],
  ["s.replace_chars(\"a\", Color(1, 2, 3, 4))", ["Cannot pass a value of type \"Color\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Color\"."]],
  ["s.replace_chars(\"a\", &\"a\")", ["Cannot pass a value of type \"StringName\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"StringName\"."]],
  ["s.replace_chars(\"a\", \"a\")", ["Cannot pass a value of type \"String\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"String\"."]],
  ["s.replace_chars(\"a\", ^\"a\")", ["Cannot pass a value of type \"NodePath\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"NodePath\"."]],
  ["s.replace_chars(\"a\", Vector2(1, 2))", ["Cannot pass a value of type \"Vector2\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Vector2\"."]],
  ["s.replace_chars(\"a\", Vector2i(1, 2))", ["Cannot pass a value of type \"Vector2i\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Vector2i\"."]],
  ["s.replace_chars(\"a\", Vector3(1, 2, 3))", ["Cannot pass a value of type \"Vector3\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Vector3\"."]],
  ["s.replace_chars(\"a\", Vector3i(1, 2, 3))", ["Cannot pass a value of type \"Vector3i\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Vector3i\"."]],
  ["s.replace_chars(\"a\", null)", ["Cannot pass a value of type \"null\" as \"int\".", "Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"null\"."]],
  ["s.replace_chars(\"a\", [1])", ["Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Array\"."]],
  ["s.replace_chars(\"a\", {\"a\": 1})", ["Invalid argument for \"replace_chars()\" function: argument 2 should be \"int\" but is \"Dictionary\"."]],
  ["s.replace_chars()", ["Too few arguments for \"replace_chars()\" call. Expected at least 2 but received 0."]],
  ["s.replace_chars(\"a\", 97, 97)", ["Too many arguments for \"replace_chars()\" call. Expected at most 2 but received 3."]],
  ["s.to_multibyte_char_buffer(Color(1, 2, 3, 4))", ["Cannot pass a value of type \"Color\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Color\"."]],
  ["s.to_multibyte_char_buffer(Vector2(1, 2))", ["Cannot pass a value of type \"Vector2\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Vector2\"."]],
  ["s.to_multibyte_char_buffer(Vector2i(1, 2))", ["Cannot pass a value of type \"Vector2i\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Vector2i\"."]],
  ["s.to_multibyte_char_buffer(Vector3(1, 2, 3))", ["Cannot pass a value of type \"Vector3\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Vector3\"."]],
  ["s.to_multibyte_char_buffer(Vector3i(1, 2, 3))", ["Cannot pass a value of type \"Vector3i\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Vector3i\"."]],
  ["s.to_multibyte_char_buffer(true)", ["Cannot pass a value of type \"bool\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"bool\"."]],
  ["s.to_multibyte_char_buffer(1.5)", ["Cannot pass a value of type \"float\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"float\"."]],
  ["s.to_multibyte_char_buffer(1)", ["Cannot pass a value of type \"int\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"int\"."]],
  ["s.to_multibyte_char_buffer(null)", ["Cannot pass a value of type \"null\" as \"String\".", "Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"null\"."]],
  ["s.to_multibyte_char_buffer([1])", ["Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["s.to_multibyte_char_buffer({\"a\": 1})", ["Invalid argument for \"to_multibyte_char_buffer()\" function: argument 1 should be \"String\" but is \"Dictionary\"."]],
  ["s.to_multibyte_char_buffer()", []],
  ["s.to_multibyte_char_buffer(\"a\", 97)", ["Too many arguments for \"to_multibyte_char_buffer()\" call. Expected at most 1 but received 2."]],
];

describe("五名 String 方法的元数与形参拒", () => {
  it("逐格对引擎", async () => {
    for (const [expr, want] of CELLS) eq(expr, "五名那一形", (await msgs(expr)).join("\n"), want.join("\n"));
  });
});

