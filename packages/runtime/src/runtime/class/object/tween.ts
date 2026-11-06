import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { Signal } from "../identity/signal";
import { GVector2, vector2 } from "../vector/vector2";
import { GdScriptObject } from "./script-object";

type ReadHook = (target: Variant, prop: string) => Variant;
type WriteHook = (target: Variant, prop: string, value: Variant) => void;

let READ: ReadHook | null = null;
let WRITE: WriteHook | null = null;

export function registerTweenHooks(read: ReadHook, write: WriteHook): void {
  READ = read;
  WRITE = write;
}

type Step = {
  target: Variant;
  prop: string;
  from: Variant | null;
  to: Variant;
  duration: number;
  elapsed: number;
  delay: number;
  done: boolean;
};

function lerp(a: number, b: number, t: number): number {
  return Math.fround(a + (b - a) * t);
}

function interp(a: Variant, b: Variant, t: number): Variant {
  if ((a.t === Tag.INT || a.t === Tag.FLOAT) && (b.t === Tag.INT || b.t === Tag.FLOAT)) {
    const v = lerp(Number(a.v), Number(b.v), t);
    return a.t === Tag.INT && b.t === Tag.INT ? V.int(Math.round(v)) : V.float(v);
  }
  if (a.t === Tag.OBJECT && b.t === Tag.OBJECT && a.v instanceof GVector2 && b.v instanceof GVector2) {
    return vector2(lerp(a.v.x, b.v.x, t), lerp(a.v.y, b.v.y, t));
  }
  throw new UnsupportedError("tween-type", `tween_property 的 ${String(a.t)} → ${String(b.t)} 插值没量过`);
}

export class GdTween extends GdScriptObject {
  #steps: Step[] = [];
  #signal = V.object(new Signal("finished"));
  #running = true;
  #parallel = false;
  #loops = 0;
  #delay = 0;

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    switch (name) {
      case "tween_property": {
        const target = args[0];
        const prop = args[1];
        const to = args[2];
        const duration = args[3];
        if (target === undefined || prop === undefined || to === undefined || duration === undefined) {
          throw new UnsupportedError("tween-arity", "tween_property() 少了实参");
        }
        if (prop.t !== Tag.STRING && prop.t !== Tag.STRING_NAME) throw new UnsupportedError("tween-arg-type", "tween_property() 的属性名只量过字符串");
        if (duration.t !== Tag.INT && duration.t !== Tag.FLOAT) throw new UnsupportedError("tween-arg-type", "tween_property() 的时长只量过数");
        this.#steps.push({ target, prop: String(prop.v), from: null, to, duration: Number(duration.v), elapsed: 0, delay: this.#delay, done: false });
        this.#delay = 0;
        return V.object(this);
      }
      case "set_trans":
      case "set_ease":
      case "set_loops":
      case "chain":
      case "parallel":
      case "bind_node":
        if (name === "parallel") this.#parallel = true;
        if (name === "chain") this.#parallel = false;
        if (name === "set_loops" && args[0] !== undefined) this.#loops = Number(args[0].v);
        if (name === "set_trans" || name === "set_ease") return V.object(this);
        return V.object(this);
      case "set_delay": {
        const d = args[0];
        if (d === undefined || (d.t !== Tag.INT && d.t !== Tag.FLOAT)) throw new UnsupportedError("tween-arg-type", "set_delay() 只量过数");
        this.#delay = Number(d.v);
        return V.object(this);
      }
      case "kill":
        this.#running = false;
        this.#steps = [];
        return V.nil();
      case "is_running":
        return V.bool(this.#running);
      case "get_total_elapsed_time":
        return V.float(0);
      case "get_loops_left":
        return V.int(this.#loops);
      default:
        return null;
    }
  }

  get finished(): Variant {
    return this.#signal;
  }

  step(dt: number): void {
    if (!this.#running) return;
    for (const s of this.#steps) {
      if (s.done) continue;
      if (s.delay > 0) {
        s.delay -= dt;
        continue;
      }
      if (s.from === null) {
        if (READ === null) throw new UnsupportedError("tween-hook", "Tween 读写钩子未注册");
        s.from = READ(s.target, s.prop);
      }
      s.elapsed += dt;
      const t = s.duration <= 0 ? 1 : Math.min(1, s.elapsed / s.duration);
      if (WRITE === null || s.from === null) throw new UnsupportedError("tween-hook", "Tween 读写钩子未注册");
      WRITE(s.target, s.prop, interp(s.from, s.to, t));
      if (t >= 1) s.done = true;
      if (!this.#parallel) break;
    }
    if (this.#steps.every((s) => s.done)) {
      if (this.#loops > 0) {
        this.#loops -= 1;
        for (const s of this.#steps) {
          s.done = false;
          s.elapsed = 0;
          s.from = null;
        }
        return;
      }
      this.#running = false;
      (this.#signal.v as Signal).emit();
    }
  }
}
