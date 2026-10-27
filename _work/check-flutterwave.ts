/**
 * Read-only Flutterwave pre-flight check.
 *
 * Answers the two questions that matter before the site takes real money:
 *   1. Are these keys valid?            -> one GET against Flutterwave
 *   2. Are they TEST or LIVE?           -> key prefix, plus the API's own answer
 *
 * It creates nothing, charges nothing and changes nothing on the account.
 * Safe to run as often as you like.
 *
 *   npx tsx _work/check-flutterwave.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── load .env without a dependency ─────────────────────────────────────────
function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let raw: string;
  try {
    raw = readFileSync(resolve(process.cwd(), path), "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#") || !s.includes("=")) continue;
    const idx = s.indexOf("=");
    const key = s.slice(0, idx).trim();
    const val = s.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (key) out[key] = val;
  }
  return out;
}

const env = loadEnv(".env");

const PUBLIC_KEY = env.FLW_PUBLIC_KEY ?? "";
const SECRET_KEY = env.FLW_SECRET_KEY ?? "";
const SECRET_HASH = env.FLW_SECRET_HASH ?? "";
const ENCRYPTION_KEY = env.FLW_ENCRYPTION_KEY ?? "";

function modeOf(key: string): string {
  if (!key) return "MISSING";
  const upper = key.toUpperCase();
  // Flutterwave marks TEST keys with _TEST inside the key body. Live keys carry
  // no marker at all, so the absence of TEST is what identifies them.
  if (upper.includes("TEST")) return "TEST";
  if (key.startsWith("FLW")) return "LIVE";
  // The encryption key is a bare 24-character hex string, not FLW-prefixed.
  if (/^[0-9a-f]{24}$/i.test(key)) return "LIVE";
  return "UNKNOWN";
}

function mask(key: string): string {
  if (!key) return "(empty)";
  if (key.length <= 12) return key;
  return `${key.slice(0, 10)}…${key.slice(-4)}`;
}

console.log("════════════════════════════════════════════════════════════════");
console.log("  Flutterwave pre-flight check (read-only)");
console.log("════════════════════════════════════════════════════════════════\n");

console.log("KEYS");
console.log(`  FLW_PUBLIC_KEY      ${modeOf(PUBLIC_KEY).padEnd(7)} ${mask(PUBLIC_KEY)}`);
console.log(`  FLW_SECRET_KEY      ${modeOf(SECRET_KEY).padEnd(7)} ${mask(SECRET_KEY)}`);
console.log(`  FLW_ENCRYPTION_KEY  ${modeOf(ENCRYPTION_KEY).padEnd(7)} ${mask(ENCRYPTION_KEY)}`);
console.log(`  FLW_SECRET_HASH     ${SECRET_HASH ? "set    " : "MISSING"} ${mask(SECRET_HASH)}`);

if (env.FLW_WEBHOOK_URL) {
  console.log(`  FLW_WEBHOOK_URL     ${env.FLW_WEBHOOK_URL}`);
}

const allTest = [PUBLIC_KEY, SECRET_KEY, ENCRYPTION_KEY].every((k) => modeOf(k) === "TEST");
const anyMissing = !PUBLIC_KEY || !SECRET_KEY || !SECRET_HASH;

if (anyMissing) {
  console.log("\n⚠  Some keys are missing. The checkout falls back to manual approval.");
  process.exit(0);
}

if (allTest) {
  console.log(
    "\n⚠  These are TEST keys. They will not settle a real card or mobile money\n" +
      "   payment — the checkout will work, but no money moves.\n" +
      "   Dashboard → Settings → API Keys → switch to live.",
  );
}

if (!SECRET_KEY) process.exit(0);

// ── validate against Flutterwave ────────────────────────────────────────────
// GET /v3/transfers is a plain authenticated read: it returns
// {"status":"success"} when the secret key is good, and a 401 when it is not.
// It moves no money and creates nothing.
const API = "https://api.flutterwave.com/v3";

async function probe(path: string, label: string) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
      cache: "no-store",
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    const b = body as { status?: string; message?: string } | null;
    const ok = res.ok && b?.status === "success";
    console.log(
      `\n  ${label}\n    HTTP ${res.status}  ${ok ? "OK" : `FAILED — ${b?.message ?? text.slice(0, 120)}`}`,
    );
    return { ok, status: res.status, body };
  } catch (err) {
    console.log(`\n  ${label}\n    NETWORK ERROR — ${err instanceof Error ? err.message : err}`);
    return { ok: false, status: 0, body: null };
  }
}

console.log("\nAPI CHECKS");

async function main() {
  const transfers = await probe(
    "/transfers?limit=1",
    "GET /v3/transfers — is the secret key accepted?",
  );

  console.log("\nVERDICT");
  if (transfers.ok) {
    console.log("  The secret key is accepted by Flutterwave.");
    if (allTest) {
      console.log("  Mode: TEST — the checkout will run, but no real money will move.");
    } else {
      console.log("  Mode: LIVE — real payments will settle.");
    }
  } else {
    console.log(
      "  The secret key was NOT accepted. Check that it is the live Secret Key\n" +
        "  (not the public key, not the encryption key) and that it was pasted whole.",
    );
  }

  console.log(
    "\n  Before going live you also need:\n" +
      "    • the webhook URL registered in Settings → Webhook URLs, and\n" +
      "    • the secret hash in that same section set to FLW_SECRET_HASH above.\n",
  );
}

void main();
