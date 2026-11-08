import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GdScriptObject } from "../object/script-object";
import { registerEngineCtor } from "../object/node";
import { isCallableBox, type CallableBox } from "../identity/callable";
import { callCallableBox } from "../../method/callable";

export class GdMutex extends GdScriptObject {
  private depth = 0;

  override __gdDispatch(name: string, _args: Variant[]): Variant | null {
    if (name === "lock") {
      this.depth++;
      return V.nil();
    }
    if (name === "try_lock") {
      this.depth++;
      return V.bool(true);
    }
    if (name === "unlock") {
      if (this.depth > 0) this.depth--;
      return V.nil();
    }
    return null;
  }
}

export class GdSemaphore extends GdScriptObject {
  private count = 0;

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "post") {
      const v = args[0];
      const n = v === undefined ? 1 : v.t === Tag.INT || v.t === Tag.FLOAT ? Math.trunc(Number(v.v as number | bigint)) : 1;
      this.count += Math.max(0, n);
      return V.nil();
    }
    if (name === "try_wait") {
      if (this.count <= 0) return V.bool(false);
      this.count--;
      return V.bool(true);
    }
    if (name === "wait") {
      if (this.count > 0) this.count--;
      return V.nil();
    }
    return null;
  }
}

let nextThreadId = 1;

export class GdThread extends GdScriptObject {
  private worker: CallableBox | null = null;
  private started = false;
  private alive = false;
  private id = "0";

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    if (name === "start") {
      const cb = args[0];
      if (cb === undefined || !isCallableBox(cb.v)) throw new UnsupportedError("thread-arg", "Thread.start() 只量过 Callable");
      if (this.started) throw new UnsupportedError("thread-restart", "Thread.start() 在已启动的线程上没量过");
      this.worker = cb.v as CallableBox;
      this.started = true;
      this.alive = true;
      this.id = String(nextThreadId++);
      return V.int(0);
    }
    if (name === "wait_to_finish") {
      if (!this.started || this.worker === null) return V.nil();
      const result = callCallableBox(this.worker, []);
      this.worker = null;
      this.started = false;
      this.alive = false;
      this.id = "0";
      return result;
    }
    if (name === "is_started") return V.bool(this.started);
    if (name === "is_alive") return V.bool(this.alive);
    if (name === "is_main_thread") return V.bool(true);
    if (name === "get_id") return V.str(this.id);
    if (name === "set_thread_safety_checks_enabled") return V.nil();
    return null;
  }
}

export function mutexMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdMutex).__gdDispatch(name, args);
}

export function semaphoreMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdSemaphore).__gdDispatch(name, args);
}

export function threadMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  return (target as GdThread).__gdDispatch(name, args);
}

registerEngineCtor("Mutex", () => new GdMutex());
registerEngineCtor("Semaphore", () => new GdSemaphore());
registerEngineCtor("Thread", () => new GdThread());
