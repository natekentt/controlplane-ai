// ControlPlane AI — Version check against npm registry

import https from "node:https";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getLocalVersion(): string {
  const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "..", "..", "package.json"), "utf8"));
  return pkg.version;
}

function fetchLatestVersion(packageName: string, timeoutMs = 3000): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://registry.npmjs.org/${packageName}/latest`,
      { timeout: timeoutMs, headers: { Accept: "application/json" } },
      (res) => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version ?? null);
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

function isNewer(latest: string, current: string): boolean {
  const l = latest.split(".").map(Number);
  const c = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

export async function checkForUpdate(): Promise<void> {
  try {
    const current = getLocalVersion();
    const latest = await fetchLatestVersion("controlplane-ai");
    if (latest && isNewer(latest, current)) {
      console.log(`\n  Update available: ${current} → ${latest} — run npx controlplane-ai@latest update\n`);
    }
  } catch {
    // Fail silently
  }
}
