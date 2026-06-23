import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertContains(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `${label} should contain ${needle}`);
}

function assertNotContains(source: string, needle: string, label: string) {
  assert.ok(!source.includes(needle), `${label} should not contain ${needle}`);
}

console.log("=== Testing authorization boundary source contracts ===");

const clientDashboardPage = read("app/dashboard/page.tsx");
assertContains(clientDashboardPage, 'redirect("/login")', "client dashboard");
assertContains(clientDashboardPage, "isOwner(user.email)", "client dashboard");
assertContains(clientDashboardPage, 'redirect("/gio_dash")', "client dashboard");
assertContains(clientDashboardPage, "ClientDashboardView", "client dashboard");
assertNotContains(clientDashboardPage, "getMasterDashboardOverview", "client dashboard");

const ownerLayout = read("app/gio_dash/layout.tsx");
assertContains(ownerLayout, 'redirect("/login")', "owner dashboard layout");
assertContains(ownerLayout, "!isOwner(email)", "owner dashboard layout");
assertContains(ownerLayout, 'redirect("/dashboard")', "owner dashboard layout");

const ownerApiRoutes = [
  "app/api/dashboard/projects/route.ts",
  "app/api/dashboard/leads/route.ts",
  "app/api/dashboard/money/route.ts",
  "app/api/dashboard/decisions/route.ts",
  "app/api/dashboard/system-links/route.ts",
  "app/api/photos/route.ts",
  "app/api/photos/upload/route.ts",
];

for (const route of ownerApiRoutes) {
  const source = read(route);
  assertContains(source, "requireOwnerClient", route);
}

const clientDashboardFiles = fs
  .readdirSync(path.join(root, "components/app/client_dashboard"))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => `components/app/client_dashboard/${file}`);

const forbiddenClientSurfaceStrings = [
  "dashboard_leads",
  "dashboard_money_entries",
  "dashboard_decisions",
  "dashboard_system_links",
  "getMasterDashboardOverview",
  "requireOwnerClient",
  "service_role",
  "PRIVATE KEY",
];

for (const file of clientDashboardFiles) {
  const source = read(file);
  for (const forbidden of forbiddenClientSurfaceStrings) {
    assertNotContains(source, forbidden, file);
  }
}

console.log("Authorization boundary source contracts passed");
