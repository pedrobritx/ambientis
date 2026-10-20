import { afterEach, describe, expect, it, vi } from "vitest";
import { configuration } from "./server";

afterEach(() => vi.unstubAllEnvs());
describe("Supabase environment boundary", () => {
  function local() {
    vi.stubEnv("SUPABASE_URL", "http://127.0.0.1:54621");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_synthetic");
    vi.stubEnv("SUPABASE_LOCAL_MODE", "true");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");
  }
  it("allows an explicitly selected loopback development stack", () => {
    local();
    expect(configuration().url).toBe("http://127.0.0.1:54621");
  });
  it.each([
    ["SUPABASE_LOCAL_MODE", "false"],
    ["NODE_ENV", "production"],
    ["VERCEL", "1"],
    ["SUPABASE_URL", "http://example.com:54621"],
    ["SUPABASE_URL", "http://127.0.0.1:54621/path"],
    ["SUPABASE_PUBLISHABLE_KEY", "sb_secret_synthetic"],
    ["SUPABASE_PUBLISHABLE_KEY", "legacy-jwt"],
  ])("rejects unsafe local configuration %s=%s", (name, value) => {
    local();
    vi.stubEnv(name, value);
    expect(configuration).toThrow();
  });
  it("preserves the hosted publishable-key configuration", () => {
    local();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_URL", "https://synthetic.supabase.co");
    expect(configuration().url).toBe("https://synthetic.supabase.co");
  });
});
