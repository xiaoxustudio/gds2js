/**
 * lambda 形参的默认值（S437）：读数 `tmp/probe-lamdef/{a1,c1,b1,b2,e1,e2,e4,e5}.gd` 与语料 382 十格逐字节 ——
 * 默认值在**调用那一刻**评、看得见排在前面的形参；元数那一句少给报必填数、多给报声明数。
 */
import { describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { callable } from "@gds2js/runtime/runtime/object";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";

const OPTS = { runtimeImport: "rt", hostImport: "host" };
const MOD = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;

async function verdict(src: string): Promise<string> {
  try {
    const ir = lower(await parseSource(src));
    const diags = analyze(ir);
    if (diags.length > 0) return `diag:${diags[0]!.message}`;
    return emitModule(ir, OPTS);
  } catch (e) {
    return e instanceof UnsupportedError ? `refuse:${e.code}` : `other:${e instanceof Error ? e.message : String(e)}`;
  }
}

async function emit(body: string): Promise<string> {
  const out = await verdict(MOD(body));
  expect(out.startsWith("diag:") || out.startsWith("refuse:") || out.startsWith("other:")).toBe(false);
  return out;
}

describe("lambda 默认值形参的发法", () => {
  it("尾部那一位带上 ?? 的式子，必填那位照旧", async () => {
    const code = await emit("\tvar f = func(a, b = 2): return a + b");
    expect(code.includes("const a = __a[0] as rt.Variant;")).toBe(true);
    expect(code.includes("const b = __a[1] as rt.Variant ?? rt.V.int(2);")).toBe(true);
  });

  it("盒子带上默认值形参数，元数句才有必填数可报", async () => {
    const twoOne = await emit("\tvar f = func(a, b = 2): return a + b");
    expect(twoOne.includes("}, 2, 1);")).toBe(true);
    const twoTwo = await emit("\tvar f = func(x = 1, y = x): return [x, y]");
    expect(twoTwo.includes("const y = __a[1] as rt.Variant ?? x;")).toBe(true);
    expect(twoTwo.includes("}, 2, 2);")).toBe(true);
  });

  it("没有默认值时第三参不发，产物与旧版一字一样", async () => {
    const plain = await emit("\tvar f = func(a, b): return a + b");
    expect(plain.includes("}, 2);")).toBe(true);
    expect(plain.includes("}, 2, 0);")).toBe(false);
  });

  it("默认值形参排在必填之前那一形仍拦", async () => {
    expect(await verdict(MOD("\tvar f = func(a = 1, b): return a"))).toBe("refuse:lambda-param-default");
  });

  it("默认值那一位直接放 lambda 的形况仍拦", async () => {
    expect(await verdict(MOD("\tvar f = func(x = func(): return 1): return x"))).toBe("refuse:lambda-param-default");
  });

  it("默认值往后看形参是解析期那句未声明", async () => {
    expect(await verdict(MOD("\tvar f = func(a = b, b = 1): return a"))).toBe('diag:Identifier "b" not declared in the current scope.');
  });
});

describe("带默认值的 lambda 盒子在运行期报的是必填数", () => {
  const lam = (defaultCount: number): ReturnType<typeof callable> => callable(() => V.nil(), 2, defaultCount);

  it("少给报必填数（`func(a, b = 2)` 给零支）", () => {
    let msg = "";
    try {
      method(lam(1), "call", []);
    } catch (e) {
      msg = e instanceof Error ? e.message : String(e);
    }
    expect(msg).toBe("Invalid call to function '<anonymous lambda>(lambda) (Callable)'. Expected 1 argument(s).");
  });

  it("多给报声明数（给三支）", () => {
    let msg = "";
    try {
      method(lam(1), "call", [V.int(1), V.int(2), V.int(3)]);
    } catch (e) {
      msg = e instanceof Error ? e.message : String(e);
    }
    expect(msg).toBe("Invalid call to function '<anonymous lambda>(lambda) (Callable)'. Expected 2 argument(s).");
  });

  it("两位都带默认值时零支照样调", () => {
    expect(() => method(lam(2), "call", [])).not.toThrow();
  });

  it("带默认值的 lambda 再 bind 那一形没实测过", () => {
    let code = "";
    try {
      method(lam(1), "bind", [V.int(1)]);
    } catch (e) {
      code = e instanceof UnsupportedError ? e.code : `other:${e instanceof Error ? e.message : String(e)}`;
    }
    expect(code).toBe("lambda-bind-default");
  });
});
