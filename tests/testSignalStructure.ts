import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const globals = read("app/globals.css");
const layout = read("app/layout.tsx");
const themeProvider = read("components/design-system/ThemeProvider.tsx");
const themeToggle = read("components/design-system/ThemeToggle.tsx");
const publicHeader = read("components/site/PublicHeader.tsx");
const dashboardView = read("components/app/client_dashboard/ClientDashboardView.tsx");

console.log("=== Testing Signal & Structure contracts ===");

for (const token of [
  "--color-canvas",
  "--color-surface",
  "--color-surface-raised",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-subtle",
  "--color-border",
  "--color-border-strong",
  "--color-action-primary",
  "--color-action-on-primary",
  "--color-signal-mint",
  "--color-signal-violet",
  "--color-signal-warning",
  "--color-signal-danger",
  "--color-signal-info",
]) {
  assert.ok(globals.includes(token), `Missing semantic token ${token}`);
}

assert.ok(layout.includes("ThemeProvider"), "Root layout must wrap the app in ThemeProvider");
assert.ok(!layout.includes('className="dark"'), "Root layout must not force dark mode");
assert.ok(themeProvider.includes('attribute="class"'), "ThemeProvider must use class attribute mode");
assert.ok(themeProvider.includes('defaultTheme="system"'), "ThemeProvider must default to system");
assert.ok(themeProvider.includes("disableTransitionOnChange"), "Theme changes should avoid transition flashes");
assert.ok(themeToggle.includes("resolvedTheme"), "ThemeToggle must use resolvedTheme");
assert.ok(themeToggle.includes("mounted"), "ThemeToggle must gate icon rendering until mounted");
assert.ok(themeToggle.includes("aria-label"), "ThemeToggle must expose an accessible name");
assert.ok(publicHeader.includes('pathname?.startsWith("/gio_dash")'), "Public header must not render inside owner dashboard");
assert.ok(publicHeader.includes('pathname?.startsWith("/dashboard")'), "Public header must not render inside client dashboard");
assert.ok(dashboardView.includes("Client access / Project scoped"), "Client shell must document project-scoped access");

console.log("Signal & Structure contracts passed");
