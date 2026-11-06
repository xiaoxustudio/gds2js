import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { Signal } from "../identity/signal";
import { GdNodeObject, registerEngineCtor } from "./node";

export class GdTimer extends GdNodeObject {
  waitTime = 1;
  oneShot = false;
  autostart = false;
  readonly timeout = V.object(new Signal("timeout"));
  timeLeft = 0;
  stopped = true;

  start(sec?: number): void {
    if (sec !== undefined) this.waitTime = sec;
    this.timeLeft = this.waitTime;
    this.stopped = false;
  }

  stop(): void {
    this.stopped = true;
    this.timeLeft = 0;
  }

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    return timerMethod(this, name, args);
  }

  step(dt: number): void {
    if (this.stopped) return;
    this.timeLeft -= dt;
    if (this.timeLeft > 0) return;
    if (this.oneShot) {
      this.timeLeft = 0;
      this.stopped = true;
    } else this.timeLeft = this.waitTime;
    (this.timeout.v as Signal).emit();
  }
}

export function timerRead(target: unknown, name: string): Variant | null {
  const t = target as GdTimer;
  if (name === "wait_time") return V.float(t.waitTime);
  if (name === "one_shot") return V.bool(t.oneShot);
  if (name === "autostart") return V.bool(t.autostart);
  if (name === "time_left") return V.float(t.timeLeft);
  if (name === "timeout") return t.timeout;
  return null;
}

export function timerWrite(target: unknown, name: string, value: Variant): boolean {
  const t = target as GdTimer;
  if (name === "wait_time") {
    if (value.t !== Tag.INT && value.t !== Tag.FLOAT) throw new UnsupportedError("timer-arg", "Timer.wait_time 只量过数");
    t.waitTime = Number(value.v);
    return true;
  }
  if (name === "one_shot") {
    if (value.t !== Tag.BOOL) throw new UnsupportedError("timer-arg", "Timer.one_shot 只量过 bool");
    t.oneShot = value.v === true;
    return true;
  }
  if (name === "autostart") {
    if (value.t !== Tag.BOOL) throw new UnsupportedError("timer-arg", "Timer.autostart 只量过 bool");
    t.autostart = value.v === true;
    return true;
  }
  return false;
}

export function timerMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  const t = target as GdTimer;
  switch (name) {
    case "start": {
      const sec = args[0] === undefined ? undefined : Number(args[0].v);
      t.start(sec);
      return V.nil();
    }
    case "stop":
      t.stop();
      return V.nil();
    case "is_stopped":
      return V.bool(t.stopped);
    case "set_wait_time":
      t.waitTime = Number((args[0] as Variant).v);
      return V.nil();
    case "get_wait_time":
      return V.float(t.waitTime);
    case "set_one_shot":
      t.oneShot = (args[0] as Variant).v === true;
      return V.nil();
    case "is_one_shot":
      return V.bool(t.oneShot);
    case "set_autostart":
      t.autostart = (args[0] as Variant).v === true;
      return V.nil();
    case "has_autostart":
      return V.bool(t.autostart);
    default:
      return null;
  }
}

export function timerStart(target: unknown): void {
  const t = target as GdTimer;
  if (t.autostart) t.start();
}

registerEngineCtor("Timer", () => new GdTimer());

export function timerStep(target: unknown, dt: number): void {
  (target as GdTimer).step(dt);
}
