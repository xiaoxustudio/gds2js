import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GBytes } from "../bytes/packed";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { Aes } from "../../aes";

const ERR_OK = 0;
const ERR_INVALID_PARAMETER = 31;

export class GdAesContext extends GdScriptObject {
  cipher: Aes | null = null;
  mode = 0;
  iv: number[] = [];

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "start") {
      const modeArg = args[0];
      const keyArg = args[1];
      const ivArg = args[2];
      if (modeArg === undefined || (modeArg.t !== Tag.INT && modeArg.t !== Tag.FLOAT)) throw new UnsupportedError("aes-arg", "AESContext.start() 的模式只量过 int");
      if (keyArg === undefined || keyArg.t !== Tag.OBJECT || !(keyArg.v instanceof GBytes)) throw new UnsupportedError("aes-arg", "AESContext.start() 的 key 只量过 PackedByteArray");
      const mode = Math.trunc(Number(modeArg.v));
      if (mode < 0 || mode > 3) return V.int(ERR_INVALID_PARAMETER);
      const key = (keyArg.v as GBytes).raw().map((b) => Number(b) & 255);
      if (key.length !== 16 && key.length !== 32) return V.int(ERR_INVALID_PARAMETER);
      const iv = ivArg === undefined || ivArg.t !== Tag.OBJECT || !(ivArg.v instanceof GBytes)
        ? []
        : (ivArg.v as GBytes).raw().map((b) => Number(b) & 255);
      if (mode >= 2 && iv.length !== 16) return V.int(ERR_INVALID_PARAMETER);
      this.cipher = new Aes(key);
      this.mode = mode;
      this.iv = mode >= 2 ? iv : [];
      return V.int(ERR_OK);
    }
    if (name === "update") {
      const srcArg = args[0];
      if (srcArg === undefined || srcArg.t !== Tag.OBJECT || !(srcArg.v instanceof GBytes)) throw new UnsupportedError("aes-arg", "AESContext.update() 只量过 PackedByteArray");
      if (this.cipher === null) return V.object(new GBytes([], "byte"));
      const src = (srcArg.v as GBytes).raw().map((b) => Number(b) & 255);
      if (src.length % 16 !== 0) return V.object(new GBytes([], "byte"));
      const out: number[] = [];
      for (let off = 0; off < src.length; off += 16) {
        const block = src.slice(off, off + 16);
        if (this.mode === 0) {
          out.push(...(this.cipher as Aes).encryptBlock(block));
        } else if (this.mode === 1) {
          out.push(...(this.cipher as Aes).decryptBlock(block));
        } else if (this.mode === 2) {
          const mixed = block.map((b, i) => b ^ (this.iv[i] as number));
          const ct = (this.cipher as Aes).encryptBlock(mixed);
          this.iv = ct.slice();
          out.push(...ct);
        } else {
          const pt = (this.cipher as Aes).decryptBlock(block);
          out.push(...pt.map((b, i) => b ^ (this.iv[i] as number)));
          this.iv = block.slice();
        }
      }
      return V.object(new GBytes(out, "byte"));
    }
    if (name === "get_iv_state") {
      if (this.mode >= 2 && this.iv.length === 16) return V.object(new GBytes(this.iv.slice(), "byte"));
      return V.object(new GBytes([], "byte"));
    }
    if (name === "finish") {
      this.cipher = null;
      this.iv = [];
      return V.nil();
    }
    return null;
  }
}

export function aesContextMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdAesContext).__gdDispatch(name, args);
}

registerEngineCtor("AESContext", () => new GdAesContext());
