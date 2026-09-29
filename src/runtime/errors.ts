export class UnsupportedError extends Error {
  override name = "UnsupportedError";

  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export class GodotRuntimeError extends Error {
  override name = "GodotRuntimeError";

  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
