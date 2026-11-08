import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GBytes } from "../bytes/packed";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { md5Bytes } from "../../md5";
import { sha1Bytes, sha256Bytes } from "../../digest";

const ERR_OK = 0;
const ERR_UNAVAILABLE = 2;
const ERR_UNCONFIGURED = 3;

export class GdHashingContext extends GdScriptObject {
  kind: number | null = null;
  chunks: number[] = [];

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "start") {
      const t = args[0];
      if (t === undefined || (t.t !== Tag.INT && t.t !== Tag.FLOAT)) throw new UnsupportedError("hashing-arg", "HashingContext.start() 只量过 int");
      const kind = Math.trunc(Number(t.v));
      if (kind !== 0 && kind !== 1 && kind !== 2) return V.int(ERR_UNAVAILABLE);
      this.kind = kind;
      this.chunks = [];
      return V.int(ERR_OK);
    }
    if (name === "update") {
      const chunk = args[0];
      if (chunk === undefined || chunk.t !== Tag.OBJECT || !(chunk.v instanceof GBytes)) throw new UnsupportedError("hashing-arg", "HashingContext.update() 只量过 PackedByteArray");
      if (this.kind === null) return V.int(ERR_UNCONFIGURED);
      for (const b of (chunk.v as GBytes).raw()) this.chunks.push(Number(b) & 255);
      return V.int(ERR_OK);
    }
    if (name === "finish") {
      if (this.kind === null) return V.object(new GBytes([], "byte"));
      const kind = this.kind;
      const data = this.chunks;
      this.kind = null;
      this.chunks = [];
      if (kind === 0) return V.object(new GBytes(hexToBytes(md5Bytes(new Uint8Array(data))), "byte"));
      return V.object(new GBytes(kind === 1 ? sha1Bytes(data) : sha256Bytes(data), "byte"));
    }
    return null;
  }
}

function hexToBytes(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

export function hashingContextMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdHashingContext).__gdDispatch(name, args);
}

registerEngineCtor("HashingContext", () => new GdHashingContext());
