/**
 * 我们不支持的特性。缺功能，用户看得见 —— 绝不静默降级。
 * 项目红线：宁可响，不能悄悄跑出个结果。
 */
export class UnsupportedError extends Error {
  override name = "UnsupportedError";

  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Godot 自己在运行时也会炸的情况（例如整数除零）。 */
export class GodotRuntimeError extends Error {
  override name = "GodotRuntimeError";

  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
