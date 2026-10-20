import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3411",
    viewport: { width: 1440, height: 1024 },
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3411",
    url: "http://127.0.0.1:3411",
    reuseExistingServer: !process.env.CI,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  },
});
