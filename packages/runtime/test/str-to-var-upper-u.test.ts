// `str_to_var()` 的 `\U` 与 `\u0000`：越界与 NUL 那两支引擎除了给值还往 stderr 打一句
// `Unicode parsing error …`，那句进不了 golden，所以这几格只进 ops。
// 读数在 `tmp/probe-str-to-var-u/`（u.log / u2.log / u3.log / u4.log），语料 245 钉的是不报警的那一批。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { S } from "./support/variants";
import { strToVar } from "@gds2js/runtime/runtime/values";

/** 引号包起来喂进去，读回「类型 | 码点列 | utf8 hex」三栏。 */
const cell = (raw: string): string => {
  const got = strToVar(S(`"${raw}"`));
  if ((typeOf(got) as { v: number }).v !== 4) return "0|not-string";
  const s = got.v as string;
  const cps = Array.from(s)
    .map((c) => String((c as string).codePointAt(0)))
    .join(",");
  return `4|${cps}|${Buffer.from(s, "utf8").toString("hex")}`;
};

describe("runtime/str_to_var · \\U 吃六位与 NUL 折 U+FFFD", () => {
  it("245 · \\U 的位数、越界与代理区（四批探头共 45 格里的代表）", async () => {
    eq("245", "\\U 吃满六位：000041 就是 A", cell("\\U000041"), "4|65|41");
    eq("245", "八位写法只领前六位，剩下的照字面留着（u01）", cell("\\U0001F600"), "4|502,48,48|c7b63030");
    eq("245", "尾数留在串中间也一样（u14：a + U+01F6 + 00 + b）", cell("a\\U0001F600b"), "4|97,502,48,48,98|61c7b6303062");
    eq("245", "六位满档 U+10FFFF 收（v03）", cell("\\U10FFFF"), "4|1114111|f48fbfbf");
    eq("245", "超过 U+10FFFF 折 U+FFFD，且只折那六位（v04：110000）", cell("\\U110000"), "4|65533|efbfbd");
    eq("245", "七位 F 的越界折 U+FFFD、多出来的 F 留下（v12）", cell("\\UFFFFFFF"), "4|65533,70|efbfbd46");
    eq("245", "六位里读到代理区整串作废（v01/v02：00D800 与 00DFFF）", `${cell("\\U00D800")}|${cell("\\U00DFFF00")}`, "0|not-string|0|not-string");
    eq("245", "D8 与 DFFF 之间的边界各自独立（u08 读到 0000D8 是 U+00D8，不是代理区）", cell("\\U0000D8"), "4|216|c398");
    eq("245", "不足六位不作数（u04 四位、u05 两位、v08 空、v09 五位全 null）", `${cell("\\U0041")}|${cell("\\U41")}|${cell("\\U")}|${cell("\\U0001F")}`, "0|not-string|0|not-string|0|not-string|0|not-string");
    eq("245", "六位里夹一个非十六进制位也是整串作废（u07：0000G1）", cell("\\U0000G1"), "0|not-string");
    eq("245", "十六进制位大小写都收（v05 的 e9 与 v06 的 E9 都是 é）", `${cell("\\U0000e9")}|${cell("\\U0000E9")}`, "4|233|c3a9|4|233|c3a9");
    eq("245", "读到的值就是值：001F60 给 U+1F60、010000 给 U+10000、002000 给 U+2000", `${cell("\\U001F60")}|${cell("\\U010000")}|${cell("\\U002000")}`, "4|8032|e1bda0|4|65536|f0908080|4|8192|e28080");
  });

  it("245 · NUL 那两支：\\u0000 与 \\U000000 都落成 U+FFFD", async () => {
    eq("245", "\\u0000 给 U+FFFD（w01：长度 1、字节 ef bf bd）", cell("\\u0000"), "4|65533|efbfbd");
    eq("245", "\\u0000 夹在中间也只换那一位（w02）", cell("x\\u0000y"), "4|120,65533,121|78efbfbd79");
    eq("245", "\\U000000 与 \\u0000 同一条（w04）", cell("\\U000000"), "4|65533|efbfbd");
    eq("245", "码点 1 到 127 不折（x01/x02/x12/x13）", `${cell("\\u0001")}|${cell("\\u0008")}|${cell("\\u0010")}|${cell("\\u007F")}`, "4|1|01|4|8|08|4|16|10|4|127|7f");
    eq("245", "非字符 U+FFFE 与 U+FFFF 照收（x07/x08/x09/x10）", `${cell("\\uFFFE")}|${cell("\\uFFFF")}|${cell("\\U00FFFE")}|${cell("\\U00FFFF")}`, "4|65534|efbfbe|4|65535|efbfbf|4|65534|efbfbe|4|65535|efbfbf");
    eq("245", "四位那支的代理区照旧整串作废（x15）", cell("\\uD800"), "0|not-string");
    eq("245", "读回来的串与直接写那支字符串同值（u02：\\U000041 就是 A）", String((strToVar(S('"\\U000041"')).v as string) === (strToVar(S('"A"')).v as string)), "true");
  });
});
