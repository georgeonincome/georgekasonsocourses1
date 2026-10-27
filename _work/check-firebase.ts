/**
 * Read-only Firebase pre-flight check.
 *
 * Answers the three questions that decide whether "Continue with Google" can
 * possibly work:
 *   1. Are the credentials present and valid?
 *   2. Is the Google sign-in provider switched on?
 *   3. Is this site's domain authorised to use it?
 *
 * It creates nothing, changes nothing and moves no data. Safe to run as often
 * as you like — run it after every Firebase Console change.
 *
 *   NODE_OPTIONS=--dns-result-order=ipv4first npx tsx _work/check-firebase.ts
 *
 * The NODE_OPTIONS flag is needed on this machine: it resolves Google to an
 * unreachable IPv6 route first, so Node's fetch() times out where curl
 * succeeds. Harmless to leave on anywhere else.
 */
import crypto from "node:crypto";
import dns from "node:dns";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// This machine resolves Google to an unreachable IPv6 route first, which makes
// Node fetch() fail where curl succeeds. Prefer IPv4.
dns.setDefaultResultOrder("ipv4first");

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
    const i = s.indexOf("=");
    const key = s.slice(0, i).trim();
    const val = s.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (key) out[key] = val;
  }
  return out;
}

const env = loadEnv(".env");

const PUBLIC_KEY = env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";
const AUTH_DOMAIN = env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "";
const PROJECT_ID = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const APP_ID = env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "";
const ADMIN_PROJECT = env.FIREBASE_ADMIN_PROJECT_ID ?? "";
const ADMIN_EMAIL = env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "";
const ADMIN_KEY = env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
const SITE_URL = env.NEXT_PUBLIC_APP_URL ?? "";

const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "";
  }
})();

console.log("════════════════════════════════════════════════════════════════");
console.log("  Firebase pre-flight check (read-only)");
console.log("════════════════════════════════════════════════════════════════\n");

console.log("CONFIG");
console.log(`  project        ${PROJECT_ID || "(missing)"}`);
console.log(`  auth domain    ${AUTH_DOMAIN || "(missing)"}`);
console.log(`  web api key    ${PUBLIC_KEY ? "present" : "(missing)"}`);
console.log(`  app id         ${APP_ID ? "present" : "(missing)"}`);
console.log(`  admin project  ${ADMIN_PROJECT || "(missing)"}`);
console.log(`  admin email    ${ADMIN_EMAIL ? "present" : "(missing)"}`);
console.log(`  admin key      ${ADMIN_KEY ? "present" : "(missing)"}`);
console.log(`  site host      ${SITE_HOST || "(unparsable NEXT_PUBLIC_APP_URL)"}`);

const missing = [
  !PUBLIC_KEY && "NEXT_PUBLIC_FIREBASE_API_KEY",
  !AUTH_DOMAIN && "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  !PROJECT_ID && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  !ADMIN_PROJECT && "FIREBASE_ADMIN_PROJECT_ID",
  !ADMIN_EMAIL && "FIREBASE_ADMIN_CLIENT_EMAIL",
  !ADMIN_KEY && "FIREBASE_ADMIN_PRIVATE_KEY",
].filter(Boolean) as string[];

if (missing.length > 0) {
  console.log(
    `\n✗  Missing: ${missing.join(", ")}\n` +
      "   Google sign-in is off and the button is not rendered.",
  );
  process.exit(0);
}

// ── exchange the service account for a token, then read the Auth config ─────
async function main() {
  const privateKey = ADMIN_KEY.includes("\n")
    ? ADMIN_KEY.replace(/\r\n/g, "\n")
    : ADMIN_KEY.replace(/\\n/g, "\n");

  const { initializeApp, cert, getApps, getApp } = await import("firebase-admin/app");
  const app = getApps().length
    ? getApp()
    : initializeApp(
        {
          credential: cert({
            projectId: ADMIN_PROJECT,
            clientEmail: ADMIN_EMAIL,
            privateKey,
          }),
          projectId: ADMIN_PROJECT,
        },
        "check-firebase",
      );

  const { getAuth } = await import("firebase-admin/auth");

  console.log("\nCREDENTIALS");
  try {
    // Signing locally proves the key parsed and matches the client email,
    // without touching Firebase's servers.
    await getAuth(app).createCustomToken("preflight-check");
    console.log("  service account  OK — key parses and matches the client email");
  } catch (error) {
    console.log(
      `  service account  FAILED — ${error instanceof Error ? error.message : error}`,
    );
    return;
  }

  console.log("\nGOOGLE SIGN-IN PROVIDER");
  const host = "identitytoolkit.googleapis.com";
  const token = await getAuthToken();
  if (!token) return;

  const res = await fetch(`https://${host}/admin/v2/projects/${ADMIN_PROJECT}/config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as {
    signInProviders?: { providerId?: string; provider?: string }[];
    authorizedDomains?: string[];
    error?: { message?: string };
  };

  if (!res.ok) {
    console.log(`  could not read config — ${body.error?.message ?? res.status}`);
    return;
  }

  const providers = (body.signInProviders ?? [])
    .map((p) => p.providerId ?? p.provider ?? "")
    .filter(Boolean);
  const googleOn = providers.some((p) => p.includes("google"));

  console.log(
    googleOn
      ? "  Google  ENABLED"
      : `  Google  NOT ENABLED${providers.length ? ` (found: ${providers.join(", ")})` : ""}`,
  );

  const domains = body.authorizedDomains ?? [];
  console.log(`\nAUTHORISED DOMAINS (${domains.length})`);
  for (const d of domains) console.log(`  - ${d}`);

  if (SITE_HOST) {
    const allowed = domains.includes(SITE_HOST);
    console.log(
      `\n  ${SITE_HOST}  ${allowed ? "AUTHORISED" : "NOT AUTHORISED"}`,
    );
  }

  console.log("\nVERDICT");
  if (!googleOn) {
    console.log(
      "  ✗  Google sign-in is switched off. Firebase Console -> Authentication ->\n" +
        "     Sign-in method -> Google -> Enable -> Save.",
    );
  } else if (SITE_HOST && !domains.includes(SITE_HOST)) {
    console.log(
      `  ✗  Google is enabled, but ${SITE_HOST} is not an authorised domain.\n` +
        "     Firebase Console -> Authentication -> Settings -> Authorised domains\n" +
        "     -> Add domain.",
    );
  } else {
    console.log("  ✓  Google sign-in should work on this domain.");
    console.log("     If the popup still fails, check the OAuth consent screen in\n" +
      "     Google Cloud Console -> APIs & Services -> OAuth consent screen.");
  }
}

/** Mint an access token from the service account without firebase-admin. */
async function getAuthToken(): Promise<string | null> {
  const privateKey = ADMIN_KEY.includes("\n")
    ? ADMIN_KEY.replace(/\r\n/g, "\n")
    : ADMIN_KEY.replace(/\\n/g, "\n");

  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const signingInput = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: ADMIN_EMAIL,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;

  try {
    const signature = crypto
      .sign("RSA-SHA256", Buffer.from(signingInput), privateKey)
      .toString("base64url");
    const jwt = `${signingInput}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };
    if (!json.access_token) {
      console.log(
        `  token exchange failed — ${json.error_description ?? json.error ?? res.status}`,
      );
      return null;
    }
    return json.access_token;
  } catch (error) {
    console.log(
      `  token exchange error — ${error instanceof Error ? error.message : error}`,
    );
    return null;
  }
}

void main();
