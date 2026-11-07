export type CallContext = "callable" | "call" | null;

let current: CallContext = null;

export function withCallContext<T>(kind: CallContext, fn: () => T): T {
  const saved = current;
  current = kind;
  try {
    return fn();
  } finally {
    current = saved;
  }
}

export function callContext(): CallContext {
  return current;
}
