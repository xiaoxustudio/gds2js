import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GBytes } from "../bytes/packed";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { md5Bytes } from "../../md5";
import { sha1Bytes, sha256Bytes } from "../../digest";

const ERR_OK = 0;
const ERR_INVALID_DATA = 30;
const ERR_INVALID_PARAMETER = 31;

function digestOf(kind: number, data: number[]): number[] {
  if (kind === 0) {
    const hex = md5Bytes(new Uint8Array(data));
    const out: number[] = [];
    for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
    return out;
  }
  return kind === 1 ? sha1Bytes(data) : sha256Bytes(data);
}

export class GdHmacContext extends GdScriptObject {
  kind: number | null = null;
  key: number[] = [];
  chunks: number[] = [];

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "start") {
      const t = args[0];
      const key = args[1];
      if (t === undefined || (t.t !== Tag.INT && t.t !== Tag.FLOAT)) throw new UnsupportedError("hmac-arg", "HMACContext.start() 的类型只量过 int");
      if (key === undefined || key.t !== Tag.OBJECT || !(key.v instanceof GBytes)) throw new UnsupportedError("hmac-arg", "HMACContext.start() 的 key 只量过 PackedByteArray");
      const kind = Math.trunc(Number(t.v));
      if (kind !== 1 && kind !== 2) return V.int(ERR_INVALID_PARAMETER);
      this.kind = kind;
      this.key = (key.v as GBytes).raw().map((b) => Number(b) & 255);
      this.chunks = [];
      return V.int(ERR_OK);
    }
    if (name === "update") {
      const data = args[0];
      if (data === undefined || data.t !== Tag.OBJECT || !(data.v instanceof GBytes)) throw new UnsupportedError("hmac-arg", "HMACContext.update() 只量过 PackedByteArray");
      if (this.kind === null) return V.int(ERR_INVALID_DATA);
      for (const b of (data.v as GBytes).raw()) this.chunks.push(Number(b) & 255);
      return V.int(ERR_OK);
    }
    if (name === "finish") {
      if (this.kind === null) return V.object(new GBytes([], "byte"));
      const kind = this.kind;
      const key = this.key.length > 64 ? digestOf(kind, this.key) : this.key.slice();
      const inner = key.concat(new Array<number>(64 - key.length).fill(0)).map((b) => b ^ 0x36);
      const outer = key.concat(new Array<number>(64 - key.length).fill(0)).map((b) => b ^ 0x5c);
      const innerDigest = digestOf(kind, inner.concat(this.chunks));
      const result = digestOf(kind, outer.concat(innerDigest));
      this.kind = null;
      this.key = [];
      this.chunks = [];
      return V.object(new GBytes(result, "byte"));
    }
    return null;
  }
}

export function hmacContextMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdHmacContext).__gdDispatch(name, args);
}

registerEngineCtor("HMACContext", () => new GdHmacContext());
