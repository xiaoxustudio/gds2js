// 由 tools/ops-check.ts 机械搬迁：region 940-956。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { md5Hex } from "@gds2js/runtime/runtime/md5";

describe("runtime/md5", () => {
  it("077 · md5 空串", async () => {
    eq("077", "md5 空串", md5Hex(""), "d41d8cd98f00b204e9800998ecf8427e");
    eq("077", "md5 abc", md5Hex("abc"), "900150983cd24fb0d6963f7d28e17f72");
    eq("077", "md5 走 UTF-8 字节", md5Hex("中文"), "a7bac2239fcdcb3a067903d8077c4a07");
    eq("077", "md5 64 字节分块边界", md5Hex("a".repeat(64)), "014842d480b571495a4a0363793f7367");
  });
});
