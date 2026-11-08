import { createPublicKey, verify as nodeVerify, X509Certificate } from "node:crypto";
import { describe, expect, it } from "vitest";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import type { GdCryptoKey, GdX509Certificate } from "../src/runtime/class/host/crypto";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const bytes = (items: number[]): Variant => V.object(GBytes.of(items, "byte"));
const raw = (v: Variant): number[] => (v.v as GBytes).raw().map((b) => Number(b) & 255);
const hex = (v: Variant): string => raw(v).map((b) => b.toString(16).padStart(2, "0")).join("");
const ascii = (s: string): number[] => [...new TextEncoder().encode(s)];

const sha256abc = [...Buffer.from("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", "hex")];

describe("runtime/crypto face", () => {
  it("hmac, compare and random", () => {
    const c = engineClassNew("Crypto").v;
    expect(hex(method(c, "hmac_digest", [V.int(2), bytes(ascii("key")), bytes(ascii("msg"))]))).toBe("2d93cbc1be167bcb1637a4a23cbff01a7878f0c50ee833954ea5221bb1b8c628");
    expect(hex(method(c, "hmac_digest", [V.int(1), bytes(ascii("key")), bytes(ascii("msg"))]))).toBe("102900b72b7bf1031eec76b4804b66052376896b");
    expect(method(c, "hmac_digest", [V.int(0), bytes(ascii("key")), bytes(ascii("msg"))]).t).toBe(Tag.OBJECT);
    expect(raw(method(c, "hmac_digest", [V.int(0), bytes(ascii("key")), bytes(ascii("msg"))])).length).toBe(0);
    expect(method(c, "constant_time_compare", [bytes([1, 2, 3]), bytes([1, 2, 3])]).v).toBe(true);
    expect(method(c, "constant_time_compare", [bytes([1, 2]), bytes([1, 2, 3])]).v).toBe(false);
    expect(raw(method(c, "generate_random_bytes", [V.int(8)])).length).toBe(8);
  });

  it("rsa encrypt, sign and certificate", () => {
    const c = engineClassNew("Crypto").v;
    const keyVariant = method(c, "generate_rsa", [V.int(1024)]);
    expect(keyVariant.t).toBe(Tag.OBJECT);
    const key = keyVariant.v as GdCryptoKey;
    expect(key.rsa.sizeBytes).toBe(128);
    const cipher = method(c, "encrypt", [keyVariant, bytes(ascii("hello"))]);
    expect(raw(cipher).length).toBe(128);
    expect(hex(method(c, "decrypt", [keyVariant, cipher]))).toBe("68656c6c6f");
    expect(method(c, "decrypt", [keyVariant, bytes([0])]).t).toBe(Tag.OBJECT);
    const signature = method(c, "sign", [V.int(2), bytes(sha256abc), keyVariant]);
    expect(raw(signature).length).toBe(128);
    expect(method(c, "verify", [V.int(2), bytes(sha256abc), signature, keyVariant]).v).toBe(true);
    const tampered = sha256abc.slice();
    tampered[0] = (tampered[0] as number) ^ 1;
    expect(method(c, "verify", [V.int(2), bytes(tampered), signature, keyVariant]).v).toBe(false);

    const nBytes = Buffer.from(key.rsa.n.toString(16).padStart(256, "0"), "hex");
    const publicKey = createPublicKey({ key: { kty: "RSA", n: nBytes.toString("base64url"), e: "AQAB" }, format: "jwk" });
    expect(nodeVerify("sha256", Buffer.from("abc"), publicKey, Buffer.from(raw(signature)))).toBe(true);

    const cert = method(c, "generate_self_signed_certificate", [keyVariant, V.str("CN=test,O=org"), V.str("20240101000000"), V.str("20340101000000")]).v as GdX509Certificate;
    const nl = String.fromCharCode(10);
    const pem = "-----BEGIN CERTIFICATE-----" + nl + Buffer.from(cert.payload).toString("base64").match(/.{1,64}/g)!.join(nl) + nl + "-----END CERTIFICATE-----" + nl;
    const parsed = new X509Certificate(pem);
    expect(parsed.subject).toContain("CN=test");
    expect(parsed.subject).toContain("O=org");
    expect(parsed.verify(parsed.publicKey)).toBe(true);
  });
});
