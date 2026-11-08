import { describe, expect, it } from "vitest";
import { attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import type { Variant } from "@gds2js/runtime/runtime/tags";

const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const FILE = nativeClass("FileAccess");

describe("runtime/file access enum face", () => {
  it("compression, mode and unix flags", () => {
    expect(attribute(FILE, "COMPRESSION_FASTLZ").v).toBe(0);
    expect(attribute(FILE, "COMPRESSION_DEFLATE").v).toBe(1);
    expect(attribute(FILE, "COMPRESSION_ZSTD").v).toBe(2);
    expect(attribute(FILE, "COMPRESSION_GZIP").v).toBe(3);
    expect(attribute(FILE, "COMPRESSION_BROTLI").v).toBe(4);
    expect(attribute(FILE, "READ").v).toBe(1);
    expect(attribute(FILE, "WRITE").v).toBe(2);
    expect(attribute(FILE, "READ_WRITE").v).toBe(3);
    expect(attribute(FILE, "WRITE_READ").v).toBe(7);
    expect(attribute(FILE, "UNIX_EXECUTE_OTHER").v).toBe(1);
    expect(attribute(FILE, "UNIX_WRITE_OTHER").v).toBe(2);
    expect(attribute(FILE, "UNIX_READ_OTHER").v).toBe(4);
    expect(attribute(FILE, "UNIX_EXECUTE_GROUP").v).toBe(8);
    expect(attribute(FILE, "UNIX_WRITE_GROUP").v).toBe(16);
    expect(attribute(FILE, "UNIX_READ_GROUP").v).toBe(32);
    expect(attribute(FILE, "UNIX_EXECUTE_OWNER").v).toBe(64);
    expect(attribute(FILE, "UNIX_WRITE_OWNER").v).toBe(128);
    expect(attribute(FILE, "UNIX_READ_OWNER").v).toBe(256);
    expect(attribute(FILE, "UNIX_RESTRICTED_DELETE").v).toBe(512);
    expect(attribute(FILE, "UNIX_SET_GROUP_ID").v).toBe(1024);
    expect(attribute(FILE, "UNIX_SET_USER_ID").v).toBe(2048);
  });
});
