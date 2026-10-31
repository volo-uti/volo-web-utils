import { afterEach, describe, expect, it, vi } from "vitest";

async function loadVLog(nodeEnv: string) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", nodeEnv);
  return (await import("./v-log")).VLog;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("VLog in development", () => {
  it("routes each level to the matching console method", async () => {
    const VLog = await loadVLog("development");
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    VLog.debug("d");
    VLog.info("i");
    VLog.warn("w");
    VLog.error("e");
    expect(debug).toHaveBeenCalledWith("d");
    expect(info).toHaveBeenCalledWith("i");
    expect(warn).toHaveBeenCalledWith("w");
    expect(error).toHaveBeenCalledWith("e");
  });
  it("prefixes the title in brackets", async () => {
    const VLog = await loadVLog("development");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    VLog.info("loaded", "Auth");
    VLog.warn("slow", "Net");
    VLog.debug("x", "T");
    expect(info).toHaveBeenCalledWith("[Auth] loaded");
    expect(warn).toHaveBeenCalledWith("[Net] slow");
    expect(debug).toHaveBeenCalledWith("[T] x");
  });
  it("error accepts an Error, a string or any value", async () => {
    const VLog = await loadVLog("development");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    VLog.error(new Error("boom"), "Api");
    VLog.error(42);
    expect(error).toHaveBeenNthCalledWith(1, expect.stringMatching(/^\[Api\] Error: boom\n\s+at /));
    expect(error).toHaveBeenNthCalledWith(2, "42");
  });
  it("error keeps the stack and the cause of an Error", async () => {
    const VLog = await loadVLog("development");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const inner = new Error("inner");
    VLog.error(new Error("outer", { cause: inner }));
    const text = String(error.mock.calls[0]?.[0]);
    expect(text).toContain("Error: outer");
    expect(text).toContain("Caused by: ");
    expect(text).toContain("Error: inner");
  });
  it("error prints the content of a plain object", async () => {
    const VLog = await loadVLog("development");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    VLog.error({ status: 500 });
    expect(error).toHaveBeenCalledWith('{"status":500}');
  });
  it("error never throws on values with no usable toString", async () => {
    const VLog = await loadVLog("development");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => VLog.error(Object.create(null))).not.toThrow();
    expect(() => VLog.error(cyclic)).not.toThrow();
    expect(() => VLog.error(10n)).not.toThrow();
    expect(() => VLog.error(Symbol("s"))).not.toThrow();
    expect(() =>
      VLog.error({
        toJSON() {
          throw new Error("no json");
        },
        toString() {
          throw new Error("no string");
        },
      }),
    ).not.toThrow();
    expect(() => VLog.error(undefined)).not.toThrow();
    expect(error).toHaveBeenCalledTimes(6);
    expect(error).toHaveBeenNthCalledWith(1, "{}");
    expect(error).toHaveBeenNthCalledWith(3, "10");
    expect(error).toHaveBeenNthCalledWith(5, "[object Object]");
  });
});

describe("VLog without a process global", () => {
  it("logs, because only NODE_ENV=production silences it", async () => {
    vi.resetModules();
    vi.stubGlobal("process", undefined);
    try {
      const { VLog } = await import("./v-log");
      const info = vi.spyOn(console, "info").mockImplementation(() => {});
      VLog.info("x");
      expect(info).toHaveBeenCalledWith("x");
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("reads NODE_ENV on each call, not once at import", async () => {
    const VLog = await loadVLog("production");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    VLog.info("silent");
    vi.stubEnv("NODE_ENV", "development");
    VLog.info("loud");
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith("loud");
  });
});

describe("VLog in production", () => {
  it("stays silent", async () => {
    const VLog = await loadVLog("production");
    const spies = (["debug", "info", "warn", "error"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    VLog.debug("d");
    VLog.info("i");
    VLog.warn("w");
    VLog.error("e");
    spies.forEach((s) => expect(s).not.toHaveBeenCalled());
  });
});
